import express from "express";
import cors from "cors";
import compression from "compression";
import cookieParser from "cookie-parser";
import helmet from "helmet";
import metadataRoutes from "./routes/metadata";
import {
  logger,
  connectDB,
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

const bootstrap = async (): Promise<void> => {
  try {
    await connectDB();
    logger.info(database.dbConnectionSuccess);

    redis.on("ready", () => logger.info(common.redisReady));

    app.listen(PORT, () => {
      logger.info(`🚀 Metadata Service running on port ${PORT}`);
    });
  } catch (error) {
    logger.error("Metadata Service failed to start:", error);
    process.exit(1);
  }
};

bootstrap();
