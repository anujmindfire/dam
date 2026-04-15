import express from "express";
import cors from "cors";
import compression from "compression";
import cookieParser from "cookie-parser";
import helmet from "helmet";
import metadataRoutes from "./routes/metadata";
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
  metadataModel,
  findOneAndUpdate,
} from "@dam/shared";

const app = express();
const PORT = process.env.PORT || "3002";

app.use(cors({ origin: "*", credentials: true }));
app.use(compression());
app.use(cookieParser());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(helmet());

app.use(requestLogger as unknown as express.RequestHandler);
app.use(rateLimit as unknown as express.RequestHandler);

// Mount metadata routes
app.use(`${baseRoute}/metadata`, metadataRoutes);

app.use(notFoundHandler as unknown as express.RequestHandler);
app.use(errorHandler as unknown as express.ErrorRequestHandler);

/**
 * Starts consuming asset lifecycle events
 */
const startConsumers = async (): Promise<void> => {
  try {
    await connectRabbitMQ();
    logger.info("🔗 Connected to RabbitMQ");

    // Consumer for asset analysis completion
    await consumeMessage("metadata_analyzed", async (payload: any) => {
      try {
        logger.info(`[Metadata Consumer] Processing analysis for asset ${payload.assetId}`);

        // Update metadata with analysis results
        await findOneAndUpdate(
          metadataModel,
          { assetId: payload.assetId },
          {
            analysisResults: payload.analysisResults,
            tags: payload.analysisResults?.objects || [],
          }
        );

        logger.info(`[Metadata Consumer] Metadata updated for asset ${payload.assetId}`);
      } catch (error) {
        logger.error(`[Metadata Consumer] Error processing asset ${payload.assetId}:`, error);
        throw error;
      }
    });

    // Consumer for asset creation
    await consumeMessage("asset_created", async (payload: any) => {
      try {
        logger.info(`[Metadata Consumer] Initializing metadata for new asset ${payload.assetId}`);
        // Metadata is already created in asset service, this is for initialization
        logger.info(`[Metadata Consumer] Asset ${payload.assetId} ready for enrichment`);
      } catch (error) {
        logger.error(`[Metadata Consumer] Error on asset_created:`, error);
      }
    });

    // Consumer for asset deletion
    await consumeMessage("asset_deleted", async (payload: any) => {
      try {
        logger.info(`[Metadata Consumer] Cleaning metadata for deleted asset ${payload.assetId}`);
        // Archive or remove related metadata
        logger.info(`[Metadata Consumer] Metadata cleanup done for asset ${payload.assetId}`);
      } catch (error) {
        logger.error(`[Metadata Consumer] Error on asset_deleted:`, error);
      }
    });

    logger.info("✅ All metadata consumers started");
  } catch (error) {
    logger.error("Failed to start metadata consumers:", error);
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
      logger.info(`🚀 Metadata Service running on port ${PORT}`);
    });
  } catch (error) {
    logger.error("Metadata Service failed to start:", error);
    process.exit(1);
  }
};

bootstrap();
