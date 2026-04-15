import sequelize from "./sequelizeConnection";
import logger from "../utils/logger";
import { database } from "../utils/constant";

/**
 * Shared database connection logic.
 * Seeding is handled at the application level.
 */

export const connectDB = async () => {
  try {
    await sequelize.authenticate();
    logger.info(database.dbConnectionSuccess);

    await sequelize.sync();
  } catch (error) {
    logger.error(`${database.dbConnectionError}: ${error}`);
    process.exit(1);
  }
};
