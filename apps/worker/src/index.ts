// Worker Service - V1.1 (Pluralized Assets Support)
import {
  logger,
  connectRabbitMQ,
  consumeMessage,
  connectDB,
  assetsModel,
  metadataModel,
  approvalModel,
  jobModel,
  create,
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
 * Payload shape published by the  Service on upload.
 */
interface AssetUploadedPayload {
  assetsId: number;
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
const flagExpiryIfNeeded = async (assetsId: number): Promise<boolean> => {
  const asset = await findOne(assetsModel, { id: assetsId });
  if (!asset) return false;

  if (asset.expiryDate && new Date(asset.expiryDate) < new Date()) {
    await findOneAndUpdate(assetsModel, { id: assetsId }, { status: "expired" });
    logger.warn(`[Worker]  [ID: ${assetsId}] flagged as EXPIRED`);
    return true;
  }
  return false;
};

/**
 * Detects duplicate assets by comparing MD5 hash against existing metadata records.
 * Uses findOne from shared repositories.
 */
const detectDuplicate = async (assetsId: number, hash: string): Promise<boolean> => {
  // Find any metadata record with same hash that belongs to a different asset
  const existing = await findOne(metadataModel, { hash } as any);

  if (existing && (existing as any).assetsId !== String(assetsId)) {
    await findOneAndUpdate(metadataModel, { assetsId: String(assetsId) }, { isDuplicate: true });
    logger.warn(`[Worker] Duplicate detected for  [ID: ${assetsId}] — matches hash ${hash}`);
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
      logger.info(`[Worker] Processing  [ID: ${payload.assetsId}] — ${payload.filename}`);

      // Create a background job log
      const job = await create(jobModel, {
        type: "Media Processing & Compliance",
        target: payload.filename,
        status: "processing",
        progress: 10,
        startedAt: new Date(),
      });

      try {
        logger.info(
          `[Worker] [ID: ${payload.assetsId}] Starting analysis for ${payload.filename}...`,
        );
        // A. Run media analysis — thumbnails, hash extraction, classification
        const { hash, analysisResults } = await analyzeAsset(
          payload.assetsId.toString(),
          payload.storageKey,
          payload.type,
        );
        logger.info(`[Worker] [ID: ${payload.assetsId}] Analysis complete. Hash: ${hash}`);

        // B. Persist hash and analysis results using repository
        await findOneAndUpdate(
          metadataModel,
          { assetsId: String(payload.assetsId) },
          {
            hash,
            analysisResults,
            tags: analysisResults?.objects || [],
          },
        );
        logger.info(`[Worker] [ID: ${payload.assetsId}] Metadata updated in DB.`);

        // C. Check for duplicate assets
        const isDuplicate = await detectDuplicate(payload.assetsId, hash);
        if (isDuplicate) {
          logger.warn(
            `[Worker] [ID: ${payload.assetsId}] is a DUPLICATE — skipping lifecycle transition`,
          );
          await findOneAndUpdate(
            jobModel,
            { id: job.id },
            { status: "completed", message: "Duplicate detected." },
          );
          return;
        }

        // D. Flag expiry if past expiryDate
        const isExpired = await flagExpiryIfNeeded(payload.assetsId);
        if (isExpired) {
          logger.warn(
            `[Worker] [ID: ${payload.assetsId}] is EXPIRED — skipping lifecycle transition`,
          );
          await findOneAndUpdate(
            jobModel,
            { id: job.id },
            { status: "completed", message: "Asset is expired." },
          );
          return;
        }

        // E. Lifecycle transition: pending → reviewed
        await findOneAndUpdate(assetsModel, { id: payload.assetsId }, { status: "reviewed" });
        logger.info(`[Worker] [ID: ${payload.assetsId}] Status updated to "reviewed".`);

        // F. Create automatic approval request
        logger.info(`[Worker] [ID: ${payload.assetsId}] Creating approval request...`);
        await create(approvalModel, {
          assetsId: payload.assetsId,
          requestedBy: payload.owner,
          status: "pending",
          priority: "normal",
        });

        // G. Complete the job log
        await findOneAndUpdate(
          jobModel,
          { id: job.id },
          {
            status: "completed",
            progress: 100,
            completedAt: new Date(),
            message: "Analyzed, duplicates checked, and approval workflow initiated.",
          },
        );

        logger.info(
          `[Worker]  [ID: ${payload.assetsId}] transitioned to "reviewed" and approval initiated.`,
        );
      } catch (err) {
        logger.error(`[Worker] Failed to process assets [ID: ${payload.assetsId}]:`, err);

        // 1. Mark the background job as failed
        await findOneAndUpdate(
          jobModel,
          { id: job.id },
          {
            status: "failed",
            completedAt: new Date(),
            message: `Processing failed: ${(err as Error).message}`,
          },
        );

        // 2. Revert asset status to pending so it can be retried
        await update(assetsModel, { id: payload.assetsId }, { status: "pending" });
      }
    });

    // 3. Start consuming system maintenance events (Bulk scanning)
    await consumeMessage("system_maintenance", async () => {
      logger.info("[Worker] Starting periodic system maintenance scan...");

      const { result: assets } = await findAll(assetsModel, {
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

    logger.info(
      "[Worker] ✅ Listening for jobs on queues: asset_uploaded, system_maintenance, report_generation",
    );

    // 5. Minimal health check server for worker
    const healthApp = express();
    healthApp.get(`${baseRoute}/health`, (_req: Request, res: Response) => {
      res.status(200).json({ status: "healthy", service: "Worker", uptime: process.uptime() });
    });
    healthApp.listen(dotEnv.workerPort, () => {
      logger.info(`[Worker] Health monitor running on port ${dotEnv.workerPort}`);
    });
  } catch (err) {
    logger.error("[Worker] Bootstrap failed:", err);
    process.exit(1);
  }
};

bootstrap();
