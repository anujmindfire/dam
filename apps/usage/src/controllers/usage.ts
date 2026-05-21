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
  RequestWithUser,
  generateSystemReport,
  logger,
} from "@dam/shared";

/**
 * POST /usage/track — Logs an assets usage event.
 */
export const track = async (
  req: RequestWithUser,
  res: Response,
  next: NextFunction,
): Promise<void> => {
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
 * GET /usage/:assetsId — Returns paginated usage logs for a specific assets.
 */
export const getByAsset = async (
  req: RequestWithUser,
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
export const list = async (
  req: RequestWithUser,
  res: Response,
  next: NextFunction,
): Promise<void> => {
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
    const user = (req as any).user;
    const filters = {
      ...req.query,
      userId: user?.id,
      isAdmin: user?.roleId === 1,
    };
    const result = await getSystemOverview(filters);

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
 * Returns the latest report or generates a new one synchronously if missing.
 */
export const triggerReport = async (
  req: Request,
  res: Response,
  next: NextFunction,
): Promise<void> => {
  try {
    // Try to get latest existing report
    let cachedReport = await redis.get("system:report:latest");
    let data = cachedReport ? JSON.parse(cachedReport) : null;

    if (!data) {
      // If no report exists at all, generate it NOW synchronously
      logger.info("[Usage API] No cached report found. Generating synchronously...");
      data = await generateSystemReport();
    } else {
      // If it exists, return it but also trigger a refresh in background for NEXT time
      await publishMessage("report_generation", { requestedBy: (req as any).user?.id });
    }

    sendSuccessResponse({
      res,
      statusCode: statusCode.success,
      message: "Intelligence report generated and ready for download.",
      data,
    });
  } catch (error) {
    return next(error);
  }
};
