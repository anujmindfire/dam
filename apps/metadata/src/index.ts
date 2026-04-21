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
  metadataModel,
  findOneAndUpdate,
} from "@dam/shared";

const app = express();
const PORT = dotEnv.metadataPort;

app.use(cors({ origin: "*", credentials: true }));
app.use(compression());
app.use(cookieParser());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(helmet());

app.use(requestLogger as unknown as express.RequestHandler);
app.use(rateLimit() as unknown as express.RequestHandler);

app.get(`${baseRoute}/health`, (_req, res) => {
  res
    .status(200)
    .json({ status: "healthy", service: "Metadata", timestamp: new Date().toISOString() });
});

app.use(`${baseRoute}${apiUrl.metadata}`, metadataRoutes);

app.use(notFoundHandler as unknown as express.RequestHandler);
app.use(errorHandler as unknown as express.ErrorRequestHandler);

/**
 * Starts consuming asset lifecycle events
 */
const startConsumers = async (): Promise<void> => {
  try {
    await connectRabbitMQ();
    logger.info(commonMsg.rmqConnected);

    await consumeMessage("metadata_analyzed", async (payload: any) => {
      try {
        logger.info(consumerMsg.metadataAnalyzedProcessing(payload.assetsId));

        await findOneAndUpdate(
          metadataModel,
          { assetsId: payload.assetsId },
          {
            analysisResults: payload.analysisResults,
            tags: payload.analysisResults?.objects || [],
          },
        );

        logger.info(consumerMsg.metadataAnalyzedSuccess(payload.assetsId));
      } catch (error) {
        logger.error(consumerMsg.metadataAnalyzedError(payload.assetsId), error);
        throw error;
      }
    });

    await consumeMessage("assets_created", async (payload: any) => {
      try {
        logger.info(consumerMsg.assetCreatedMetadata(payload.assetsId));
        logger.info(consumerMsg.assetCreatedMetadataReady(payload.assetsId));
      } catch (error) {
        logger.error(consumerMsg.assetCreatedMetadataError, error);
      }
    });

    await consumeMessage("assets_deleted", async (payload: any) => {
      try {
        logger.info(consumerMsg.assetDeletedMetadata(payload.assetsId));
        logger.info(consumerMsg.assetDeletedMetadataCleanup(payload.assetsId));
      } catch (error) {
        logger.error(consumerMsg.assetDeletedMetadataError, error);
      }
    });

    logger.info(consumerMsg.allMetadataConsumersStarted);
  } catch (error) {
    logger.error(consumerMsg.metadataConsumersError, error);
    process.exit(1);
  }
};

const bootstrap = async (): Promise<void> => {
  try {
    await connectDB();
    logger.info(databaseMsg.dbConnectionSuccess);

    redis.on("ready", () => logger.info(commonMsg.redisReady));

    await startConsumers();

    app.listen(PORT, () => {
      logger.info(commonMsg.metadataServiceRunning(PORT));
    });
  } catch (error) {
    logger.error(commonMsg.serviceFailed("Metadata"), error);
    process.exit(1);
  }
};

bootstrap();
