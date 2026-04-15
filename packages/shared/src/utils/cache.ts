import redis from "../config/redis";
import logger from "./logger";

/**
 * Generic caching utility for the DAM system.
 * Handles automatic serialization/deserialization of JSON data.
 */
export const cache = {
  /**
   * Retrieves an item from the cache.
   * 
   * @param {string} key - The unique identifier for the cached data.
   * @returns {Promise<any | null>} The parsed JSON data or null if not found.
   */
  get: async (key: string): Promise<any | null> => {
    try {
      const data = await redis.get(key);
      if (!data) return null;
      return JSON.parse(data);
    } catch (error) {
      logger.error(`Cache Get Error [${key}]:`, error);
      return null;
    }
  },

  /**
   * Stores an item in the cache with an optional expiration time.
   * 
   * @param {string} key - The unique identifier for the data.
   * @param {any} value - The data to cache (will be stringified).
   * @param {number} ttlSeconds - Time-to-live in seconds (default 1 hour).
   */
  set: async (key: string, value: any, ttlSeconds: number = 3600): Promise<void> => {
    try {
      const data = JSON.stringify(value);
      await redis.set(key, data, "EX", ttlSeconds);
    } catch (error) {
      logger.error(`Cache Set Error [${key}]:`, error);
    }
  },

  /**
   * Removes a specific item from the cache.
   * 
   * @param {string} key - The key to delete.
   */
  del: async (key: string): Promise<void> => {
    try {
      await redis.del(key);
    } catch (error) {
      logger.error(`Cache Del Error [${key}]:`, error);
    }
  },

  /**
   * Clears multiple cache keys matching a pattern.
   * Useful for invalidating listings when a resource is updated.
   * 
   * @param {string} pattern - Redis key pattern (e.g., "assets:*").
   */
  delByPattern: async (pattern: string): Promise<void> => {
    try {
      const keys = await redis.keys(pattern);
      if (keys.length > 0) {
        await redis.del(...keys);
      }
    } catch (error) {
      logger.error(`Cache Pattern Del Error [${pattern}]:`, error);
    }
  },
};
