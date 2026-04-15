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

const bootstrap = async (): Promise<void> => {
  try {
    await connectDB();
    logger.info(database.dbConnectionSuccess);

    redis.on("ready", () => logger.info(common.redisReady));

    app.listen(PORT, () => {
      logger.info(`🚀 Usage Service running on port ${PORT}`);
    });
  } catch (error) {
    logger.error("Usage Service failed to start:", error);
    process.exit(1);
  }
};

bootstrap();
