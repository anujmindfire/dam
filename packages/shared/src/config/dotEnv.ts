import dotenv from "dotenv";
import path from "path";

/**
 * Loads environment variables from a .env file located at the root of the shared package.
 * These variables are used across the monorepo for database connectivity, 
 * authentication tokens, storage service access, messaging queues, and caching.
 */

const envPath = path.resolve(__dirname, "../../../../.env");
dotenv.config({ path: envPath });

export default {
  appDomain: process.env.APP_DOMAIN as string,
  appURL: process.env.APP_URL as string,
  port: process.env.PORT as string,
  accessToken: process.env.ACCESS_TOKEN as string,
  refreshToken: process.env.REFRESH_TOKEN as string,
  dbHost: process.env.DB_HOST as string,
  dbPort: process.env.DB_PORT as string,
  dbUser: process.env.DB_USERS as string,
  dbPassword: process.env.DB_PASSWORD as string,
  dbName: process.env.DB_DATABASE as string,
  environment: process.env.NODE_ENV as string,
  clientURL: process.env.CLIENT_URL as string,
  
  // Storage (MinIO)
  minioEndpoint: process.env.MINIO_ENDPOINT || "localhost",
  minioPort: parseInt(process.env.MINIO_PORT || "9000", 10),
  minioAccessKey: process.env.MINIO_ACCESS_KEY || "minioadmin",
  minioSecretKey: process.env.MINIO_SECRET_KEY || "minioadmin",
  minioUseSSL: process.env.MINIO_USE_SSL === "true",

  // Messaging (RabbitMQ)
  rabbitmqURL: process.env.RABBITMQ_URL || "amqp://guest:guest@localhost:5672",

  // Caching (Redis)
  redisHost: process.env.REDIS_HOST || "localhost",
  redisPort: parseInt(process.env.REDIS_PORT || "6379", 10),
};
