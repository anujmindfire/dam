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
} from "@dam/shared";

const BUCKET = "assets";

/**
 * Internal helper to save Assets, Metadata, and Version records,
 * and publish the asset_uploaded event.
 */
const registerAsset = async (req: RequestWithUser, data: any) => {
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
    status: "pending",
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
    note: "Initial upload",
    author: String(req.user?.id || "system"),
  });

  // 4. Publish event for async worker processing
  await publishMessage("asset_uploaded", {
    assetsId: newAsset.id,
    filename,
    storageKey,
    type: mimetype,
    owner: String(req.user?.id),
    timestamp: new Date().toISOString(),
  });

  // 5. Invalidate asset list cache
  await cache.delByPattern(`${cacheKeys.assetCacheKeyPrefix}*`);

  return newAsset;
};

/**
 * Uploads file buffer to MinIO, then registers asset records.
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
    const storageKey = `uploads/${uuidv4()}${ext}`;

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
 * Creates an asset record from existing storageKey (no file upload).
 * Used when file is pre-uploaded externally.
 */
export const createAsset = async (req: RequestWithUser) => {
  try {
    return await registerAsset(req, req.body);
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
 * Retrieves a single asset with metadata and version history.
 * Caches result per asset ID.
 */
export const getAsset = async (req: RequestWithUser) => {
  try {
    const { id } = req.params;

    const cacheKey = `${cacheKeys.assetCacheKeyPrefix}${id}`;

    const cached = await cache.get(cacheKey);
    if (cached) return cached;

    const asset = await findOne(
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

    if (!asset) return new CustomError(assetMsg.notFound, statusCode.notFound);

    await cache.set(cacheKey, asset);
    return asset;
  } catch (error) {
    return new CustomError((error as Error).message, statusCode.badRequest);
  }
};

/**
 * Updates mutable metadata fields of an asset and invalidates cache.
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
 * Transitions the asset through its lifecycle states and invalidates cache.
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
 * Permanently deletes an asset record and clears its cache entries.
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
 * Uploads a new version of an existing asset.
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
    const storageKey = `versions/${id}_v${nextVersion}${ext}`;

    // 1. Store in MinIO
    await uploadFile(BUCKET, storageKey, buffer, mimetype);

    // 2. Create version record
    await create(versionModel, {
      assetsId: assetsData.id,
      versionNumber: nextVersion,
      storageKey,
      size,
      note: req.body.note || `Update to version ${nextVersion}`,
      author: String(req.user?.id || "system"),
    });

    // 3. Update main asset record
    const updated = await findOneAndUpdate(
      assetsModel,
      { id: assetsData.id },
      {
        currentVersion: nextVersion,
        storageKey, // Point main asset to latest version
        size,
        mimetype,
      },
      undefined,
      true,
    );

    // 4. Trigger async processing for the new version
    await publishMessage("asset_uploaded", {
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
