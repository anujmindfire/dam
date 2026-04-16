import { Model, ModelStatic } from "sequelize";
import { ObjectSchema } from "joi";
import { Request, Response, NextFunction, RequestHandler, ErrorRequestHandler } from "express";
/**
 * Middleware to log incoming HTTP requests.
 * @param {Request} req The Express request object.
 * @param {Response} res The Express response object.
 * @param {NextFunction} next The Express next middleware function.
 **/
export declare const requestLogger: RequestHandler;
/**
 * Logs an error.
 * @param {string} route The route where the error occurred.
 * @param {string} error The error message.
 */
export declare const logError: (route: string, error: string) => Promise<void>;
/**
 * Global error handling middleware. Catches errors and sends a formatted JSON response.
 * @param {ErrorRequestHandler} error The error object.
 * @param {Request} req The Express request object.
 * @param {Response} res The Express response object.
 * @param {NextFunction} next The Express next middleware function.
 **/
export declare const errorHandler: ErrorRequestHandler;
/**
 * Middleware to handle 404 Not Found errors.
 * Logs the failed request and sends a formatted 404 response.
 * @param {Request} req - The Express request object.
 * @param {Response} res - The Express response object.
 */
export declare const notFoundHandler: RequestHandler;
/**
 * A higher-order function that creates a validation middleware using a Joi schema.
 * It automatically validates request data from the body, query, or params based on the HTTP method.
 * @param {ObjectSchema} schema The Joi schema to validate the request against.
 * @returns An Express middleware function.
 **/
export declare const validatedRequest: (schema: ObjectSchema) => RequestHandler;
/**
 * Middleware to restrict access based on user roles (RBAC)
 * @param {number[]} allowedRoles Array of role IDs that are permitted to access the route
 */
export declare const authorizeRoles: (...allowedRoles: number[]) => (req: Request, res: Response, next: NextFunction) => void;
/**
 * Verifies the users authentication token and attaches user information to the request.
 * @param {Request} req The Express request object.
 * @param {Response} res The Express response object.
 * @param {NextFunction} next The Express next middleware function.
 */
export declare const verifyTokenFactory: (secret: string, domain: string, userModel: ModelStatic<Model<any>>) => RequestHandler;
export declare const rateLimit: (windowMs?: number, max?: number) => RequestHandler;
