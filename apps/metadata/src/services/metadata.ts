import { Request } from "express";
import {
  metadataModel,
  assetModel,
  findOne,
  findAll,
  findOneAndUpdate,
  cacheUtil as cache,
  statusCode,
  CustomError,
  metadataMsg,
  Op,
} from "@dam/shared";

const META_CACHE_KEY = "metadata:";

/**
 * Retrieves metadata for a given asset ID.
 * Uses Redis cache-aside pattern to reduce DB load.
 * @param {Request} req - Express request with assetId in params.
 */

export const getMetadata = async (req: Request) => {
  try {
    const { assetId } = req.params;
    const cacheKey = `${META_CACHE_KEY}${assetId}`;

    const cached = await cache.get(cacheKey);
    if (cached) return cached;

    const metadata = await findOne(metadataModel, { assetId: String(assetId) });

    if (!metadata) {
      return new CustomError(metadataMsg.notFound, statusCode.notFound);
    }

    await cache.set(cacheKey, metadata, 3600);
    return metadata;
  } catch (error) {
    return new CustomError((error as Error).message, statusCode.badRequest);
  }
};

/**
 * Updates tags, department, or analysis results for an asset's metadata.
 * Invalidates the cache entry on every update.
 * @param {Request} req - Express request with assetId in params and metadata fields in body.
 */

export const updateMetadata = async (req: Request) => {
  try {
    const { assetId } = req.params;
    const { tags, department, analysisResults, isDuplicate } = req.body;

    const updated = await findOneAndUpdate(
      metadataModel,
      { assetId: String(assetId) },
      { tags, department, analysisResults, isDuplicate },
      undefined,
      true,
    );

    if (!updated) {
      return new CustomError(metadataMsg.notFound, statusCode.notFound);
    }

    await cache.del(`${META_CACHE_KEY}${assetId}`);
    return updated;
  } catch (error) {
    return new CustomError((error as Error).message, statusCode.badRequest);
  }
};

/**
 * Searches assets by metadata tags using Postgres JSONB contains operator.
 * Supports comma-separated tag values: ?tags=brand,product
 * @param {Request} req - Express request with tags query param.
 */

export const searchByTags = async (req: Request) => {
  try {
    const { tags, page = "0", limit = "20" } = req.query;

    if (!tags) {
      return new CustomError(metadataMsg.tagsRequired, statusCode.badRequest);
    }

    const tagList = (tags as string).split(",").map((t: string) => t.trim());

    const { result, totalCount } = await findAll(metadataModel, {
      where: {
        tags: { [Op.contains]: tagList },
      },
      include: [{ model: assetModel, as: "asset" }],
      limit: parseInt(limit as string),
      offset: parseInt(page as string) * parseInt(limit as string),
    });

    return { result, totalCount };
  } catch (error) {
    return new CustomError((error as Error).message, statusCode.badRequest);
  }
};

/**
 * Retrieves all assets flagged as duplicates via metadata analysis.
 * @param {Request} req - Express request.
 */

export const getDuplicates = async (req: Request) => {
  try {
    const { limit = "50", offset = "0" } = req.query;

    const { result, totalCount } = await findAll(metadataModel, {
      where: { isDuplicate: true },
      include: [{ model: assetModel, as: "asset" }],
      limit: parseInt(limit as string),
      offset: parseInt(offset as string),
    });

    return { result, totalCount };
  } catch (error) {
    return new CustomError((error as Error).message, statusCode.badRequest);
  }
};
