import { Request, Response, NextFunction } from "express";
import { createUser, listUser, updateUser, deleteUser } from "../services/user";
import { sendSuccessResponse, CustomError, statusCode, userMsg } from "@dam/shared";

/**
 * API Endpoint: Create a new user account.
 * Extracts registration data from the request and delegates creation to the UserService.
 * @param {Request} req - Express request object.
 * @param {Response} res - Express response object.
 * @param {NextFunction} next - Express next function.
 */

export const create = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const result = await createUser(req);

    if (result instanceof CustomError) {
      return next(new CustomError(result.message, result.statusCode));
    }

    sendSuccessResponse({
      res,
      statusCode: statusCode.success,
      message: userMsg.createSuccess,
    });
  } catch (error) {
    return next(error);
  }
};

/**
 * API Endpoint: List all users.
 * Retrieves a paginated list of users via the UserService.
 * @param {Request} req - Express request object.
 * @param {Response} res - Express response object.
 * @param {NextFunction} next - Express next function.
 */

export const list = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const result = await listUser(req);

    if (result instanceof CustomError) {
      return next(new CustomError(result.message, result.statusCode));
    }

    sendSuccessResponse({
      res,
      statusCode: statusCode.success,
      message: userMsg.listSuccess,
      totalCount: result.totalCount,
      data: result.result,
    });
  } catch (error) {
    return next(error);
  }
};

/**
 * API Endpoint: Update user profile.
 * Updates user specific data after checking for record existence.
 * @param {Request} req - Express request object.
 * @param {Response} res - Express response object.
 * @param {NextFunction} next - Express next function.
 */

export const update = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const result = await updateUser(req);

    if (result instanceof CustomError) {
      return next(new CustomError(result.message, result.statusCode));
    }

    sendSuccessResponse({
      res,
      statusCode: statusCode.success,
      message: userMsg.updateSuccess,
      data: result,
    });
  } catch (error) {
    return next(error);
  }
};

/**
 * API Endpoint: Delete a user.
 * Removes a user record from the database via the UserService.
 * @param {Request} req - Express request object.
 * @param {Response} res - Express response object.
 * @param {NextFunction} next - Express next function.
 */

export const remove = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const result = await deleteUser(req);

    if (result instanceof CustomError) {
      return next(new CustomError(result.message, result.statusCode));
    }

    sendSuccessResponse({
      res,
      statusCode: statusCode.success,
      message: userMsg.deleted,
    });
  } catch (error) {
    return next(error);
  }
};
