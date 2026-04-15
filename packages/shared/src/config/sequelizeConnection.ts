import dotEnv from "./dotEnv";
import { Sequelize } from "sequelize";

/**
 * Initializes a new Sequelize instance with the database configuration 
 * provided by the dotEnv utility.
 * Uses PostgreSQL as the dialect and disables logging to keep the console clean.
 **/

const sequelize = new Sequelize(dotEnv.dbName!, dotEnv.dbUser!, dotEnv.dbPassword!, {
  host: dotEnv.dbHost,
  port: Number(dotEnv.dbPort),
  dialect: "postgres",
  logging: false,
  dialectOptions: {},
});

export default sequelize;
