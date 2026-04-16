import { Request } from "express";
import {
  findOne,
  update,
  create,
  deleteRecord,
  findAll,
  commonMsg,
  userMsg,
  authMsg,
  roleId,
  statusCode,
  globalFilter,
  globalPagination,
  globalSearch,
  userModel,
  CustomError,
  encryptPassword,
} from "@dam/shared";

/**
 * Handles account creation for new users.
 * Validates email uniqueness, encrypts the password, and assigns the default 'User' role.
 * @param {Request} req - The Express request object containing user details.
 * @returns {Promise<any | CustomError>} A promise resolving to the created user record or a CustomError.
 */

export const createUser = async (req: Request) => {
  try {
    const targetRoleId = roleId.user;

    const userData = await findOne(
      userModel,
      { email: req?.body?.email.toLowerCase() },
      {
        attributes: ["id", "email"],
      },
    );

    if (userData) {
      return new CustomError(userMsg.alreadyExist, statusCode.badRequest);
    }

    const hashedPassword = await encryptPassword(req?.body?.password);

    const createdUser = await create(userModel, {
      name: req.body.name,
      email: req.body.email,
      password: hashedPassword,
      roleId: targetRoleId,
    });

    if (!createdUser) {
      return new CustomError(commonMsg.somethingWentWrong, statusCode.badRequest);
    }

    return createdUser;
  } catch (error) {
    return new CustomError((error as Error).message, statusCode.badRequest);
  }
};

/**
 * Lists users with support for searching, filtering, and pagination.
 * Excludes sensitive fields like password and tokenVersion from the result.
 * @param {Request} req - The Express request object with query parameters.
 * @returns {Promise<{result: any[], totalCount: number} | CustomError>} A promise resolving to the user list and count.
 */

export const listUser = async (req: Request) => {
  try {
    const filterCondition = globalFilter(req, ["id", "name", "email", "createdAt"]);

    const { limit, offset } = globalPagination(req);
    const searchConditions = globalSearch(req.query.searchKey as string, userModel);

    const sortKey = (req.query.sortKey as string) || "createdAt";
    const sortOrder = (req.query.sortOrder as string) === "DESC" ? "DESC" : "ASC";

    const matchConditions = {
      ...searchConditions,
      ...filterCondition,
    };

    const { result, totalCount } = await findAll(userModel, {
      where: matchConditions,
      limit: limit ?? 100,
      offset: offset ?? 0,
      order: [[sortKey, sortOrder]],
      attributes: { exclude: ["password", "tokenVersion"] },
    });

    return { result, totalCount };
  } catch (error) {
    return new CustomError(error as string, statusCode.badRequest);
  }
};

/**
 * Updates an existing user's profile information.
 * Currently supports updating the 'name' field after validating user existence.
 * @param {Request} req - The Express request object with user ID in params and update data in body.
 * @returns {Promise<boolean | CustomError>} A promise resolving to true on success or a CustomError.
 */

export const updateUser = async (req: Request) => {
  try {
    const userData = await findOne(
      userModel,
      { id: req.params.id },
      {
        attributes: ["id", "email", "name", "roleId"],
      },
    );

    if (!userData) {
      return new CustomError(userMsg.notfound, statusCode.notFound);
    }

    const updateData: Partial<{
      name: string;
    }> = {};

    if (req.body.name) updateData.name = req.body.name;

    const updatedCount = await update(userModel, { id: req.params.id }, updateData);

    if (!updatedCount) {
      return new CustomError(commonMsg.somethingWentWrong, statusCode.badRequest);
    }

    return true;
  } catch (error) {
    return new CustomError(error as string, statusCode.badRequest);
  }
};

/**
 * Deletes a user record from the system.
 * Performs a hard delete based on the provided user ID.
 * @param {Request} req - The Express request object containing the user ID in params.
 * @returns {Promise<boolean | CustomError>} A promise resolving to true on success or a CustomError.
 */

export const deleteUser = async (req: Request) => {
  try {
    const { id } = req.params;

    const userData = await findOne(userModel, { id }, { attributes: ["id"] });

    if (!userData) {
      return new CustomError(authMsg.userNotFound, statusCode.notFound);
    }

    const deleteCount = await deleteRecord(userModel, { id });

    if (!deleteCount) {
      return new CustomError(commonMsg.somethingWentWrong, statusCode.badRequest);
    }

    return true;
  } catch (error) {
    return new CustomError(error as string, statusCode.badRequest);
  }
};
