import amqplib from "amqplib";
import dotEnv from "../config/dotEnv";
import logger from "./logger";
import { common } from "./constant";

type Connection = amqplib.Connection;
type Channel = amqplib.Channel;

let connection: Connection | null = null;
let channel: Channel | null = null;

/**
 * Establishes a connection to the RabbitMQ broker and creates a communication channel.
 * Uses the RABBITMQ_URL from the shared dotEnv configuration.
 *
 * @returns {Promise<void>}
 */
export const connectRabbitMQ = async (): Promise<void> => {
  try {
    if (!connection) {
      connection = await amqplib.connect(dotEnv.rabbitmqURL);
      channel = await connection.createChannel();
      logger.info(common.rmqConnected);
    }
  } catch (error) {
    logger.error("Failed to connect to RabbitMQ broker:", error);
    throw error;
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
 * Automatically acknowledges the message after successful processing.
 *
 * @param {string} queue - The name of the queue to consume from.
 * @param {Function} callback - Async function to handle the message payload.
 * @returns {Promise<void>}
 */
export const consumeMessage = async (queue: string, callback: (payload: any) => Promise<void>): Promise<void> => {
  try {
    if (!channel) await connectRabbitMQ();
    await channel!.assertQueue(queue, { durable: true });
    
    await channel!.consume(queue, async (msg) => {
      if (msg) {
        try {
          const payload = JSON.parse(msg.content.toString());
          await callback(payload);
          channel!.ack(msg);
        } catch (error) {
          logger.error(`Error processing message from queue "${queue}":`, error);
          // Optional: nack the message if process fails
        }
      }
    });
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
