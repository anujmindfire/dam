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
  dotEnv,
  requestLogger,
  errorHandler,
  notFoundHandler,
  rateLimit,
  commonMsg,
  consumerMsg,
  databaseMsg,
  baseRoute,
  apiUrl,
} from "@dam/shared";

const app = express();
const PORT = dotEnv.usagePort;

app.use(cors({ origin: "*", credentials: true }));
app.use(compression());
app.use(cookieParser());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(helmet());

app.use(requestLogger as unknown as express.RequestHandler);
app.use(rateLimit() as unknown as express.RequestHandler);

app.get(`${baseRoute}/health`, (_req, res) => {
  res.status(200).json({ status: "healthy", service: "Usage", timestamp: new Date().toISOString() });
});

// Mount routes
app.use(`${baseRoute}${apiUrl.usage}`, usageRoutes);
app.use(`${baseRoute}${apiUrl.analytics}`, analyticsRoutes);

app.use(notFoundHandler as unknown as express.RequestHandler);
app.use(errorHandler as unknown as express.ErrorRequestHandler);

/**
 * Starts consuming asset lifecycle events
 */
const startConsumers = async (): Promise<void> => {
  try {
    await connectRabbitMQ();
    logger.info(commonMsg.rmqConnected);

    // Consumer for asset creation - initialize usage tracking
    await consumeMessage("asset_created", async (payload: any) => {
      try {
        logger.info(consumerMsg.usageAssetCreated(payload.assetId));
        logger.info(consumerMsg.usageAssetCreatedSuccess(payload.assetId));
      } catch (error) {
        logger.error(consumerMsg.usageAssetCreatedError, error);
        throw error;
      }
    });

    // Consumer for asset approval
    await consumeMessage("asset_approved", async (payload: any) => {
      try {
        logger.info(consumerMsg.usageAssetApproved(payload.assetId));
      } catch (error) {
        logger.error(consumerMsg.usageAssetApprovedError, error);
      }
    });

    // Consumer for asset deletion
    await consumeMessage("asset_deleted", async (payload: any) => {
      try {
        logger.info(consumerMsg.usageAssetDeleted(payload.assetId));
        logger.info(consumerMsg.usageAssetDeletedSuccess(payload.assetId));
      } catch (error) {
        logger.error(consumerMsg.usageAssetDeletedError, error);
      }
    });

    logger.info(consumerMsg.allUsageConsumersStarted);
  } catch (error) {
    logger.error(consumerMsg.usageConsumersError, error);
    process.exit(1);
  }
};

const bootstrap = async (): Promise<void> => {
  try {
    await connectDB();
    logger.info(databaseMsg.dbConnectionSuccess);

    redis.on("ready", () => logger.info(commonMsg.redisReady));

    // Start consuming messages
    await startConsumers();

    app.listen(PORT, "0.0.0.0", () => {
      logger.info(commonMsg.usageServiceRunning(PORT));
    });
  } catch (error) {
    logger.error(commonMsg.serviceFailed("Usage"), error);
    process.exit(1);
  }
};

bootstrap();
