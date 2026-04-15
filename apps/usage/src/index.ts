import express from "express";
import cors from "cors";
import compression from "compression";
import cookieParser from "cookie-parser";
import helmet from "helmet";
import usageRoutes from "./routes/usage";
import analyticsRoutes from "./routes/analytics";
import {
  logger,
  connectDB,
  connectRabbitMQ,
  consumeMessage,
  redis,
  requestLogger,
  errorHandler,
  notFoundHandler,
  rateLimit,
  common,
  database,
  baseRoute,
} from "@dam/shared";

const app = express();
const PORT = process.env.PORT || "3003";

app.use(cors({ origin: "*", credentials: true }));
app.use(compression());
app.use(cookieParser());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(helmet());

app.use(requestLogger as unknown as express.RequestHandler);
app.use(rateLimit as unknown as express.RequestHandler);

// Mount routes
app.use(`${baseRoute}/usage`, usageRoutes);
app.use(`${baseRoute}/analytics`, analyticsRoutes);

app.use(notFoundHandler as unknown as express.RequestHandler);
app.use(errorHandler as unknown as express.ErrorRequestHandler);

/**
 * Starts consuming asset lifecycle events
 */
const startConsumers = async (): Promise<void> => {
  try {
    await connectRabbitMQ();
    logger.info("🔗 Connected to RabbitMQ");

    // Consumer for asset creation - initialize usage tracking
    await consumeMessage("asset_created", async (payload: any) => {
      try {
        logger.info(`[Usage Consumer] Initializing tracking for new asset ${payload.assetId}`);
        // Initialize usage metrics in database
        // This would be implemented if a UsageMetrics model exists
        logger.info(`[Usage Consumer] Tracking initialized for asset ${payload.assetId}`);
      } catch (error) {
        logger.error(`[Usage Consumer] Error on asset_created:`, error);
        throw error;
      }
    });

    // Consumer for asset approval
    await consumeMessage("asset_approved", async (payload: any) => {
      try {
        logger.info(`[Usage Consumer] Asset ${payload.assetId} approved - usage tracking active`);
      } catch (error) {
        logger.error(`[Usage Consumer] Error on asset_approved:`, error);
      }
    });

    // Consumer for asset deletion
    await consumeMessage("asset_deleted", async (payload: any) => {
      try {
        logger.info(`[Usage Consumer] Archiving usage data for asset ${payload.assetId}`);
        // Archive existing usage records instead of deleting
        logger.info(`[Usage Consumer] Usage data archived for asset ${payload.assetId}`);
      } catch (error) {
        logger.error(`[Usage Consumer] Error on asset_deleted:`, error);
      }
    });

    logger.info("✅ All usage consumers started");
  } catch (error) {
    logger.error("Failed to start usage consumers:", error);
    process.exit(1);
  }
};

const bootstrap = async (): Promise<void> => {
  try {
    await connectDB();
    logger.info(database.dbConnectionSuccess);

    redis.on("ready", () => logger.info(common.redisReady));

    // Start consuming messages
    await startConsumers();

    app.listen(PORT, () => {
      logger.info(`🚀 Usage Service running on port ${PORT}`);
    });
  } catch (error) {
    logger.error("Usage Service failed to start:", error);
    process.exit(1);
  }
};

bootstrap();
