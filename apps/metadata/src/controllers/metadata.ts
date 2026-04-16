import { Request, Response, NextFunction } from "express";
import { getMetadata, updateMetadata, searchByTags, getDuplicates } from "../services/metadata";
import { sendSuccessResponse, CustomError, statusCode, commonMsg, metadataMsg } from "@dam/shared";

/**
 * GET /metadata/:assetId — Returns metadata for an asset (Redis cached).
 */
export const getByAsset = async (
  req: Request,
  res: Response,
  next: NextFunction,
): Promise<void> => {
  try {
    const result = await getMetadata(req);
    if (result instanceof CustomError) {
      return next(new CustomError(result.message, result.statusCode));
    }
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
 * PATCH /metadata/:assetId — Updates tags, department, or analysis results.
 */
export const update = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const result = await updateMetadata(req);
    if (result instanceof CustomError) {
      return next(new CustomError(result.message, result.statusCode));
    }
    sendSuccessResponse({
      res,
      statusCode: statusCode.success,
      message: metadataMsg.updateSuccess,
      data: result,
    });
  } catch (error) {
    return next(error);
  }
};

/**
 * GET /metadata/search?tags=brand,product — Tag-based asset search.
 */
export const search = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const result = await searchByTags(req);
    if (result instanceof CustomError) {
      return next(new CustomError(result.message, result.statusCode));
    }
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
 * GET /metadata/duplicates — Returns all assets flagged as duplicates.
 */
export const duplicates = async (
  req: Request,
  res: Response,
  next: NextFunction,
): Promise<void> => {
  try {
    const result = await getDuplicates(req);
    if (result instanceof CustomError) {
      return next(new CustomError(result.message, result.statusCode));
    }
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
