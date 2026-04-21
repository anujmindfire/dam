import { Response, NextFunction } from "express";
import { listJobs } from "../services/job";
import { sendSuccessResponse, CustomError, statusCode, RequestWithUser } from "@dam/shared";

/**
 * Controller: List all background jobs
 */
export const list = async (
  req: RequestWithUser,
  res: Response,
  next: NextFunction,
): Promise<void> => {
  try {
    const result = await listJobs(req);

    if (result instanceof CustomError) {
      return next(new CustomError(result.message, result.statusCode));
    }

    sendSuccessResponse({
      res,
      statusCode: statusCode.success,
      message: "Jobs retrieved successfully",
      data: result.result,
      totalCount: result.totalCount,
    });
  } catch (error) {
    return next(error);
  }
};
