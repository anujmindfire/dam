import { Request, Response, NextFunction } from "express";
import {
  uploadAsset,
  listAsset,
  getAsset,
  updateAsset,
  updateStatus,
  deleteAsset,
  uploadVersion as uploadVersionService,
  getDownloadUrl,
  getPresignedUploadUrl,
  registerDirectUpload,
} from "../services/assets";
import {
  sendSuccessResponse,
  CustomError,
  statusCode,
  assetMsg,
  RequestWithUser,
  getPresignedUrl,
} from "@dam/shared";

/**
 * POST /upload — Handles multipart file upload → MinIO → DB records → RabbitMQ event.
 */
export const upload = async (
  req: RequestWithUser,
  res: Response,
  next: NextFunction,
): Promise<void> => {
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
      data: (result as { result: unknown[] }).result,
      totalCount: (result as { totalCount: number }).totalCount,
    });
  } catch (error) {
    return next(error);
  }
};

/**
 * GET /:id — Returns assets with metadata and version history.
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
 * PATCH /:id — Updates assets metadata fields.
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
 * PATCH /:id/status — Transitions assets lifecycle state.
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
 * DELETE /:id — Deletes assets record.
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
 * POST /:id/version — Uploads a new version of an existing assets.
 */
export const uploadVersion = async (
  req: RequestWithUser,
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
 * GET /:id/download — Returns a presigned URL for downloading the asset.
 */
export const download = async (
  req: RequestWithUser,
  res: Response,
  next: NextFunction,
): Promise<void> => {
  try {
    const result = await getDownloadUrl(req);

    if (result instanceof CustomError) {
      return next(new CustomError(result.message, result.statusCode));
    }

    // Support direct download if token is in query (direct link) or if it's a browser request
    if (req.query.token || req.headers.accept?.includes("text/html")) {
      return res.redirect((result as { downloadUrl: string }).downloadUrl);
    }

    sendSuccessResponse({
      res,
      statusCode: statusCode.success,
      message: assetMsg.downloadSuccess,
      data: result,
    });
  } catch (error) {
    return next(error);
  }
};

/**
 * GET /:id/thumbnail — Returns a presigned URL for the asset thumbnail.
 */
export const thumbnail = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const { id } = req.params;
    const thumbKey = `thumbnails/${id}.webp`;

    try {
      const url = await getPresignedUrl("assets", thumbKey);

      // Support direct preview if token is in query or if it's a browser request
      if (req.query.token || req.headers.accept?.includes("text/html")) {
        return res.redirect(url);
      }

      sendSuccessResponse({
        res,
        statusCode: statusCode.success,
        message: assetMsg.getSuccess,
        data: { thumbnailUrl: url },
      });
    } catch (e) {
      return next(new CustomError("Thumbnail not available", statusCode.notFound));
    }
  } catch (error) {
    return next(error);
  }
};

/**
 * POST /upload/presigned-url — Generates a presigned PUT URL for direct upload.
 */
export const getUploadUrl = async (
  req: RequestWithUser,
  res: Response,
  next: NextFunction,
): Promise<void> => {
  try {
    const result = await getPresignedUploadUrl(req);

    if (result instanceof CustomError) {
      return next(new CustomError(result.message, result.statusCode));
    }

    sendSuccessResponse({
      res,
      statusCode: statusCode.success,
      message: assetMsg.uploadUrlSuccess,
      data: result,
    });
  } catch (error) {
    return next(error);
  }
};

/**
 * POST /upload/complete — Finalizes asset registration after direct upload.
 */
export const completeUpload = async (
  req: RequestWithUser,
  res: Response,
  next: NextFunction,
): Promise<void> => {
  try {
    const result = await registerDirectUpload(req);

    if (result instanceof CustomError) {
      return next(new CustomError(result.message, result.statusCode));
    }

    sendSuccessResponse({
      res,
      statusCode: statusCode.successCreated,
      message: assetMsg.directUploadSuccess,
      data: result,
    });
  } catch (error) {
    return next(error);
  }
};
