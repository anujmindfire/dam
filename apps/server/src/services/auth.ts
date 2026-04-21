import jwt from "jsonwebtoken";
import {
  userModel,
  findOne,
  update,
  comparePasswords,
  authMsg,
  statusCode,
  CustomError,
  dotEnv,
  sequelize,
  RequestWithUser,
} from "@dam/shared";

/**
 * Handles user login logic.
 * This service validates credentials, checks for user existence,
 * compares passwords, and generates a JWT access token upon success.
 * @param {Request} req - The Express request object containing email and password.
 * @returns {Promise<any | CustomError>} A promise resolving to user details and access token, or a CustomError.
 */

export const loginUsers = async (req: RequestWithUser) => {
  try {
    const { email, password } = req.body;

    const userData = await findOne(userModel, { email: email.toLowerCase() });

    if (!userData) {
      return new CustomError(authMsg.invalidCredentials, statusCode.badRequest);
    }

    const passwordMatch = await comparePasswords(password, userData.password as string);

    if (!passwordMatch) {
      return new CustomError(authMsg.invalidCredentials, statusCode.badRequest);
    }

    const accessToken = jwt.sign(
      {
        userId: userData.id,
        email: userData.email,
        roleId: userData.roleId,
        tokenVersion: userData.tokenVersion,
      },
      dotEnv.accessToken as string,
      { expiresIn: "24h" },
    );

    const refreshToken = jwt.sign(
      { userId: userData.id, tokenVersion: userData.tokenVersion },
      dotEnv.refreshToken as string,
      { expiresIn: "7d" },
    );

    // Save refreshToken to DB for validation/rotation
    await update(userModel, { id: userData.id }, { refreshToken });

    return {
      userId: userData.id,
      email: userData.email,
      name: userData.name,
      roleId: userData.roleId,
      accessToken,
      refreshToken,
    };
  } catch (error) {
    return new CustomError(error as string, statusCode.badRequest);
  }
};

/**
 * Handles user logout logic.
 * Invalidates the current user session by incrementing the tokenVersion
 * in the database, effectively revoking existing tokens.
 * @param {Request} req - The Express request object with authenticated user information.
 * @returns {Promise<boolean | CustomError>} A promise resolving to true on success or a CustomError.
 */

export const logoutUsers = async (req: RequestWithUser) => {
  try {
    if (!req?.user?.id) {
      return new CustomError(authMsg.invalidToken, statusCode.unAuthorize);
    }

    const modifiedCount: number = await update(
      userModel,
      { id: req?.user?.id },
      {
        tokenVersion: sequelize.literal('"tokenVersion" + 1'),
        refreshToken: null,
      },
    );

    if (!modifiedCount) {
      return new CustomError(authMsg.userNotFound, statusCode.notFound);
    }

    return true;
  } catch (error) {
    return new CustomError(error as string, statusCode.badRequest);
  }
};

/**
 * Rotates the access and refresh tokens.
 * @param {string} oldRefreshToken - The current refresh token.
 * @returns {Promise<any | CustomError>} New tokens or error.
 */
export const refreshAuthToken = async (oldRefreshToken: string) => {
  try {
    if (!oldRefreshToken) {
      return new CustomError(authMsg.invalidToken, statusCode.unAuthorize);
    }

    const decoded = jwt.verify(oldRefreshToken, dotEnv.refreshToken as string) as any;
    const userData = await findOne(userModel, { id: decoded.userId });

    if (
      !userData ||
      userData.refreshToken !== oldRefreshToken ||
      userData.tokenVersion !== decoded.tokenVersion
    ) {
      return new CustomError(authMsg.invalidToken, statusCode.unAuthorize);
    }

    const accessToken = jwt.sign(
      {
        userId: userData.id,
        email: userData.email,
        roleId: userData.roleId,
        tokenVersion: userData.tokenVersion,
      },
      dotEnv.accessToken as string,
      { expiresIn: "15m" },
    );

    const refreshToken = jwt.sign(
      { userId: userData.id, tokenVersion: userData.tokenVersion },
      dotEnv.refreshToken as string,
      { expiresIn: "7d" },
    );

    await update(userModel, { id: userData.id }, { refreshToken });

    return { accessToken, refreshToken };
  } catch (error) {
    return new CustomError(authMsg.invalidToken, statusCode.unAuthorize);
  }
};
