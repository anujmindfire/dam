import { Request, Response, NextFunction } from "express";
import {
  uploadAsset,
  createAsset,
  listAsset,
  getAsset,
  updateAsset,
  updateStatus,
  deleteAsset,
  uploadVersion as uploadVersionService,
} from "../services/assets";
import { sendSuccessResponse, CustomError, statusCode, assetMsg, minioClient } from "@dam/shared";

/**
 * POST /upload — Handles multipart file upload → MinIO → DB records → RabbitMQ event.
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
 * POST / — Creates asset from existing storageKey without file upload.
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
 * GET / — Lists assets with filtering, search, sort, and pagination.
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
      data: (result as any).result,
      totalCount: (result as any).totalCount,
    });
  } catch (error) {
    return next(error);
  }
};

/**
 * GET /:id — Returns asset with metadata and version history.
 */
export const getById = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const result = await getAsset(req);

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
 * PATCH /:id — Updates asset metadata fields.
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
 * PATCH /:id/status — Transitions asset lifecycle state.
 */
export const transitionStatus = async (
  req: Request,
  res: Response,
  next: NextFunction,
): Promise<void> => {
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
 * DELETE /:id — Deletes asset record.
 */
export const remove = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const result = await deleteAsset(req);

    if (result instanceof CustomError) {
      return next(new CustomError(result.message, result.statusCode));
    }

    sendSuccessResponse({ res, statusCode: statusCode.success, message: assetMsg.deleted });
  } catch (error) {
    return next(error);
  }
};
/**
 * POST /:id/version — Uploads a new version of an existing asset.
 */
export const uploadVersion = async (
  req: Request,
  res: Response,
  next: NextFunction,
): Promise<void> => {
  try {
    const result = await uploadVersionService(req);

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
 * GET /:id/download — Streams the asset file to the client.
 */
export const download = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const result = await getAsset(req);

    if (result instanceof CustomError) {
      return next(new CustomError(result.message, result.statusCode));
    }

    const asset = result as any;
    const stream = await minioClient.getObject("assets", asset.storageKey);

    res.setHeader("Content-Type", asset.mimetype);
    res.setHeader("Content-Disposition", `attachment; filename="${asset.filename}"`);

    stream.pipe(res);
  } catch (error) {
    return next(error);
  }
};
