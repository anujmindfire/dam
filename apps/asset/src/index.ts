import express from "express";
import cors from "cors";
import compression from "compression";
import cookieParser from "cookie-parser";
import helmet from "helmet";
import assetRoutes from "./routes/asset";
import {
  logger,
  connectDB,
  connectRabbitMQ,
  redis,
  dotEnv,
  requestLogger,
  errorHandler,
  notFoundHandler,
  rateLimit,
  common,
  database,
  baseRoute,
  apiUrl,
} from "@dam/shared";

const app = express();
const PORT = process.env.PORT || "3001";

app.use(cors({ origin: "*", credentials: true }));
app.use(compression());
app.use(cookieParser());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(helmet());

app.use(requestLogger as unknown as express.RequestHandler);
app.use(rateLimit as unknown as express.RequestHandler);

// Mount asset routes
app.use(`${baseRoute}${apiUrl.assest}`, assetRoutes);

app.use(notFoundHandler as unknown as express.RequestHandler);
app.use(errorHandler as unknown as express.ErrorRequestHandler);

const bootstrap = async (): Promise<void> => {
  try {
    // Connect to shared infrastructure
    await connectDB();
    logger.info(database.dbConnectionSuccess);

    await connectRabbitMQ();
    logger.info(common.rmqConnected);

    // Redis is initialized lazily on first use
    redis.on("ready", () => logger.info(common.redisReady));

    app.listen(PORT, () => {
      logger.info(`🚀 Asset Service running on port ${PORT}`);
    });
  } catch (error) {
    logger.error("Asset Service failed to start:", error);
    process.exit(1);
  }
};

bootstrap();
