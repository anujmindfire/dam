import Redis from "ioredis";
import dotEnv from "./dotEnv";
import logger from "../utils/logger";
import { common, redisMsg } from "../utils/constant";

/**
 * Initializes a persistent Redis client connection.
 * Default connection settings are sourced from centralized environment variables.
 * Automatically logs connection errors and ready status.
 */

const redis = new Redis({
  host: dotEnv.redisHost,
  port: dotEnv.redisPort,
  maxRetriesPerRequest: null,
});

redis.on("connect", () => {
  logger.info(common.redisConnecting);
});

redis.on("ready", () => {
  logger.info(common.redisReady);
});

redis.on("error", (error) => {
  logger.error(redisMsg.connectionError, error);
});

export default redis;
