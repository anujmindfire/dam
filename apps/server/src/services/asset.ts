import { Request } from "express";
import {
  Asset as assetModel,
  Metadata as metadataModel,
  AssetVersion as versionModel,
  create,
  findAll,
  findOne,
  findOneAndUpdate,
  deleteRecord,
  statusCode,
  CustomError,
  asset as assetMsg,
  globalSearch,
  globalFilter,
  globalPagination,
  cache,
  publishMessage,
  cache as cacheMsg,
} from "@dam/shared";

const assetCacheKeyPrefix = cacheMsg.assetCacheKeyPrefix;
const assetListCacheKey = cacheMsg.assetListCacheKey;

/**
 * Creates a new asset record along with its initial version and metadata.
 * This method ensures all related records are created synchronously to maintain
 * data integrity before any asynchronous background processing starts.
 * @param {Request} req - Express request object containing asset details.
 * @returns {Promise<any | CustomError>} Created asset record or error.
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
      expiryDate,
      collectionId,
      status: "pending",
      currentVersion: 1,
    });

    if (!newAsset) {
      return new CustomError(assetMsg.notFound, statusCode.badRequest);
    }

    await create(metadataModel, {
      assetId: newAsset.id.toString(),
      tags: [],
      department: department || "unassigned",
    });

    await create(versionModel, {
      assetId: newAsset.id,
      versionNumber: 1,
      storageKey,
      size,
      note: "Initial upload",
      author: req.user?.id,
    });

    // 4. Publish Event for Worker Analysis
    await publishMessage("asset_uploaded", {
      assetId: newAsset.id,
      filename: newAsset.filename,
      type: newAsset.mimetype,
      owner: newAsset.owner,
      timestamp: new Date().toISOString(),
    });

    // 5. Invalidate Caches
    await cache.delByPattern(`${assetCacheKeyPrefix}*`);

    return newAsset;
  } catch (error) {
    return new CustomError((error as Error).message, statusCode.badRequest);
  }
};


/**
 * Lists assets with support for metadata searching and status filtering.
 * @param {Request} req - Express request object with query parameters.
 * @returns {Promise<{result: any[], totalCount: number} | CustomError>} List of assets or error.
 */

export const listAsset = async (req: Request) => {
  try {
    const filterCondition = globalFilter(req, ["status", "owner", "department", "collectionId"]);
    const { limit, offset } = globalPagination(req);
    const searchConditions = globalSearch(req.query.searchKey as string, assetModel);
    const sortKey = (req.query.sortKey as string) || "createdAt";
    const sortOrder = (req.query.sortOrder as string) === "DESC" ? "DESC" : "ASC";

    // Create unique cache key based on query params
    const cacheKey = `${assetListCacheKey}:${JSON.stringify(req.query)}`;
    const cachedData = await cache.get(cacheKey);
    if (cachedData) return cachedData;

    const matchConditions = {
      ...searchConditions,
      ...filterCondition,
    };

    const { result, totalCount } = await findAll(assetModel, {
      where: matchConditions,
      limit: limit ?? 100,
      offset: offset ?? 0,
      order: [[sortKey, sortOrder]],
      include: [{ model: metadataModel, as: "metadata" }],
    });

    const response = { result, totalCount };
    await cache.set(cacheKey, response); // Cache result for 1 hour

    return response;
  } catch (error) {
    return new CustomError((error as Error).message, statusCode.badRequest);
  }
};


/**
 * Retrieves a single asset with full metadata and version history.
 * @param {Request} req - Express request object with asset ID in params.
 * @returns {Promise<any | CustomError>} Asset details or error.
 */

export const getAssetById = async (req: Request) => {
  try {
    const { id } = req.params;
    const cacheKey = `${assetCacheKeyPrefix}${id}`;

    const cachedAsset = await cache.get(cacheKey);
    if (cachedAsset) return cachedAsset;

    const asset = await findOne(assetModel, { id }, {
      include: [
        { model: metadataModel, as: "metadata" },
        { model: versionModel, as: "versions" },
      ],
      raw: false,
    });

    if (!asset) {
      return new CustomError(assetMsg.notFound, statusCode.notFound);
    }

    await cache.set(cacheKey, asset);

    return asset;
  } catch (error) {
    return new CustomError((error as Error).message, statusCode.badRequest);
  }
};


/**
 * Updates an asset's basic metadata fields.
 * @param {Request} req - Express request object with ID in params and metadata in body.
 * @returns {Promise<any | CustomError>} Updated asset or error.
 */

export const updateAsset = async (req: Request) => {
  try {
    const { id } = req.params;
    const { department, usageRights, expiryDate, collectionId } = req.body;

    const updatedAsset = await findOneAndUpdate(
      assetModel,
      { id: Number(id) },
      { department, usageRights, expiryDate, collectionId },
      undefined,
      true
    );

    if (!updatedAsset) {
      return new CustomError(assetMsg.notFound, statusCode.notFound);
    }

    // Publish event for other services
    await publishMessage("asset_updated", {
      assetId: updatedAsset.id,
      changes: { department, usageRights, expiryDate, collectionId },
      updatedBy: req.user?.id,
      timestamp: new Date().toISOString(),
    });

    // Invalidate Caches
    await cache.del(`${assetCacheKeyPrefix}${id}`);
    await cache.delByPattern(`${assetListCacheKey}*`);

    return updatedAsset;
  } catch (error) {
    return new CustomError((error as Error).message, statusCode.badRequest);
  }
};

/**
 * Transitions an asset through its lifecycle states.
 * @param {Request} req - Express request object with status in body.
 * @returns {Promise<any | CustomError>} Updated asset or error.
 */

export const updateStatus = async (req: Request) => {
  try {
    const { id } = req.params;
    const { status } = req.body;

    const updatedAsset = await findOneAndUpdate(
      assetModel,
      { id: Number(id) },
      { status },
      undefined,
      true
    );

    if (!updatedAsset) {
      return new CustomError(assetMsg.notFound, statusCode.notFound);
    }

    // Publish event for status change
    await publishMessage("asset_status_changed", {
      assetId: updatedAsset.id,
      oldStatus: updatedAsset.status,
      newStatus: status,
      changedBy: req.user?.id,
      timestamp: new Date().toISOString(),
    });

    // Invalidate Caches
    await cache.del(`${assetCacheKeyPrefix}${id}`);
    await cache.delByPattern(`${assetListCacheKey}*`);

    return updatedAsset;
  } catch (error) {
    return new CustomError((error as Error).message, statusCode.badRequest);
  }
};

/**
 * Deletes an asset record.
 * @param {Request} req - Express request object with ID in params.
 * @returns {Promise<boolean | CustomError>} Success boolean or error.
 */

export const deleteAsset = async (req: Request) => {
  try {
    const { id } = req.params;

    // Get asset details before deletion for event publishing
    const asset = await findOne(assetModel, { id: Number(id) });
    if (!asset) {
      return new CustomError(assetMsg.notFound, statusCode.notFound);
    }

    const deletedCount = await deleteRecord(assetModel, { id: Number(id) });

    if (deletedCount === 0) {
      return new CustomError(assetMsg.notFound, statusCode.notFound);
    }

    // Publish event for deletion
    await publishMessage("asset_deleted", {
      assetId: asset.id,
      filename: asset.filename,
      deletedBy: req.user?.id,
      timestamp: new Date().toISOString(),
    });

    // Invalidate Caches
    await cache.del(`${assetCacheKeyPrefix}${id}`);
    await cache.delByPattern(`${assetListCacheKey}*`);

    return true;
  } catch (error) {
    return new CustomError((error as Error).message, statusCode.badRequest);
  }
};


