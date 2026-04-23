import path from "path";
import { v4 as uuidv4 } from "uuid";
import {
  Assets,
  assetsModel,
  metadataModel,
  versionModel,
  userModel,
  create,
  findAll,
  findOne,
  findOneAndUpdate,
  deleteRecord,
  uploadFile,
  publishMessage,
  cacheUtil as cache,
  statusCode,
  CustomError,
  assetMsg,
  globalSearch,
  globalFilter,
  globalPagination,
  cacheMsg as cacheKeys,
  RequestWithUser,
  getPresignedUrl,
  getPresignedPutUrl,
  queue,
  enums,
  storage,
} from "@dam/shared";

const BUCKET = storage.bucket;

/**
 * Internal helper to save Assets, Metadata, and Version records,
 * and publish the asset_uploaded event.
 */
const registerAsset = async (req: RequestWithUser, data: Record<string, unknown>) => {
  const {
    filename,
    storageKey,
    size,
    mimetype,
    department,
    usageRights,
    expiryDate,
    collectionId,
  } = data;

  // 1. Create Assets record
  const newAsset = await create<Assets>(assetsModel, {
    filename,
    storageKey,
    owner: req.user?.id,
    size,
    mimetype,
    department,
    usageRights,
    expiryDate: expiryDate || null,
    collectionId: collectionId ? Number(collectionId) : null,
    status: enums.pending,
    currentVersion: 1,
  });

  // 2. Create Metadata record
  await create(metadataModel, {
    assetsId: String(newAsset.id),
    tags: [],
    department: department || "unassigned",
  });

  // 3. Create initial Version record
  await create(versionModel, {
    assetsId: newAsset.id,
    versionNumber: 1,
    storageKey,
    size,
    note: assetMsg.initialUploadNote,
    author: String(req.user?.id),
  });

  // 4. Publish event for async worker processing
  await publishMessage(queue.assetUploaded, {
    assetsId: newAsset.id,
    filename,
    storageKey,
    type: mimetype,
    owner: String(req.user?.id),
    timestamp: new Date().toISOString(),
  });

  // 5. Invalidate assets list cache
  await cache.delByPattern(`${cacheKeys.assetCacheKeyPrefix}*`);

  return newAsset;
};

/**
 * Uploads file buffer to MinIO, then registers assets records.
 * @param {Request} req - Express request with `req.file` from multer.
 */
export const uploadAsset = async (req: RequestWithUser) => {
  try {
    if (!req.file) {
      return new CustomError(assetMsg.noFile, statusCode.badRequest);
    }

    const { buffer, mimetype, originalname, size } = req.file;
    const { department, usageRights, expiryDate, collectionId } = req.body;

    const ext = path.extname(originalname);
    const storageKey = `${storage.uploadsPrefix}${uuidv4()}${ext}`;

    // 1. Store in MinIO
    await uploadFile(BUCKET, storageKey, buffer, mimetype);

    // 2. Register DB records and publish event
    return await registerAsset(req, {
      filename: originalname,
      storageKey,
      size,
      mimetype,
      department,
      usageRights,
      expiryDate,
      collectionId,
    });
  } catch (error) {
    return new CustomError((error as Error).message, statusCode.badRequest);
  }
};

/**
 * Lists assets with search, filter, sort, and pagination.
 * Results are cached in Redis with a unique key per query.
 */
export const listAsset = async (req: RequestWithUser) => {
  try {
    const filterCondition = globalFilter(req, ["status", "owner", "department", "collectionId"]);
    const { limit, offset } = globalPagination(req);
    const searchConditions = globalSearch(req.query.searchKey as string, assetsModel);
    const sortKey = (req.query.sortKey as string) || "createdAt";
    const sortOrder = (req.query.sortOrder as string) === "DESC" ? "DESC" : "ASC";

    const cacheKey = `${cacheKeys.assetListCacheKey}:${JSON.stringify(req.query)}`;
    const cached = await cache.get(cacheKey);
    if (cached) return cached;

    const { result, totalCount } = await findAll(assetsModel, {
      where: { ...searchConditions, ...filterCondition },
      limit: limit ?? 20,
      offset: offset ?? 0,
      order: [[sortKey, sortOrder]],
      include: [
        { model: metadataModel, as: "metadata" },
        { model: userModel, as: "uploader", attributes: ["id", "name", "email"] },
      ],
    });

    const response = { result, totalCount };
    await cache.set(cacheKey, response);
    return response;
  } catch (error) {
    return new CustomError((error as Error).message, statusCode.badRequest);
  }
};

/**
 * Retrieves a single assets with metadata and version history.
 * Caches result per assets ID.
 */
export const getAsset = async (req: RequestWithUser) => {
  try {
    const { id } = req.params;

    const cacheKey = `${cacheKeys.assetCacheKeyPrefix}${id}`;

    const cached = await cache.get(cacheKey);
    if (cached) return cached;

    const assetsData = await findOne(
      assetsModel,
      { id },
      {
        include: [
          { model: metadataModel, as: "metadata" },
          { model: versionModel, as: "versions" },
          { model: userModel, as: "uploader", attributes: ["id", "name", "email"] },
        ],
        raw: false,
      },
    );

    if (!assetsData) return new CustomError(assetMsg.notFound, statusCode.notFound);

    await cache.set(cacheKey, assetsData);
    return assetsData;
  } catch (error) {
    return new CustomError((error as Error).message, statusCode.badRequest);
  }
};

/**
 * Updates mutable metadata fields of an assets and invalidates cache.
 */
export const updateAsset = async (req: RequestWithUser) => {
  try {
    const { id } = req.params;
    const { department, usageRights, expiryDate, collectionId } = req.body;

    const updated = await findOneAndUpdate(
      assetsModel,
      { id: Number(id) },
      { department, usageRights, expiryDate, collectionId },
      undefined,
      true,
    );

    if (!updated) return new CustomError(assetMsg.notFound, statusCode.notFound);

    await cache.del(`${cacheKeys.assetCacheKeyPrefix}${id}`);
    await cache.delByPattern(`${cacheKeys.assetListCacheKey}*`);
    return updated;
  } catch (error) {
    return new CustomError((error as Error).message, statusCode.badRequest);
  }
};

/**
 * Transitions the assets through its lifecycle states and invalidates cache.
 */
export const updateStatus = async (req: RequestWithUser) => {
  try {
    const { id } = req.params;
    const { status } = req.body;

    const updated = await findOneAndUpdate(
      assetsModel,
      { id: Number(id) },
      { status },
      undefined,
      true,
    );

    if (!updated) return new CustomError(assetMsg.notFound, statusCode.notFound);

    await cache.del(`${cacheKeys.assetCacheKeyPrefix}${id}`);
    await cache.delByPattern(`${cacheKeys.assetListCacheKey}*`);
    return updated;
  } catch (error) {
    return new CustomError((error as Error).message, statusCode.badRequest);
  }
};

/**
 * Permanently deletes an assets record and clears its cache entries.
 */
export const deleteAsset = async (req: RequestWithUser) => {
  try {
    const { id } = req.params;

    const count = await deleteRecord(assetsModel, { id: Number(id) });
    if (count === 0) return new CustomError(assetMsg.notFound, statusCode.notFound);

    await cache.del(`${cacheKeys.assetCacheKeyPrefix}${id}`);
    await cache.delByPattern(`${cacheKeys.assetListCacheKey}*`);
    return true;
  } catch (error) {
    return new CustomError((error as Error).message, statusCode.badRequest);
  }
};

/**
 * Uploads a new version of an existing assets.
 * Increments the version number and stores the new file.
 */
export const uploadVersion = async (req: RequestWithUser) => {
  try {
    const { id } = req.params;
    if (!req.file) {
      return new CustomError(assetMsg.noFile, statusCode.badRequest);
    }

    const assetsData = await findOne(assetsModel, { id: Number(id) });
    if (!assetsData) return new CustomError(assetMsg.notFound, statusCode.notFound);

    const { buffer, mimetype, originalname, size } = req.file;
    const nextVersion = assetsData.currentVersion + 1;

    const ext = path.extname(originalname);
    const storageKey = `${storage.versionsPrefix}${id}_v${nextVersion}${ext}`;

    // 1. Store in MinIO
    await uploadFile(BUCKET, storageKey, buffer, mimetype);

    // 2. Create version record
    await create(versionModel, {
      assetsId: assetsData.id,
      versionNumber: nextVersion,
      storageKey,
      size,
      note: req.body.note || `Update to version ${nextVersion}`,
      author: String(req.user?.id),
    });

    // 3. Update main assets record
    const updated = await findOneAndUpdate(
      assetsModel,
      { id: assetsData.id },
      {
        currentVersion: nextVersion,
        storageKey, // Point main assets to latest version
        size,
        mimetype,
      },
      undefined,
      true,
    );

    // 4. Trigger async processing for the new version
    await publishMessage(queue.assetUploaded, {
      assetsId: assetsData.id,
      filename: originalname,
      storageKey,
      type: mimetype,
      owner: String(req.user?.id),
      timestamp: new Date().toISOString(),
    });

    // 5. Cache invalidation
    await cache.del(`${cacheKeys.assetCacheKeyPrefix}${id}`);
    await cache.delByPattern(`${cacheKeys.assetListCacheKey}*`);

    return updated;
  } catch (error) {
    return new CustomError((error as Error).message, statusCode.badRequest);
  }
};

/**
 * Generates a presigned URL for downloading an asset.
 */
export const getDownloadUrl = async (req: RequestWithUser) => {
  try {
    const { id } = req.params;
    const assetsData = await findOne(assetsModel, { id: Number(id) });
    if (!assetsData) return new CustomError(assetMsg.notFound, statusCode.notFound);

    const url = await getPresignedUrl(BUCKET, assetsData.storageKey);
    return { downloadUrl: url };
  } catch (error) {
    return new CustomError((error as Error).message, statusCode.badRequest);
  }
};

/**
 * Generates a presigned PUT URL for direct client upload.
 */
export const getPresignedUploadUrl = async (req: RequestWithUser) => {
  try {
    const { filename, mimetype } = req.body;
    if (!filename || !mimetype) {
      return new CustomError("Filename and mimetype are required", statusCode.badRequest);
    }

    const ext = path.extname(filename);
    const storageKey = `${storage.uploadsPrefix}${uuidv4()}${ext}`;

    const url = await getPresignedPutUrl(BUCKET, storageKey);
    return { uploadUrl: url, storageKey };
  } catch (error) {
    return new CustomError((error as Error).message, statusCode.badRequest);
  }
};

/**
 * Finalizes direct upload by registering the asset in the database.
 */
export const registerDirectUpload = async (req: RequestWithUser) => {
  try {
    const { filename, storageKey, size, mimetype } = req.body;

    if (!filename || !storageKey || !size || !mimetype) {
      return new CustomError("Missing required fields for registration", statusCode.badRequest);
    }

    return await registerAsset(req, req.body);
  } catch (error) {
    return new CustomError((error as Error).message, statusCode.badRequest);
  }
};
