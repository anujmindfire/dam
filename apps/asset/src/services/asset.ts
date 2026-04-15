import { Request } from "express";
import path from "path";
import { v4 as uuidv4 } from "uuid";
import {
  assetModel,
  metadataModel,
  versionModel,
  create,
  findAll,
  findOne,
  findOneAndUpdate,
  deleteRecord,
  uploadFile,
  publishMessage,
  cache,
  statusCode,
  CustomError,
  asset as assetMsg,
  globalSearch,
  globalFilter,
  globalPagination,
  cache as cacheKeys,
} from "@dam/shared";

const BUCKET = "assets";

/**
 * Uploads file buffer to MinIO, then creates asset + metadata + version records.
 * Finally publishes an `asset_uploaded` event for the worker.
 *
 * @param {Request} req - Express request with `req.file` from multer.
 * @returns {Promise<any | CustomError>}
 */
export const uploadAsset = async (req: Request) => {
  try {
    if (!req.file) {
      return new CustomError("No file provided", statusCode.badRequest);
    }

    const { buffer, mimetype, originalname, size } = req.file;
    const { department, usageRights, expiryDate, collectionId } = req.body;

    const ext = path.extname(originalname);
    const storageKey = `uploads/${uuidv4()}${ext}`;

    // 1. Store in MinIO
    await uploadFile(BUCKET, storageKey, buffer, mimetype);

    // 2. Create Asset record
    const newAsset = await create(assetModel, {
      filename: originalname,
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

    // 3. Create Metadata record
    await create(metadataModel, {
      assetId: String(newAsset.id),
      tags: [],
      department: department || "unassigned",
    });

    // 4. Create initial Version record
    await create(versionModel, {
      assetId: newAsset.id,
      versionNumber: 1,
      storageKey,
      size,
      note: "Initial upload",
      author: String(req.user?.id || "system"),
    });

    // 5. Publish event for async worker processing
    await publishMessage("asset_uploaded", {
      assetId: newAsset.id,
      filename: originalname,
      storageKey,
      type: mimetype,
      owner: String(req.user?.id),
      timestamp: new Date().toISOString(),
    });

    // 6. Invalidate asset list cache
    await cache.delByPattern(`${cacheKeys.assetCacheKeyPrefix}*`);

    return newAsset;
  } catch (error) {
    return new CustomError((error as Error).message, statusCode.badRequest);
  }
};

/**
 * Creates an asset record from existing storageKey (no file upload).
 * Used when file is pre-uploaded externally.
 */
export const createAsset = async (req: Request) => {
  try {
    const { filename, storageKey, size, mimetype, department, usageRights, expiryDate, collectionId } = req.body;

    const newAsset = await create(assetModel, {
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

    await create(metadataModel, {
      assetId: String(newAsset.id),
      tags: [],
      department: department || "unassigned",
    });

    await create(versionModel, {
      assetId: newAsset.id,
      versionNumber: 1,
      storageKey,
      size,
      note: "Initial upload",
      author: String(req.user?.id || "system"),
    });

    await publishMessage("asset_uploaded", {
      assetId: newAsset.id,
      filename,
      storageKey,
      type: mimetype,
      owner: String(req.user?.id),
      timestamp: new Date().toISOString(),
    });

    await cache.delByPattern(`${cacheKeys.assetCacheKeyPrefix}*`);
    return newAsset;
  } catch (error) {
    return new CustomError((error as Error).message, statusCode.badRequest);
  }
};

/**
 * Lists assets with search, filter, sort, and pagination.
 * Results are cached in Redis with a unique key per query.
 */
export const listAsset = async (req: Request) => {
  try {
    const filterCondition = globalFilter(req, ["status", "owner", "department", "collectionId"]);
    const { limit, offset } = globalPagination(req);
    const searchConditions = globalSearch(req.query.searchKey as string, assetModel);
    const sortKey = (req.query.sortKey as string) || "createdAt";
    const sortOrder = (req.query.sortOrder as string) === "DESC" ? "DESC" : "ASC";

    const cacheKey = `${cacheKeys.assetListCacheKey}:${JSON.stringify(req.query)}`;
    const cached = await cache.get(cacheKey);
    if (cached) return cached;

    const { result, totalCount } = await findAll(assetModel, {
      where: { ...searchConditions, ...filterCondition },
      limit: limit ?? 20,
      offset: offset ?? 0,
      order: [[sortKey, sortOrder]],
      include: [{ model: metadataModel, as: "metadata" }],
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
export const getAsset = async (req: Request) => {
  try {
    const { id } = req.params;
    const cacheKey = `${cacheKeys.assetCacheKeyPrefix}${id}`;

    const cached = await cache.get(cacheKey);
    if (cached) return cached;

    const asset = await findOne(assetModel, { id }, {
      include: [
        { model: metadataModel, as: "metadata" },
        { model: versionModel, as: "versions" },
      ],
      raw: false,
    });

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
export const updateAsset = async (req: Request) => {
  try {
    const { id } = req.params;
    const { department, usageRights, expiryDate, collectionId } = req.body;

    const updated = await findOneAndUpdate(
      assetModel,
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
export const updateStatus = async (req: Request) => {
  try {
    const { id } = req.params;
    const { status } = req.body;

    const updated = await findOneAndUpdate(
      assetModel,
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
export const deleteAsset = async (req: Request) => {
  try {
    const { id } = req.params;

    const count = await deleteRecord(assetModel, { id: Number(id) });
    if (count === 0) return new CustomError(assetMsg.notFound, statusCode.notFound);

    await cache.del(`${cacheKeys.assetCacheKeyPrefix}${id}`);
    await cache.delByPattern(`${cacheKeys.assetListCacheKey}*`);
    return true;
  } catch (error) {
    return new CustomError((error as Error).message, statusCode.badRequest);
  }
};
