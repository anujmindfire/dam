import express from "express";
import fs from "fs";
import path from "path";
import http from "http";
import cors from "cors";
import compression from "compression";
import cookieParser from "cookie-parser";
import helmet from "helmet";
import swaggerUi from "swagger-ui-express";
import webRoutes from "./routes/index";
import { seedDatabase } from "./config/seed";
import {
  logger,
  connectDB,
  databaseMsg,
  dotEnv,
  requestLogger,
  errorHandler,
  notFoundHandler,
  rateLimit,
  commonMsg,
} from "@dam/shared";

const swaggerDocument = JSON.parse(fs.readFileSync(path.join(__dirname, "swagger.json"), "utf8"));

const app = express();
const httpServer = http.createServer(app);

app.use(cors({ origin: dotEnv.clientURL, credentials: true }));
app.use(compression());
app.use(cookieParser());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(helmet());

app.use("/api/docs", swaggerUi.serve, swaggerUi.setup(swaggerDocument));

app.use(requestLogger as unknown as express.RequestHandler);
app.use(rateLimit() as unknown as express.RequestHandler);
app.use(webRoutes);
app.use(notFoundHandler as unknown as express.RequestHandler);
app.use(errorHandler as unknown as express.ErrorRequestHandler);

const startServer = async (): Promise<void> => {
  await connectDB();

  if (process.argv.includes(databaseMsg.seed)) {
    await seedDatabase();
    process.exit(0);
  }

  httpServer.listen(dotEnv.serverPort, () => {
    logger.info(commonMsg.expressAppRunning(dotEnv.serverPort));
  });
};

process.on("uncaughtException", (error: Error) => {
  logger.error(commonMsg.uncaughtException, error);
  process.exit(1);
});

process.on("unhandledRejection", (error: Error) => {
  logger.error(commonMsg.unhandledRejection, error);
  process.exit(1);
});

process.on("SIGTERM", async () => {
  logger.info(commonMsg.httpCloseConnection);

  httpServer.close(() => {
    logger.info(commonMsg.httpServerClosed);
  });

  process.exit(0);
});

process.on("SIGINT", async () => {
  logger.info(commonMsg.signInDown);

  httpServer.close(() => {
    logger.info(commonMsg.httpServerClosed);
    process.exit(0);
  });
});

startServer();
