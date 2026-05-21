import jwt from "jsonwebtoken";
import logger from "../utils/logger";
import { Model, ModelStatic } from "sequelize";
import { ObjectSchema } from "joi";
import { Request, Response, NextFunction, RequestHandler, ErrorRequestHandler } from "express";
import { commonMsg, statusCode, method, authMsg } from "../utils/constant";
import { findOne } from "../repositories/index";
import { CustomError } from "../utils/customError";
import { sendSuccessResponse } from "../utils/response";
import { TokenPayloadProps } from "../types";

/**
 * Middleware to log incoming HTTP requests.
 * @param {Request} req The Express request object.
 * @param {Response} res The Express response object.
 * @param {NextFunction} next The Express next middleware function.
 **/

export const requestLogger: RequestHandler = (req, _res, next): void => {
  logger.info(`[${req.method}] ${req.originalUrl}`);
  next();
};

/**
 * Logs an error.
 * @param {string} route The route where the error occurred.
 * @param {string} error The error message.
 */

export const logError = async (route: string, error: string): Promise<void> => {
  logger.error(`Route: ${route} | Error: ${error}`);
};

/**
 * Global error handling middleware. Catches errors and sends a formatted JSON response.
 * @param {ErrorRequestHandler} error The error object.
 * @param {Request} req The Express request object.
 * @param {Response} res The Express response object.
 * @param {NextFunction} next The Express next middleware function.
 **/

export const errorHandler: ErrorRequestHandler = async (
  error: Error | CustomError,
  req: Request,
  res: Response,
  _next: NextFunction,
) => {
  logError(req.originalUrl, error.message);

  if (error instanceof CustomError) {
    return sendSuccessResponse({
      res,
      statusCode: error.statusCode,
      message: error.message,
      success: false,
    });
  }

  logger.error(error.stack || error.message);
  sendSuccessResponse({
    res,
    statusCode: statusCode.somethingWentWrong,
    message: commonMsg.somethingWentWrong,
    success: false,
  });
};

/**
 * Middleware to handle 404 Not Found errors.
 * Logs the failed request and sends a formatted 404 response.
 * @param {Request} req - The Express request object.
 * @param {Response} res - The Express response object.
 */

export const notFoundHandler: RequestHandler = (req, res): void => {
  logger.warn(`${commonMsg.pageNotFound}: ${req.method} ${req.url}`);
  sendSuccessResponse({
    res,
    statusCode: statusCode.notFound,
    message: commonMsg.pageNotFound,
    success: false,
  });
};

/**
 * A higher-order function that creates a validation middleware using a Joi schema.
 * It automatically validates request data from the body, query, or params based on the HTTP method.
 * @param {ObjectSchema} schema The Joi schema to validate the request against.
 * @returns An Express middleware function.
 **/

export const validatedRequest = (schema: ObjectSchema): RequestHandler => {
  return (req: Request, res: Response, next: NextFunction) => {
    let dataToValidate;

    switch (req.method) {
      case method.get:
      case method.delete:
        dataToValidate = { ...req.query, ...req.params };
        break;

      case method.post:
      case method.patch:
      case method.put:
        dataToValidate = { ...req.body, ...req.params };
        break;

      default:
        res.status(statusCode.badRequest).json({
          error: { message: commonMsg.unSupportMethod },
        });
        return;
    }

    const { error } = schema.validate(dataToValidate, {
      abortEarly: false,
      convert: true,
    });

    if (error) {
      const detail = error.details[0];
      res.status(statusCode.badRequest).json({
        message: detail.message,
        success: false,
      });
      return;
    }

    next();
  };
};

/**
 * Middleware to restrict access based on user roles (RBAC)
 * @param {number[]} allowedRoles Array of role IDs that are permitted to access the route
 */

export const authorizeRoles = (...allowedRoles: number[]) => {
  return (req: Request, res: Response, next: NextFunction) => {
    const userRoleId = req.user?.roleId;

    if (!userRoleId) {
      return next(new CustomError(commonMsg.unAuthorized, statusCode.unAuthorize));
    }

    if (!allowedRoles.includes(userRoleId)) {
      return next(new CustomError(commonMsg.accessForbidden, statusCode.accessDenied));
    }

    next();
  };
};

/**
 * Verifies the users authentication token and attaches user information to the request.
 * @param {Request} req The Express request object.
 * @param {Response} res The Express response object.
 * @param {NextFunction} next The Express next middleware function.
 */

export const verifyTokenFactory = <T extends Model>(
  secret: string,
  domain: string,
  userModel: ModelStatic<T>,
): RequestHandler => {
  return async (req: Request, _res: Response, next: NextFunction): Promise<void> => {
    try {
      if (!domain) {
        return next(new CustomError(authMsg.appConfiguration, statusCode.unAuthorize));
      }

      const sessionToken =
        req.headers?.authorization?.split(" ")[1] ||
        req.cookies?.[domain] ||
        (req.query?.token as string);

      if (!sessionToken) {
        return next(new CustomError(authMsg.tokenNotFound, statusCode.unAuthorize));
      }

      if (!secret) {
        return next(new CustomError(authMsg.tokenNotFound, statusCode.notFound));
      }

      const decoded = jwt.verify(sessionToken, secret) as TokenPayloadProps;

      if (!decoded?.userId) {
        return next(new CustomError(authMsg.invalidToken, statusCode.badRequest));
      }

      const userExist = (await findOne(userModel, { id: decoded.userId })) as {
        id: number;
        email: string;
        roleId: number;
        tokenVersion: number;
      } | null;

      if (!userExist) {
        return next(new CustomError(authMsg.userNotFound, statusCode.unAuthorize));
      }

      if (userExist.tokenVersion !== decoded.tokenVersion) {
        return next(new CustomError(authMsg.invalidToken, statusCode.unAuthorize));
      }

      req.user = {
        id: userExist.id,
        email: userExist.email,
        roleId: userExist.roleId,
        tokenVersion: userExist.tokenVersion,
      };
      next();
    } catch (error) {
      if (error instanceof Error && error.name === authMsg.tokenExpiredError) {
        return next(new CustomError(authMsg.tokenExpired, statusCode.unAuthorize));
      }

      if (error instanceof Error && error.name === authMsg.invalidSignature) {
        return next(new CustomError(authMsg.tokenExpired, statusCode.unAuthorize));
      }

      return next(error);
    }
  };
};

/**
 * Simple in-memory rate limiting middleware.
 * Tracks request counts per IP/Method/Path combination within a rolling window.
 * Automatically clears expired entries from the tracking map every 30 minutes.
 * @param {number} windowMs - The time window in milliseconds (default: 15 minutes).
 * @param {number} max - The maximum number of requests allowed within the window (default: 1000).
 * @returns {RequestHandler} An Express middleware function.
 **/

const rateLimitMap = new Map<string, { count: number; lastModified: number }>();

export const rateLimit = (
  windowMs: number = 15 * 60 * 1000,
  max: number = 10000,
): RequestHandler => {
  return (req: Request, _res: Response, next: NextFunction) => {
    const ip = req.ip || req.headers["x-forwarded-for"] || req.socket?.remoteAddress;
    const key = `${req.method}:${req.path}:${ip}`;

    const now = Date.now();
    const rateData = rateLimitMap.get(key as string);

    if (!rateData) {
      rateLimitMap.set(key as string, { count: 1, lastModified: now });
      return next();
    }

    if (now - rateData.lastModified > windowMs) {
      rateLimitMap.set(key as string, { count: 1, lastModified: now });
      return next();
    }

    if (rateData.count >= max) {
      return next(new CustomError(commonMsg.tooManyRequest, statusCode.tooManyRequest));
    }

    rateData.count++;
    return next();
  };
};

setInterval(
  () => {
    const now = Date.now();
    for (const [key, value] of rateLimitMap.entries()) {
      if (now - value.lastModified > 60 * 60 * 1000) {
        rateLimitMap.delete(key);
      }
    }
  },
  30 * 60 * 1000,
);
