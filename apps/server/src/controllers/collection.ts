import { Request, Response, NextFunction } from "express";
import { 
  createCollection, 
  listCollection, 
  getCollectionById, 
  updateCollection, 
  deleteCollection, 
  addAssetToCollection as addAssetService 
} from "../services/collection";
import { 
  sendSuccessResponse, 
  CustomError, 
  statusCode, 
  collection as collectionMsg 
} from "@dam/shared";

/**
 * API Endpoint: Create a new collection or folder.
 * Extracts data from the request body and delegates the creation logic to the
 * Collection service. Sends a success response with the newly created record.
 * @param {Request} req - Express request object.
 * @param {Response} res - Express response object.
 * @param {NextFunction} next - Express next function for error handling.
 */

export const create = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const result = await createCollection(req);

    if (result instanceof CustomError) {
      return next(new CustomError(result.message, result.statusCode));
    }

    sendSuccessResponse({
      res,
      statusCode: statusCode.successCreated,
      message: collectionMsg.createSuccess,
      data: result,
    });
  } catch (error) {
    return next(error);
  }
};

/**
 * API Endpoint: List collections for the logged-in user.
 * Retrieves collections from the service layer, supporting hierarchy-based filtering.
 * @param {Request} req - Express request object.
 * @param {Response} res - Express response object.
 * @param {NextFunction} next - Express next function.
 */

export const list = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const result = await listCollection(req);

    if (result instanceof CustomError) {
      return next(new CustomError(result.message, result.statusCode));
    }

    sendSuccessResponse({
      res,
      statusCode: statusCode.success,
      message: collectionMsg.listSuccess,
      data: result.result,
      totalCount: result.totalCount,
    });
  } catch (error) {
    return next(error);
  }
};

/**
 * API Endpoint: Get details of a specific collection.
 * Fetches a single collection record including its assets and sub-folders.
 * @param {Request} req - Express request object.
 * @param {Response} res - Express response object.
 * @param {NextFunction} next - Express next function.
 */

export const getById = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const result = await getCollectionById(req);

    if (result instanceof CustomError) {
      return next(new CustomError(result.message, result.statusCode));
    }

    sendSuccessResponse({
      res,
      statusCode: statusCode.success,
      message: collectionMsg.getSuccess,
      data: result,
    });
  } catch (error) {
    return next(error);
  }
};

/**
 * API Endpoint: Update an existing collection. 
 * Applies partial or full updates to a collection's properties via the service layer.
 * @param {Request} req - Express request object.
 * @param {Response} res - Express response object.
 * @param {NextFunction} next - Express next function.
 */

export const update = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const result = await updateCollection(req);

    if (result instanceof CustomError) {
      return next(new CustomError(result.message, result.statusCode));
    }

    sendSuccessResponse({
      res,
      statusCode: statusCode.success,
      message: collectionMsg.updateSuccess,
      data: result,
    });
  } catch (error) {
    return next(error);
  }
};

/**
 * API Endpoint: Delete a collection.
 * Removes a collection record after validating ownership.
 * @param {Request} req - Express request object.
 * @param {Response} res - Express response object.
 * @param {NextFunction} next - Express next function.
 */

export const remove = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const result = await deleteCollection(req);

    if (result instanceof CustomError) {
      return next(new CustomError(result.message, result.statusCode));
    }

    sendSuccessResponse({
      res,
      statusCode: statusCode.success,
      message: collectionMsg.deleted,
    });
  } catch (error) {
    return next(error);
  }
};

/**
 * API Endpoint: Add an asset to a collection.
 * Links an asset to a group by updating its parent collection ID.
 * @param {Request} req - Express request object.
 * @param {Response} res - Express response object.
 * @param {NextFunction} next - Express next function.
 */

export const addAssetToCollection = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const result = await addAssetService(req);

    if (result instanceof CustomError) {
      return next(new CustomError(result.message, result.statusCode));
    }

    sendSuccessResponse({
      res,
      statusCode: statusCode.success,
      message: collectionMsg.assetAdded,
      data: result,
    });
  } catch (error) {
    return next(error);
  }
};
