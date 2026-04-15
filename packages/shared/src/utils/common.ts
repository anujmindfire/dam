import bcrypt from "bcrypt";
import { Request } from "express";
import { Model, ModelStatic, Op } from "sequelize";
import { PaginationProps } from "../types/index";

/**
 * Handles pagination for a query by extracting limit and offset values from the request query.
 **/

export const globalPagination = (req: Request): PaginationProps => {
  const { limit: limitQuery, page: pageQuery } = req.query;

  const limit = Number(limitQuery) || 10;
  const page = Number(pageQuery) || 1;
  const offset = (page - 1) * limit;

  return { limit, offset };
};

/**
 * Builds a dynamic search condition for Sequelize queries. The function automatically
 * detects a model"s attributes and performs:
 * Case-insensitive partial matching for string/text fields
 * Exact match for numeric fields when the filter key is a number
 * Contains check for array fields (PostgreSQL ARRAY type)
 * @param filterKey - The search term to filter results.
 * @param model - The Sequelize model class used to extract searchable fields.
 * @returns An object containing a Sequelize `where` condition using `Op.or`, or an empty object.
 **/

export const globalSearch = <T extends Model<any, any>>(
  filterKey: string,
  modelObj: ModelStatic<T>,
): Record<string, any> => {
  if (!filterKey?.trim()) return {};

  const normalizedKey = filterKey.replace(/\s+/g, " ").trim();
  const searchConditions: any[] = [];

  const numericValue = parseFloat(normalizedKey);
  const isNumber = !isNaN(numericValue);

  Object.entries(modelObj.rawAttributes).forEach(([field, attribute]: any) => {
    const typeKey = attribute?.type?.key;

    if (typeKey === "STRING" || typeKey === "TEXT") {
      searchConditions.push({
        [field]: { [Op.iLike]: `%${normalizedKey}%` },
      });
    }

    if ((typeKey === "INTEGER" || typeKey === "FLOAT") && isNumber) {
      searchConditions.push({
        [field]: numericValue,
      });
    }

    if (typeKey === "ARRAY") {
      searchConditions.push({
        [field]: { [Op.contains]: [normalizedKey] },
      });
    }
  });

  return searchConditions.length > 0 ? { [Op.or]: searchConditions } : {};
};

/**
 * Constructs a filter condition object for Sequelize queries based on
 * URL query parameters. It only filters for keys provided in `queryKeys`.
 * Values matching key patterns like `id` or containing `"id"` are treated as direct matches.
 * @param req - The Express request object containing query parameters.
 * @param queryKeys - Array of keys allowed for filtering (defaults to an empty array).
 * @returns An object suitable for use in `Sequelize.where`.
 **/

export const globalFilter = (req: Request, queryKeys: string[] = []) => {
  const condition: Record<string, any> = {};

  queryKeys.forEach((key) => {
    const value = req.query[key];

    if (value !== undefined && value !== "") {
      if (key.toLowerCase() === "id" || key.toLowerCase().includes("id")) {
        condition[key] = value;
      } else {
        condition[key] = { [Op.eq]: value };
      }
    }
  });

  return condition;
};

/**
 * Capitalizes the first letter of a string
 * @param str - The string to capitalize
 * @returns The capitalized string
 **/

export const capitalize = (str: string) => str.charAt(0).toUpperCase() + str.slice(1);

/**
 * Encrypts a plain text password using bcrypt
 * @param password - The plain text password
 * @returns The hashed (encrypted) password
 **/

export const encryptPassword = async (password: string) => {
  const salt = await bcrypt.genSalt(10);
  const hashedPassword = await bcrypt.hash(password, salt);
  return hashedPassword;
};

/**
 * Compares a plain text password with a hashed password
 * @param password - The plain text password
 * @param hashedPassword - The stored hashed password
 * @returns Boolean indicating whether the passwords match
 **/

export const comparePasswords = async (password: string, hashedPassword: string) => {
  const isMatch = await bcrypt.compare(password, hashedPassword);
  return isMatch;
};
