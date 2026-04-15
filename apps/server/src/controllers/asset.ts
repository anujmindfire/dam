import { Request, Response, NextFunction } from "express";
import { 
  createAsset,
  listAsset, 
  getAssetById, 
  updateAsset, 
  updateStatus, 
  deleteAsset 
} from "../services/asset";
import { uploadAsset } from "../services/upload";
import { 
  sendSuccessResponse, 
  CustomError, 
  statusCode, 
  asset as assetMsg 
} from "@dam/shared";

/**
 * API Endpoint: Create a new asset record.
 * Initializes the asset in the database, including metadata and first version.
 */

export const create = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const result = await createAsset(req);

    if (result instanceof CustomError) {
      return next(new CustomError(result.message, result.statusCode));
    }

    sendSuccessResponse({
      res,
      statusCode: statusCode.successCreated,
      message: assetMsg.createSuccess,
      data: result,
    });
  } catch (error) {
    return next(error);
  }
};

/**
 * API Endpoint: Upload a file to MinIO and create the asset record.
 * Requires a multipart/form-data request with a 'file' field.
 */

export const upload = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const result = await uploadAsset(req);

    if (result instanceof CustomError) {
      return next(new CustomError(result.message, result.statusCode));
    }

    sendSuccessResponse({
      res,
      statusCode: statusCode.successCreated,
      message: assetMsg.createSuccess,
      data: result,
    });
  } catch (error) {
    return next(error);
  }
};

/**
 * API Endpoint: List assets.
 * Supports metadata searching, status filtering, and pagination.
 */

export const list = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const result = await listAsset(req);

    if (result instanceof CustomError) {
      return next(new CustomError(result.message, result.statusCode));
    }

    sendSuccessResponse({
      res,
      statusCode: statusCode.success,
      message: assetMsg.listSuccess,
      data: result.result,
      totalCount: result.totalCount,
    });
  } catch (error) {
    return next(error);
  }
};

/**
 * API Endpoint: Get asset by ID.
 * Retrieves full details including associated metadata and versions.
 */

export const getById = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const result = await getAssetById(req);

    if (result instanceof CustomError) {
      return next(new CustomError(result.message, result.statusCode));
    }

    sendSuccessResponse({
      res,
      statusCode: statusCode.success,
      message: assetMsg.getSuccess,
      data: result,
    });
  } catch (error) {
    return next(error);
  }
};

/**
 * API Endpoint: Update asset metadata.
 * Updates fields like department, usage rights, and expiry date.
 */

export const update = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const result = await updateAsset(req);

    if (result instanceof CustomError) {
      return next(new CustomError(result.message, result.statusCode));
    }

    sendSuccessResponse({
      res,
      statusCode: statusCode.success,
      message: assetMsg.updateSuccess,
      data: result,
    });
  } catch (error) {
    return next(error);
  }
};

/**
 * API Endpoint: Update asset lifecycle status.
 * Transitions the asset to a new state (e.g., pending -> approved).
 */

export const transitionStatus = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const result = await updateStatus(req);

    if (result instanceof CustomError) {
      return next(new CustomError(result.message, result.statusCode));
    }

    sendSuccessResponse({
      res,
      statusCode: statusCode.success,
      message: assetMsg.statusUpdateSuccess,
      data: result,
    });
  } catch (error) {
    return next(error);
  }
};

/**
 * API Endpoint: Delete an asset.
 */

export const remove = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const result = await deleteAsset(req);

    if (result instanceof CustomError) {
      return next(new CustomError(result.message, result.statusCode));
    }

    sendSuccessResponse({
      res,
      statusCode: statusCode.success,
      message: assetMsg.deleted,
    });
  } catch (error) {
    return next(error);
  }
};
