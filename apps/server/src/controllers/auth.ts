import { Request, Response, NextFunction } from "express";
import { loginUsers, logoutUsers } from "../services/auth";
import {
  sendSuccessResponse,
  CustomError,
  statusCode,
  auth,
  defaultRoute,
  dotEnv,
} from "@dam/shared";

/**
 * API Endpoint: User Login.
 * Authenticates the user and sets an HttpOnly cookie containing the access token.
 * Delegates credential validation to the AuthService.
 * @param {Request} req - Express request object.
 * @param {Response} res - Express response object.
 * @param {NextFunction} next - Express next function.
 */

export const login = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const response = await loginUsers(req);

    if (response instanceof CustomError) {
      return next(new CustomError(response.message, response.statusCode));
    }

    const appDomain = dotEnv.appDomain;
    if (!appDomain) {
      return next(new CustomError(auth.appConfiguration, statusCode.badRequest));
    }

    res.cookie(appDomain as string, response.accessToken, {
      domain: appDomain,
      path: defaultRoute,
      httpOnly: true,
      maxAge: 24 * 60 * 60 * 1000,
    });

    sendSuccessResponse({
      res,
      statusCode: statusCode.success,
      message: auth.loginSuccess,
      data: response,
    });
  } catch (error) {
    return next(error);
  }
};

/**
 * API Endpoint: User Logout.
 * Clears the authentication cookie and revokes the current token via the AuthService.
 * @param {Request} req - Express request object.
 * @param {Response} res - Express response object.
 * @param {NextFunction} next - Express next function.
 */

export const logout = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const response = await logoutUsers(req);

    if (response instanceof CustomError) {
      return next(new CustomError(response.message, response.statusCode));
    }

    const appDomain = dotEnv.appDomain;
    if (!appDomain) {
      return next(new CustomError(auth.appConfiguration, statusCode.badRequest));
    }

    res.clearCookie(appDomain, {
      domain: appDomain,
      path: defaultRoute,
      httpOnly: true,
    });

    sendSuccessResponse({
      res,
      statusCode: statusCode.success,
      message: auth.logoutSuccess,
    });
  } catch (error) {
    return next(error);
  }
};
