import express from "express";
import cors from "cors";
import compression from "compression";
import cookieParser from "cookie-parser";
import helmet from "helmet";
import assetRoutes from "./routes/assets";
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
  commonMsg,
  databaseMsg,
  baseRoute,
  apiUrl,
} from "@dam/shared";

const app = express();
const PORT = dotEnv.assetsPort;

app.use(cors({ origin: "*", credentials: true }));
app.use(compression());
app.use(cookieParser());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(helmet());

app.use(requestLogger as unknown as express.RequestHandler);
app.use(rateLimit() as unknown as express.RequestHandler);

app.get(`${baseRoute}/health`, (_req, res) => {
  res.status(200).json({ status: "healthy", service: "Asset", timestamp: new Date().toISOString() });
});

// Mount asset routes
app.use(`${baseRoute}${apiUrl.assets}`, assetRoutes);

app.use(notFoundHandler as unknown as express.RequestHandler);
app.use(errorHandler as unknown as express.ErrorRequestHandler);

const bootstrap = async (): Promise<void> => {
  try {
    // Connect to shared infrastructure
    await connectDB();
    logger.info(databaseMsg.dbConnectionSuccess);

    await connectRabbitMQ();
    logger.info(commonMsg.rmqConnected);

    // Redis is initialized lazily on first use
    redis.on("ready", () => logger.info(commonMsg.redisReady));

    app.listen(PORT, "0.0.0.0", () => {
      logger.info(commonMsg.assetServiceRunning(PORT));
    });
  } catch (error) {
    logger.error(commonMsg.serviceFailed("Asset"), error);
    process.exit(1);
  }
};

bootstrap();
