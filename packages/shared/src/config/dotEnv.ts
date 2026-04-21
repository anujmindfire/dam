import dotenv from "dotenv";
import path from "path";

/**
 * Loads environment variables from a .env file located at the root of the shared package.
 * These variables are used across the monorepo for database connectivity,
 * authentication tokens, storage service access, messaging queues, and caching.
 */

const envPath = path.resolve(__dirname, "../../../../.env");
dotenv.config({ path: envPath });

export interface DotEnvConfig {
  appDomain: string;
  appURL: string;
  serverPort: number;
  assetsPort: number;
  metadataPort: number;
  usagePort: number;
  workerPort: number;
  accessToken: string;
  refreshToken: string;
  dbHost: string;
  dbPort: number;
  dbUser: string;
  dbPassword: string;
  dbName: string;
  environment: string;
  clientURL: string;
  minioEndpoint: string;
  minioPort: number;
  minioAccessKey: string;
  minioSecretKey: string;
  minioUseSSL: boolean;
  rabbitmqURL: string;
  redisHost: string;
  redisPort: number;
  assetsHost: string;
  metadataHost: string;
  usageHost: string;
}

const config: DotEnvConfig = {
  appDomain: process.env.APP_DOMAIN as string,
  appURL: process.env.APP_URL as string,
  serverPort: Number(process.env.SERVER_PORT),
  assetsPort: Number(process.env.ASSETS_SERVICE_PORT),
  metadataPort: Number(process.env.METADATA_SERVICE_PORT),
  usagePort: Number(process.env.USAGE_SERVICE_PORT),
  workerPort: Number(process.env.WORKER_PORT),
  accessToken: process.env.ACCESS_TOKEN as string,
  refreshToken: process.env.REFRESH_TOKEN as string,
  dbHost: process.env.DB_HOST as string,
  dbPort: Number(process.env.DB_PORT),
  dbUser: process.env.DB_USERS as string,
  dbPassword: process.env.DB_PASSWORD as string,
  dbName: process.env.DB_DATABASE as string,
  environment: process.env.NODE_ENV as string,
  clientURL: process.env.CLIENT_URL as string,
  minioEndpoint: process.env.MINIO_ENDPOINT as string,
  minioPort: Number(process.env.MINIO_PORT),
  minioAccessKey: process.env.MINIO_ACCESS_KEY as string,
  minioSecretKey: process.env.MINIO_SECRET_KEY as string,
  minioUseSSL: process.env.MINIO_USE_SSL === "true",
  rabbitmqURL: process.env.RABBITMQ_URL as string,
  redisHost: process.env.REDIS_HOST as string,
  redisPort: Number(process.env.REDIS_PORT),
  assetsHost: process.env.ASSETS_SERVICE_HOST || "localhost",
  metadataHost: process.env.METADATA_SERVICE_HOST || "localhost",
  usageHost: process.env.USAGE_SERVICE_HOST || "localhost",
};

export default config;
