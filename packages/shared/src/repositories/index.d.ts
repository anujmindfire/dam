import { Model, WhereOptions, ModelStatic, FindOptions, Transaction, FindAndCountOptions } from "sequelize";
import { PaginatedResult } from "../types";
/**
 * Creates a new item in the database using the provided Sequelize model.
 * @param model - The Sequelize model to create the item in.
 * @param newItem - The object to create.
 * @param transaction - Optional Sequelize transaction.
 * @returns A promise resolving to the created instance.
 **/
export declare const create: <T extends Model>(model: ModelStatic<T>, newItem: any, transaction?: Transaction) => Promise<T>;
/**
 * Bulk creates multiple items in the database.
 * @param model - The Sequelize model to create items in.
 * @param newItems - Array of objects to create.
 * @param transaction - Optional Sequelize transaction.
 * @returns A promise resolving to an array of created instances.
 **/
export declare const bulkCreate: <T extends Model>(model: ModelStatic<T>, newItems: any[], transaction?: Transaction) => Promise<T[]>;
/**
 * Finds a single item in the database using the provided Sequelize model.
 * @param model - The Sequelize model to query.
 * @param condition - The filter condition for the query.
 * @param options - Optional query options.
 * @returns A promise resolving to the found instance or null.
 **/
export declare const findOne: <T extends Model>(model: ModelStatic<T>, condition: WhereOptions, options?: FindOptions) => Promise<any | null>;
/**
 * Fetches list of records and total count using Sequelize.
 * @param model - Sequelize model to query.
 * @param options - Find options including where, limit, offset, order.
 * @returns A promise resolving to result array and total count.
 **/
export declare const findAll: <T extends Model>(model: ModelStatic<T>, options?: FindOptions) => Promise<PaginatedResult<any>>;
/**
 * Updates records in the database based on a condition.
 * @param model - The Sequelize model to update.
 * @param condition - Filter condition for updating.
 * @param updateData - The update data to apply.
 * @param transaction - Optional Sequelize transaction.
 * @param multiple - Whether to update multiple records. Default true.
 * @returns A promise resolving to the number of affected rows.
 **/
export declare const update: <T extends Model>(model: ModelStatic<T>, condition: WhereOptions, updateData: any, transaction?: Transaction, multiple?: boolean) => Promise<number>;
/**
 * Finds a single record and updates it.
 * @param model - The Sequelize model to query.
 * @param condition - The filter criteria to locate the record.
 * @param updateData - The data to update the record with.
 * @param transaction - Optional Sequelize transaction.
 * @param returnNew - Whether to return the new updated record. Default true.
 * @returns A promise resolving to the updated instance or null.
 **/
export declare const findOneAndUpdate: <T extends Model>(model: ModelStatic<T>, condition: WhereOptions, updateData: any, transaction?: Transaction, returnNew?: boolean) => Promise<T | null>;
/**
 * Deletes records from the database based on a condition.
 * @param model - The Sequelize model to delete from.
 * @param condition - Filter condition to match records for deletion.
 * @param multiple - Whether to delete multiple records. Default true.
 * @param transaction - Optional Sequelize transaction.
 * @returns A promise resolving to the number of deleted rows.
 **/
export declare const deleteRecord: <T extends Model>(model: ModelStatic<T>, condition: WhereOptions, multiple?: boolean, transaction?: Transaction) => Promise<number>;
/**
 * Generic findAndCountAll repository helper
 */
export declare const findAndCountAll: <T extends Model>(model: ModelStatic<T>, options: FindAndCountOptions) => Promise<PaginatedResult<T>>;
