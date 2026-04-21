import { Request, Response, NextFunction } from "express";
import { trackUsage, getAssetUsage, getAllUsage } from "../services/usage";
import { getSystemOverview, getComplianceReport } from "../services/analytics";
import {
  sendSuccessResponse,
  CustomError,
  statusCode,
  commonMsg,
  usageMsg,
  publishMessage,
  redis,
} from "@dam/shared";

/**
 * POST /usage/track — Logs an asset usage event.
 */
export const track = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const result = await trackUsage(req);

    sendSuccessResponse({
      res,
      statusCode: statusCode.successCreated,
      message: usageMsg.trackSuccess,
      data: result,
    });
  } catch (error) {
    return next(error);
  }
};

/**
 * GET /usage/:assetsId — Returns paginated usage logs for a specific asset.
 */
export const getByAsset = async (
  req: Request,
  res: Response,
  next: NextFunction,
): Promise<void> => {
  try {
    const result = await getAssetUsage(req);

    sendSuccessResponse({
      res,
      statusCode: statusCode.success,
      message: commonMsg.apiSuccessMessage,
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

    sendSuccessResponse({
      res,
      statusCode: statusCode.success,
      message: commonMsg.apiSuccessMessage,
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

    sendSuccessResponse({
      res,
      statusCode: statusCode.success,
      message: commonMsg.apiSuccessMessage,
      data: result,
    });
  } catch (error) {
    return next(error);
  }
};

/**
 * GET /analytics/compliance — Compliance and flag metrics.
 */
export const compliance = async (
  req: Request,
  res: Response,
  next: NextFunction,
): Promise<void> => {
  try {
    const result = await getComplianceReport();

    sendSuccessResponse({
      res,
      statusCode: statusCode.success,
      message: commonMsg.apiSuccessMessage,
      data: result,
    });
  } catch (error) {
    return next(error);
  }
};

/**
 * GET /analytics/report — Detailed system freshness and compliance report.
 * Returns the latest precomputed report from cache.
 */
export const report = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const cachedReport = await redis.get("system:report:latest");

    if (!cachedReport) {
      // If no report cached, trigger one and inform user
      await publishMessage("report_generation", { requestedBy: (req as any).user?.id });
      return next(
        new CustomError(
          "Report is being generated. Please try again in a few moments.",
          statusCode.accepted,
        ),
      );
    }

    sendSuccessResponse({
      res,
      statusCode: statusCode.success,
      message: commonMsg.reportSuccess,
      data: JSON.parse(cachedReport),
    });
  } catch (error) {
    return next(error);
  }
};

/**
 * POST /analytics/report/trigger — Manually triggers a background report generation jobs.
 */
export const triggerReport = async (
  req: Request,
  res: Response,
  next: NextFunction,
): Promise<void> => {
  try {
    await publishMessage("report_generation", { requestedBy: (req as any).user?.id });

    sendSuccessResponse({
      res,
      statusCode: statusCode.accepted,
      message: "Report generation triggered successfully",
    });
  } catch (error) {
    return next(error);
  }
};
