import { Request, Response, NextFunction } from "express";
import { loginUsers, logoutUsers, refreshAuthToken } from "../services/auth";
import { createUser } from "../services/user";
import {
  sendSuccessResponse,
  CustomError,
  statusCode,
  authMsg,
  defaultRoute,
  dotEnv,
  userMsg,
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
      return next(new CustomError(authMsg.appConfiguration, statusCode.badRequest));
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
      message: authMsg.loginSuccess,
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
      return next(new CustomError(authMsg.appConfiguration, statusCode.badRequest));
    }

    res.clearCookie(appDomain, {
      domain: appDomain,
      path: defaultRoute,
      httpOnly: true,
    });

    sendSuccessResponse({
      res,
      statusCode: statusCode.success,
      message: authMsg.logoutSuccess,
    });
  } catch (error) {
    return next(error);
  }
};

/**
 * API Endpoint: User Signup.
 * Registers a new user and returns a success message.
 * Roles are assigned automatically (default: User).
 * @param {Request} req - Express request object.
 * @param {Response} res - Express response object.
 * @param {NextFunction} next - Express next function.
 */

export const signup = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const result = await createUser(req);

    if (result instanceof CustomError) {
      return next(new CustomError(result.message, result.statusCode));
    }

    sendSuccessResponse({
      res,
      statusCode: statusCode.successCreated,
      message: userMsg.createSuccess,
    });
  } catch (error) {
    return next(error);
  }
};

/**
 * API Endpoint: Refresh Token.
 * Rotates tokens using the provided refreshToken.
 * @param {Request} req - Express request object.
 * @param {Response} res - Express response object.
 * @param {NextFunction} next - Express next function.
 */
export const refresh = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const { refreshToken: oldRefreshToken } = req.body;
    const response: any = await refreshAuthToken(oldRefreshToken);

    if (response instanceof CustomError) {
      return next(new CustomError(response.message, response.statusCode));
    }

    const appDomain = dotEnv.appDomain;
    if (appDomain) {
      res.cookie(appDomain, response.accessToken, {
        domain: appDomain,
        path: defaultRoute,
        httpOnly: true,
        maxAge: 24 * 60 * 60 * 1000,
      });
    }

    sendSuccessResponse({
      res,
      statusCode: statusCode.success,
      message: authMsg.tokenRefreshSuccess,
      data: response,
    });
  } catch (error) {
    return next(error);
  }
};
