import amqp, { ChannelModel, Channel } from "amqplib";
import dotEnv from "../config/dotEnv";
import logger from "./logger";
import { commonMsg } from "./constant";

let connection: ChannelModel | null = null;
let channel: Channel | null = null;

/**
 * Establishes a connection to the RabbitMQ broker and creates a communication channel.
 * Uses the RABBITMQ_URL from the shared dotEnv configuration.
 * Includes a retry mechanism to handle startup delays.
 *
 * @param {number} retries - Number of connection attempts (default: 5).
 * @param {number} delay - Delay between attempts in ms (default: 2000).
 * @returns {Promise<void>}
 */
export const connectRabbitMQ = async (retries = 5, delay = 2000): Promise<void> => {
  if (connection) return;

  for (let i = 0; i < retries; i++) {
    try {
      connection = await amqp.connect(dotEnv.rabbitmqURL);
      channel = await connection.createChannel();
      logger.info(commonMsg.rmqConnected);
      return;
    } catch (error) {
      if (i === retries - 1) {
        logger.error("Failed to connect to RabbitMQ broker after max retries:", error);
        throw error;
      }
      logger.warn(
        `RabbitMQ connection attempt ${i + 1}/${retries} failed. Retrying in ${delay}ms...`,
      );
      await new Promise((resolve) => setTimeout(resolve, delay));
    }
  }
};

/**
 * Publishes a JSON message to a specified queue.
 * Ensures the queue exists before sending.
 *
 * @param {string} queue - The name of the RabbitMQ queue.
 * @param {any} message - The message payload to be published.
 * @returns {Promise<boolean>} Success status.
 */
export const publishMessage = async (queue: string, message: any): Promise<boolean> => {
  try {
    if (!channel) await connectRabbitMQ();
    await channel!.assertQueue(queue, { durable: true });
    return channel!.sendToQueue(queue, Buffer.from(JSON.stringify(message)), {
      persistent: true,
    });
  } catch (error) {
    logger.error(`Error publishing message to queue "${queue}":`, error);
    return false;
  }
};

/**
 * Subscribes to a queue and executes a callback for each received message.
 * Implements retry logic with exponential backoff and dead-letter queue support.
 *
 * @param {string} queue - The name of the queue to consume from.
 * @param {Function} callback - Async function to handle the message payload.
 * @param {number} maxRetries - Maximum number of retry attempts (default: 3).
 * @returns {Promise<void>}
 */
export const consumeMessage = async (
  queue: string,
  callback: (payload: any) => Promise<void>,
  maxRetries: number = 3,
): Promise<void> => {
  try {
    if (!channel) await connectRabbitMQ();

    // Declare queue with dead-letter exchange
    const dlxExchange = `${queue}.dlx`;
    const dlQueue = `${queue}.dlq`;

    await channel!.assertExchange(dlxExchange, "direct", { durable: true });
    await channel!.assertQueue(dlQueue, { durable: true });
    await channel!.bindQueue(dlQueue, dlxExchange, queue);

    await channel!.assertQueue(queue, {
      durable: true,
      arguments: {
        "x-dead-letter-exchange": dlxExchange,
        "x-dead-letter-routing-key": queue,
      },
    });

    // Set prefetch to 1 for fair dispatch
    await channel!.prefetch(1);

    await channel!.consume(
      queue,
      async (msg) => {
        if (msg) {
          const retryCount = msg.properties.headers?.["x-retry-count"] || 0;

          try {
            const payload = JSON.parse(msg.content.toString());
            logger.info(
              `[Queue] Processing message from ${queue} (attempt ${retryCount + 1}/${maxRetries + 1})`,
            );

            await callback(payload);
            channel!.ack(msg);

            logger.info(`[Queue] Successfully processed message from ${queue}`);
          } catch (error) {
            logger.error(
              `[Queue] Error processing message from ${queue} (attempt ${retryCount + 1}/${maxRetries + 1}):`,
              error,
            );

            if (retryCount < maxRetries) {
              // Requeue with incremented retry count
              const newHeaders = {
                ...msg.properties.headers,
                "x-retry-count": retryCount + 1,
                "x-last-error": String(error),
                "x-last-error-timestamp": new Date().toISOString(),
              };

              const retryDelayMs = Math.pow(2, retryCount) * 1000; // Exponential backoff: 1s, 2s, 4s
              logger.warn(
                `[Queue] Retrying message from ${queue} in ${retryDelayMs}ms (retry ${retryCount + 1}/${maxRetries})`,
              );

              // Nack without requeue - RabbitMQ will DLX requeue with delay
              channel!.nack(msg, false, false);

              // Schedule requeue after delay
              setTimeout(() => {
                try {
                  channel!.sendToQueue(queue, msg.content, {
                    headers: newHeaders,
                    persistent: true,
                  });
                  logger.info(`[Queue] Message requeued for ${queue}`);
                } catch (requeueError) {
                  logger.error(`[Queue] Failed to requeue message:`, requeueError);
                }
              }, retryDelayMs);
            } else {
              // Max retries exceeded - send to dead-letter queue
              try {
                const dlHeaders = {
                  ...msg.properties.headers,
                  "x-final-error": String(error),
                  "x-final-error-timestamp": new Date().toISOString(),
                  "x-total-retries": maxRetries,
                };

                channel!.sendToQueue(dlQueue, msg.content, {
                  headers: dlHeaders,
                  persistent: true,
                });
                channel!.ack(msg); // Acknowledge original message

                logger.error(
                  `[Queue] Message moved to dead-letter queue: ${dlQueue} after ${maxRetries} retries`,
                  error,
                );
              } catch (dlError) {
                logger.error(`[Queue] Failed to move message to DLQ:`, dlError);
                channel!.nack(msg, true); // Nack and requeue to prevent data loss
              }
            }
          }
        }
      },
      { noAck: false },
    );

    logger.info(`[Queue] Started consuming from queue: ${queue}`);
  } catch (error) {
    logger.error(`Error starting consumer for queue "${queue}":`, error);
    throw error;
  }
};

/**
 * Closes the RabbitMQ connection and channel.
 */
export const closeRabbitMQ = async (): Promise<void> => {
  try {
    if (channel) await channel.close();
    if (connection) await connection.close();
  } catch (error) {
    logger.error("Error closing RabbitMQ connection:", error);
  }
};
