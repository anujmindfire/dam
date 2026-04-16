import {
  logger,
  connectRabbitMQ,
  consumeMessage,
  connectDB,
  assetModel,
  metadataModel,
  findOne,
  findOneAndUpdate,
  update,
  findAll,
  commonMsg,
  databaseMsg,
  Op,
  dotEnv,
  redis,
  generateSystemReport,
  baseRoute,
} from "@dam/shared";
import express, { Request, Response } from "express";
import { analyzeAsset } from "./services/analysis";

/**
 * Payload shape published by the Asset Service on upload.
 */
interface AssetUploadedPayload {
  assetId: number;
  filename: string;
  storageKey: string;
  type: string;
  owner: string;
  timestamp: string;
}

/**
 * Flags an asset as expired if its expiryDate is in the past.
 * Uses findOneAndUpdate from shared repositories — no direct Sequelize calls.
 */
const flagExpiryIfNeeded = async (assetId: number): Promise<boolean> => {
  const asset = await findOne(assetModel, { id: assetId });
  if (!asset) return false;

  if (asset.expiryDate && new Date(asset.expiryDate) < new Date()) {
    await findOneAndUpdate(assetModel, { id: assetId }, { status: "expired" });
    logger.warn(`[Worker] Asset [ID: ${assetId}] flagged as EXPIRED`);
    return true;
  }
  return false;
};

/**
 * Detects duplicate assets by comparing MD5 hash against existing metadata records.
 * Uses findOne from shared repositories.
 */
const detectDuplicate = async (assetId: number, hash: string): Promise<boolean> => {
  // Find any metadata record with same hash that belongs to a different asset
  const existing = await findOne(metadataModel, { hash } as any);

  if (existing && (existing as any).assetId !== String(assetId)) {
    await findOneAndUpdate(metadataModel, { assetId: String(assetId) }, { isDuplicate: true });
    logger.warn(`[Worker] Duplicate detected for Asset [ID: ${assetId}] — matches hash ${hash}`);
    return true;
  }
  return false;
};

/**
 * Worker bootstrap: connects all infrastructure and starts consuming the asset_uploaded queue.
 */
const bootstrap = async (): Promise<void> => {
  try {
    // 1. Connect to shared infrastructure
    await connectDB();
    logger.info(databaseMsg.dbConnectionSuccess);

    await connectRabbitMQ();
    logger.info(commonMsg.rmqConnected);

    // 2. Start consuming asset upload events
    await consumeMessage("asset_uploaded", async (payload: AssetUploadedPayload) => {
      logger.info(`[Worker] Processing Asset [ID: ${payload.assetId}] — ${payload.filename}`);

      try {
        // A. Run media analysis — thumbnails, hash extraction, classification
        const { hash, analysisResults } = await analyzeAsset(
          payload.assetId.toString(),
          payload.storageKey,
          payload.type,
        );

        // B. Persist hash and analysis results using repository
        await findOneAndUpdate(
          metadataModel,
          { assetId: String(payload.assetId) },
          {
            hash,
            analysisResults,
            tags: analysisResults?.objects || [],
          },
        );
        logger.info(`[Worker] Metadata updated for Asset [ID: ${payload.assetId}]`);

        // C. Check for duplicate assets
        const isDuplicate = await detectDuplicate(payload.assetId, hash);
        if (isDuplicate) {
          logger.warn(
            `[Worker] Asset [ID: ${payload.assetId}] is a DUPLICATE — skipping lifecycle transition`,
          );
          return;
        }

        // D. Flag expiry if past expiryDate
        const isExpired = await flagExpiryIfNeeded(payload.assetId);
        if (isExpired) {
          logger.warn(
            `[Worker] Asset [ID: ${payload.assetId}] is EXPIRED — skipping lifecycle transition`,
          );
          return;
        }

        // E. Lifecycle transition: pending → reviewed
        await findOneAndUpdate(assetModel, { id: payload.assetId }, { status: "reviewed" });
        logger.info(`[Worker] Asset [ID: ${payload.assetId}] transitioned to "reviewed"`);
      } catch (err) {
        logger.error(`[Worker] Failed to process Asset [ID: ${payload.assetId}]:`, err);
        // Mark as failed without crashing the worker (fault tolerance)
        await update(assetModel, { id: payload.assetId }, { status: "pending" });
      }
    });

    // 3. Start consuming system maintenance events (Bulk scanning)
    await consumeMessage("system_maintenance", async () => {
      logger.info("[Worker] Starting periodic system maintenance scan...");

      const { result: assets } = await findAll(assetModel, {
        where: { status: { [Op.not]: "expired" } },
      });

      let flaggedCount = 0;
      for (const asset of assets) {
        const isExpired = await flagExpiryIfNeeded((asset as any).id);
        if (isExpired) flaggedCount++;
      }

      logger.info(`[Worker] Maintenance scan complete. ${flaggedCount} assets flagged as expired.`);
    });

    // 4. Start consuming report generation events
    await consumeMessage("report_generation", async () => {
      logger.info("[Worker] 📊 Starting background report generation...");
      try {
        const report = await generateSystemReport();
        // Save to Redis for fast retrieval by the API
        await redis.set("system:report:latest", JSON.stringify(report), "EX", 3600); // 1 hour TTL
        logger.info("[Worker] ✅ System report precomputed and cached.");
      } catch (err) {
        logger.error("[Worker] Failed to generate background report:", err);
      }
    });

    logger.info("[Worker] ✅ Listening for jobs on queues: asset_uploaded, system_maintenance, report_generation");

    // 5. Minimal health check server for worker
    const healthApp = express();
    healthApp.get(`${baseRoute}/health`, (_req: Request, res: Response) => {
      res.status(200).json({ status: "healthy", service: "Worker", uptime: process.uptime() });
    });
    healthApp.listen(dotEnv.workerPort || 3005, "0.0.0.0", () => {
      logger.info(`[Worker] Health monitor running on port ${dotEnv.workerPort || 3005}`);
    });
  } catch (err) {
    logger.error("[Worker] Bootstrap failed:", err);
    process.exit(1);
  }
};

bootstrap();
