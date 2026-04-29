// 1. Core Config & Low-level Utils (no internal dependencies)
export { default as dotEnv } from "./config/dotEnv";
export { default as logger } from "./utils/logger";
export * from "./types";
export * from "./utils/constant";
export * from "./utils/customError";

// 2. Database & Core Infrastructure (depends on config/constants)
export { default as sequelize } from "./config/sequelizeConnection";
export { connectDB } from "./config/dbConnection";
export { default as redis } from "./config/redis";
export { cache as cacheUtil } from "./utils/cache";
export * from "./utils/messaging";

// 3. Common Utilities (depends on types/constants)
export * from "./utils/common";
export * from "./utils/response";
export { Op } from "sequelize";

// 4. Models (depends on sequelize, types, constants)
export * from "./models";

// 5. Repositories (depends on models)
export * from "./repositories";

// 6. Feature-specific Services (depends on everything above)
export * from "./config/minio";
export * from "./utils/report";
export * from "./utils/governance";

// 7. API Layer (depends on everything above)
export * from "./validation";
export * from "./middleware";
