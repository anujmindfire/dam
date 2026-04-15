import { Request } from "express";
import {
  usageModel,
  create,
  findAll,
  statusCode,
  CustomError,
} from "@dam/shared";

/**
 * Logs an asset usage event (view, download, share, update).
 * Stores user context including IP and user agent for auditing.
 *
 * @param {Request} req - Express request with assetId, action, context in body.
 * @returns {Promise<any | CustomError>}
 */
export const trackUsage = async (req: Request) => {
  try {
    const { assetId, action, context } = req.body;

    const log = await create(usageModel, {
      assetId: String(assetId),
      action,
      context: {
        ...context,
        userId: req.user?.id,
        ip: req.ip,
        userAgent: req.get("User-Agent"),
      },
      loggedAt: new Date(),
    });

    return log;
  } catch (error) {
    return new CustomError((error as Error).message, statusCode.badRequest);
  }
};

/**
 * Retrieves paginated usage logs for a specific asset.
 *
 * @param {Request} req - Express request with assetId in params.
 * @returns {Promise<any | CustomError>}
 */
export const getAssetUsage = async (req: Request) => {
  try {
    const { assetId } = req.params;
    const { limit = "50", offset = "0" } = req.query;

    const { result, totalCount } = await findAll(usageModel, {
      where: { assetId: String(assetId) },
      order: [["loggedAt", "DESC"]],
      limit: parseInt(limit as string),
      offset: parseInt(offset as string),
    });

    return { result, totalCount };
  } catch (error) {
    return new CustomError((error as Error).message, statusCode.badRequest);
  }
};

/**
 * Retrieves all usage logs across all assets, with pagination.
 *
 * @param {Request} req - Express request with page/limit query.
 * @returns {Promise<any | CustomError>}
 */
export const getAllUsage = async (req: Request) => {
  try {
    const { limit = "100", offset = "0" } = req.query;

    const { result, totalCount } = await findAll(usageModel, {
      order: [["loggedAt", "DESC"]],
      limit: parseInt(limit as string),
      offset: parseInt(offset as string),
    });

    return { result, totalCount };
  } catch (error) {
    return new CustomError((error as Error).message, statusCode.badRequest);
  }
};
