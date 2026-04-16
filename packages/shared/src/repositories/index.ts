import {
  Model,
  WhereOptions,
  ModelStatic,
  FindOptions,
  Transaction,
  FindAndCountOptions,
} from "sequelize";
import { PaginatedResult } from "../types";

/**
 * Creates a new item in the database using the provided Sequelize model.
 * @param model - The Sequelize model to create the item in.
 * @param newItem - The object to create.
 * @param transaction - Optional Sequelize transaction.
 * @returns A promise resolving to the created instance.
 **/

export const create = async <T extends Model>(
  model: ModelStatic<T>,
  newItem: any,
  transaction?: Transaction,
): Promise<T> => {
  try {
    const res = await model.create(newItem, { transaction });
    return res as T;
  } catch (error) {
    throw error;
  }
};

/**
 * Bulk creates multiple items in the database.
 * @param model - The Sequelize model to create items in.
 * @param newItems - Array of objects to create.
 * @param transaction - Optional Sequelize transaction.
 * @returns A promise resolving to an array of created instances.
 **/

export const bulkCreate = async <T extends Model>(
  model: ModelStatic<T>,
  newItems: any[],
  transaction?: Transaction,
): Promise<T[]> => {
  try {
    const res = await model.bulkCreate(newItems, { transaction });
    return res as T[];
  } catch (error) {
    throw error;
  }
};

/**
 * Finds a single item in the database using the provided Sequelize model.
 * @param model - The Sequelize model to query.
 * @param condition - The filter condition for the query.
 * @param options - Optional query options.
 * @returns A promise resolving to the found instance or null.
 **/

export const findOne = async <T extends Model>(
  model: ModelStatic<T>,
  condition: WhereOptions,
  options: FindOptions = {},
): Promise<any | null> => {
  try {
    const res = await model.findOne({
      where: condition,
      raw: true,
      ...options,
    });
    return res;
  } catch (error) {
    throw error;
  }
};

/**
 * Fetches list of records and total count using Sequelize.
 * @param model - Sequelize model to query.
 * @param options - Find options including where, limit, offset, order.
 * @returns A promise resolving to result array and total count.
 **/

export const findAll = async <T extends Model>(
  model: ModelStatic<T>,
  options: FindOptions = {},
): Promise<PaginatedResult<any>> => {
  try {
    const { rows, count } = await model.findAndCountAll({
      ...options,
      distinct: true,
    });
    const rawCount: any = count;
    return {
      result: rows,
      totalCount:
        typeof rawCount === "number"
          ? rawCount
          : Array.isArray(rawCount)
            ? rawCount.length
            : Object.keys(rawCount).length,
    };
  } catch (error) {
    throw error;
  }
};

/**
 * Updates records in the database based on a condition.
 * @param model - The Sequelize model to update.
 * @param condition - Filter condition for updating.
 * @param updateData - The update data to apply.
 * @param transaction - Optional Sequelize transaction.
 * @param multiple - Whether to update multiple records. Default true.
 * @returns A promise resolving to the number of affected rows.
 **/

export const update = async <T extends Model>(
  model: ModelStatic<T>,
  condition: WhereOptions,
  updateData: any,
  transaction?: Transaction,
  multiple: boolean = true,
): Promise<number> => {
  try {
    const [affectedCount] = await model.update(updateData, {
      where: condition,
      transaction,
      individualHooks: !multiple,
    });
    return affectedCount;
  } catch (error) {
    throw error;
  }
};

/**
 * Finds a single record and updates it.
 * @param model - The Sequelize model to query.
 * @param condition - The filter criteria to locate the record.
 * @param updateData - The data to update the record with.
 * @param transaction - Optional Sequelize transaction.
 * @param returnNew - Whether to return the new updated record. Default true.
 * @returns A promise resolving to the updated instance or null.
 **/

export const findOneAndUpdate = async <T extends Model>(
  model: ModelStatic<T>,
  condition: WhereOptions,
  updateData: any,
  transaction?: Transaction,
  returnNew: boolean = true,
): Promise<T | null> => {
  try {
    const instance = (await model.findOne({
      where: condition,
      transaction,
    })) as T | null;

    if (!instance) return null;

    await instance.update(updateData, { transaction });
    return returnNew ? instance : null;
  } catch (error) {
    throw error;
  }
};

/**
 * Deletes records from the database based on a condition.
 * @param model - The Sequelize model to delete from.
 * @param condition - Filter condition to match records for deletion.
 * @param multiple - Whether to delete multiple records. Default true.
 * @param transaction - Optional Sequelize transaction.
 * @returns A promise resolving to the number of deleted rows.
 **/

export const deleteRecord = async <T extends Model>(
  model: ModelStatic<T>,
  condition: WhereOptions,
  multiple: boolean = true,
  transaction?: Transaction,
): Promise<number> => {
  try {
    const deletedCount = await model.destroy({
      where: condition,
      transaction,
      limit: multiple ? undefined : 1,
    });
    return deletedCount;
  } catch (error) {
    throw error;
  }
};

/**
 * Generic findAndCountAll repository helper
 */
export const findAndCountAll = async <T extends Model>(
  model: ModelStatic<T>,
  options: FindAndCountOptions,
): Promise<PaginatedResult<T>> => {
  const result = await model.findAndCountAll({
    ...options,
    distinct: true,
  });

  const rawCount: any = result.count;
  return {
    result: result.rows as T[],
    totalCount:
      typeof rawCount === "number"
        ? rawCount
        : Array.isArray(rawCount)
          ? rawCount.length
          : Object.keys(rawCount).length,
  };
};
