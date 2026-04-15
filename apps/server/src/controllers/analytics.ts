import { Request, Response, NextFunction } from "express";
import { getSystemOverview, getComplianceReport } from "../services/analytics";
import { trackUsage, getAssetUsage } from "../services/usage";
import { sendSuccessResponse, CustomError, statusCode, common, asset as assetMsg } from "@dam/shared";

/**
 * GET /api/v1/stats/overview
 * Returns high-level dashboard analytics: total assets, status distribution, usage trends.
 */
export const overview = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const result = await getSystemOverview();

    if (result instanceof CustomError) return next(result);

    sendSuccessResponse({
      res,
      statusCode: statusCode.success,
      message: common.apiSuccessMessage,
      data: result,
    });
  } catch (error) {
    return next(error);
  }
};

/**
 * GET /api/v1/stats/compliance
 * Returns compliance metrics: status breakdown, duplicates, at-risk counts.
 */
export const compliance = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const result = await getComplianceReport();

    if (result instanceof CustomError) return next(result);

    sendSuccessResponse({
      res,
      statusCode: statusCode.success,
      message: common.apiSuccessMessage,
      data: result,
    });
  } catch (error) {
    return next(error);
  }
};

/**
 * POST /api/v1/stats/track
 * Logs a usage event for a specific asset (view, download, share).
 */
export const track = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const result = await trackUsage(req);

    if (result instanceof CustomError) return next(result);

    sendSuccessResponse({
      res,
      statusCode: statusCode.successCreated,
      message: common.apiSuccessMessage,
      data: result,
    });
  } catch (error) {
    return next(error);
  }
};

/**
 * GET /api/v1/stats/track/:id
 * Returns usage history for a specific asset.
 */
export const usageHistory = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
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
