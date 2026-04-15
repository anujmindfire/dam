import { Request, Response, NextFunction } from "express";
import { trackUsage, getAssetUsage, getAllUsage } from "../services/usage";
import { getSystemOverview, getComplianceReport } from "../services/analytics";
import { sendSuccessResponse, CustomError, statusCode, common } from "@dam/shared";

/**
 * POST /usage/track — Logs an asset usage event.
 */
export const track = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const result = await trackUsage(req);
    if (result instanceof CustomError) return next(result);
    sendSuccessResponse({ res, statusCode: statusCode.successCreated, message: "Usage tracked successfully", data: result });
  } catch (error) {
    return next(error);
  }
};

/**
 * GET /usage/:assetId — Returns paginated usage logs for a specific asset.
 */
export const getByAsset = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const result = await getAssetUsage(req);
    if (result instanceof CustomError) return next(result);
    sendSuccessResponse({
      res,
      statusCode: statusCode.success,
      message: common.apiSuccessMessage,
      data: (result as any).result,
      totalCount: (result as any).totalCount,
    });
  } catch (error) {
    return next(error);
  }
};

/**
 * GET /usage — Returns all usage logs across all assets.
 */
export const list = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const result = await getAllUsage(req);
    if (result instanceof CustomError) return next(result);
    sendSuccessResponse({
      res,
      statusCode: statusCode.success,
      message: common.apiSuccessMessage,
      data: (result as any).result,
      totalCount: (result as any).totalCount,
    });
  } catch (error) {
    return next(error);
  }
};

/**
 * GET /analytics/overview — Dashboard-level system analytics.
 */
export const overview = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const result = await getSystemOverview();
    if (result instanceof CustomError) return next(result);
    sendSuccessResponse({ res, statusCode: statusCode.success, message: common.apiSuccessMessage, data: result });
  } catch (error) {
    return next(error);
  }
};

/**
 * GET /analytics/compliance — Compliance and flag metrics.
 */
export const compliance = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const result = await getComplianceReport();
    if (result instanceof CustomError) return next(result);
    sendSuccessResponse({ res, statusCode: statusCode.success, message: common.apiSuccessMessage, data: result });
  } catch (error) {
    return next(error);
  }
};
