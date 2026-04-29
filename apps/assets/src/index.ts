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
  configureBucket,
} from "@dam/shared";

const app = express();
const PORT = dotEnv.assetsPort;

app.use(cors({ origin: "*", credentials: true }));
app.use(compression());
app.use(cookieParser());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(
  helmet({
    contentSecurityPolicy: false,
    crossOriginResourcePolicy: false,
    frameguard: false,
  }),
);

app.use(requestLogger as unknown as express.RequestHandler);
app.use(rateLimit() as unknown as express.RequestHandler);

app.get(`${baseRoute}/health`, (_req, res) => {
  res
    .status(200)
    .json({ status: "healthy", service: "Assets", timestamp: new Date().toISOString() });
});

// Mount assets routes
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

    // Configure MinIO Bucket (CORS, etc.)
    await configureBucket();
    logger.info("MinIO bucket configured successfully");

    // Redis is initialized lazily on first use
    redis.on("ready", () => logger.info(commonMsg.redisReady));

    app.listen(PORT, () => {
      logger.info(commonMsg.assetsServiceRunning(PORT));
    });
  } catch (error) {
    logger.error(commonMsg.serviceFailed("Assets"), error);
    process.exit(1);
  }
};

bootstrap();
