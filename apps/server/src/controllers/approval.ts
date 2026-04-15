import { Request, Response, NextFunction } from "express";
import {
  requestApproval,
  listApproval,
  getApprovalById,
  approveAsset,
  rejectAsset,
  getApprovalHistory,
} from "../services/approval";
import { sendSuccessResponse, CustomError, statusCode } from "@dam/shared";

/**
 * Controller: Request approval for an asset
 */
export const request = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const result = await requestApproval(req);

    if (result instanceof CustomError) {
      return next(result);
    }

    sendSuccessResponse({
      res,
      statusCode: statusCode.successCreated,
      message: "Approval request created successfully",
      data: result,
    });
  } catch (error) {
    return next(error);
  }
};

/**
 * Controller: List approval requests
 */
export const list = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const result = await listApproval(req);

    if (result instanceof CustomError) {
      return next(result);
    }

    sendSuccessResponse({
      res,
      statusCode: statusCode.success,
      message: "Approvals retrieved successfully",
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
export const getById = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const result = await getApprovalById(req);

    if (result instanceof CustomError) {
      return next(result);
    }

    sendSuccessResponse({
      res,
      statusCode: statusCode.success,
      message: "Approval retrieved successfully",
      data: result,
    });
  } catch (error) {
    return next(error);
  }
};

/**
 * Controller: Approve an asset
 */
export const approve = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const result = await approveAsset(req);

    if (result instanceof CustomError) {
      return next(result);
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
 * Controller: Reject an asset
 */
export const reject = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const result = await rejectAsset(req);

    if (result instanceof CustomError) {
      return next(result);
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
 * Controller: Get approval history for an asset
 */
export const history = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const result = await getApprovalHistory(req);

    if (result instanceof CustomError) {
      return next(result);
    }

    sendSuccessResponse({
      res,
      statusCode: statusCode.success,
      message: "Approval history retrieved successfully",
      data: result.result,
      totalCount: result.totalCount,
    });
  } catch (error) {
    return next(error);
  }
};
