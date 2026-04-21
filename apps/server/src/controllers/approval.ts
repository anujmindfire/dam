import { Response, NextFunction } from "express";
import {
  requestApproval,
  listApproval,
  getApprovalById,
  approveAsset,
  rejectAsset,
  getApprovalHistory,
} from "../services/approval";
import {
  sendSuccessResponse,
  CustomError,
  statusCode,
  approvalMsg,
  RequestWithUser,
} from "@dam/shared";

/**
 * Controller: Request approval for an assets
 */
export const request = async (
  req: RequestWithUser,
  res: Response,
  next: NextFunction,
): Promise<void> => {
  try {
    const result = await requestApproval(req);

    if (result instanceof CustomError) {
      return next(new CustomError(result.message, result.statusCode));
    }

    sendSuccessResponse({
      res,
      statusCode: statusCode.successCreated,
      message: approvalMsg.createSuccess,
      data: result,
    });
  } catch (error) {
    return next(error);
  }
};

/**
 * Controller: List approval requests
 */
export const list = async (
  req: RequestWithUser,
  res: Response,
  next: NextFunction,
): Promise<void> => {
  try {
    const result = await listApproval(req);

    if (result instanceof CustomError) {
      return next(new CustomError(result.message, result.statusCode));
    }

    sendSuccessResponse({
      res,
      statusCode: statusCode.success,
      message: approvalMsg.listSuccess,
      data: result.result,
      totalCount: result.totalCount,
    });
  } catch (error) {
    return next(error);
  }
};

/**
 * Controller: Get approval by ID
 */
export const getById = async (
  req: RequestWithUser,
  res: Response,
  next: NextFunction,
): Promise<void> => {
  try {
    const result = await getApprovalById(req);

    if (result instanceof CustomError) {
      return next(new CustomError(result.message, result.statusCode));
    }

    sendSuccessResponse({
      res,
      statusCode: statusCode.success,
      message: approvalMsg.getSuccess,
      data: result,
    });
  } catch (error) {
    return next(error);
  }
};

/**
 * Controller: Approve an assets
 */
export const approve = async (
  req: RequestWithUser,
  res: Response,
  next: NextFunction,
): Promise<void> => {
  try {
    const result = await approveAsset(req);

    if (result instanceof CustomError) {
      return next(new CustomError(result.message, result.statusCode));
    }

    sendSuccessResponse({
      res,
      statusCode: statusCode.success,
      message: result.message,
      data: result,
    });
  } catch (error) {
    return next(error);
  }
};

/**
 * Controller: Reject an assets
 */
export const reject = async (
  req: RequestWithUser,
  res: Response,
  next: NextFunction,
): Promise<void> => {
  try {
    const result = await rejectAsset(req);

    if (result instanceof CustomError) {
      return next(new CustomError(result.message, result.statusCode));
    }

    sendSuccessResponse({
      res,
      statusCode: statusCode.success,
      message: result.message,
      data: result,
    });
  } catch (error) {
    return next(error);
  }
};

/**
 * Controller: Get approval history for an assets
 */
export const history = async (
  req: RequestWithUser,
  res: Response,
  next: NextFunction,
): Promise<void> => {
  try {
    const result = await getApprovalHistory(req);

    if (result instanceof CustomError) {
      return next(new CustomError(result.message, result.statusCode));
    }

    sendSuccessResponse({
      res,
      statusCode: statusCode.success,
      message: approvalMsg.historySuccess,
      data: result.result,
      totalCount: result.totalCount,
    });
  } catch (error) {
    return next(error);
  }
};
