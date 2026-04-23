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
  baseRoute,
  queue,
  cacheKey,
  workerMsg,
  enums,
  generateSystemReport,
  AssetsProps,
} from "@dam/shared";
import type { AssetUploadedPayloadProps } from "@dam/shared";
import express, { Request, Response } from "express";
import { analyzeAsset } from "./services/analysis";
import { validateAssetExpiry } from "./services/governance";

/**
 * Flags an assets as expired if its expiryDate is in the past.
 * Uses findOneAndUpdate from shared repositories — no direct Sequelize calls.
 */
const flagExpiryIfNeeded = async (assetsId: number): Promise<boolean> => {
  const assetData = await findOne(assetsModel, { id: assetsId });
  if (!assetData) return false;

  if (assetData.expiryDate && new Date(assetData.expiryDate) < new Date()) {
    await findOneAndUpdate(assetsModel, { id: assetsId }, { status: enums.expired });
    logger.warn(workerMsg.assetExpired(assetsId));
    return true;
  }
  return false;
};

/**
 * Detects duplicate assets by comparing MD5 hash against existing metadata records.
 * Uses findOne from shared repositories.
 */
const detectDuplicate = async (assetsId: number, hash: string): Promise<boolean> => {
  // Find any metadata record with same hash that belongs to a DIFFERENT assets
  const existing = await findOne(metadataModel, {
    hash,
    assetsId: { [Op.ne]: assetsId },
  } as Record<string, unknown>);

  if (existing) {
    await findOneAndUpdate(metadataModel, { assetsId }, { isDuplicate: true });
    logger.warn(workerMsg.duplicateDetected(assetsId));
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

    // 2. Start consuming assets upload events
    await consumeMessage(queue.assetUploaded, async (payload: AssetUploadedPayloadProps) => {
      logger.info(workerMsg.processingAsset(payload.assetsId, payload.filename));

      // Create a background job log
      const job = await create(jobModel, {
        type: "Media Processing & Compliance",
        target: payload.filename,
        status: "processing",
        progress: 10,
        startedAt: new Date(),
      });

      try {
        logger.info(workerMsg.analysisStart(payload.assetsId, payload.filename));
        // A. Run media analysis — thumbnails, hash extraction, classification
        const { hash, analysisResults } = await analyzeAsset(
          payload.assetsId.toString(),
          payload.storageKey,
          payload.type,
        );
        logger.info(workerMsg.analysisComplete(payload.assetsId, hash));

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
        logger.info(workerMsg.metadataUpdated(payload.assetsId));

        // C. Check for duplicate assets
        const isDuplicate = await detectDuplicate(payload.assetsId, hash);
        if (isDuplicate) {
          logger.warn(workerMsg.duplicateDetected(payload.assetsId));
          await findOneAndUpdate(
            jobModel,
            { id: job.id },
            { status: "completed", message: workerMsg.duplicateDetectedShort },
          );
          return;
        }

        // D. Flag expiry if past expiryDate
        const isExpired = await flagExpiryIfNeeded(payload.assetsId);
        if (isExpired) {
          logger.warn(workerMsg.assetExpired(payload.assetsId));
          await findOneAndUpdate(
            jobModel,
            { id: job.id },
            { status: "completed", message: workerMsg.assetExpiredShort },
          );
          return;
        }

        // E. Lifecycle transition: pending → reviewed
        await findOneAndUpdate(assetsModel, { id: payload.assetsId }, { status: enums.reviewed });
        logger.info(workerMsg.statusUpdated(payload.assetsId, enums.reviewed));

        // F. Create automatic approval request
        logger.info(workerMsg.creatingApproval(payload.assetsId));
        await create(approvalModel, {
          assetsId: payload.assetsId,
          requestedBy: payload.owner,
          status: enums.pending,
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
            message: workerMsg.jobMessageSuccess,
          },
        );

        logger.info(workerMsg.transitionComplete(payload.assetsId, enums.reviewed));
      } catch (err) {
        logger.error(workerMsg.processingFailed(payload.assetsId), err);

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

        // 2. Revert assets status to pending so it can be retried
        await update(assetsModel, { id: payload.assetsId }, { status: "pending" });
      }
    });

    // 3. Start consuming system maintenance events (Bulk scanning)
    await consumeMessage(queue.systemMaintenance, async () => {
      logger.info(workerMsg.maintenanceStart);

      const { result: assets } = await findAll(assetsModel, {
        where: { status: { [Op.not]: enums.expired } },
      });

      let flaggedCount = 0;
      for (const assetsData of assets) {
        const isExpired = await flagExpiryIfNeeded((assetsData as AssetsProps).id);
        if (isExpired) flaggedCount++;
      }

      logger.info(workerMsg.maintenanceComplete(flaggedCount));
    });

    // 4. Start consuming report generation events
    await consumeMessage(queue.reportGeneration, async () => {
      logger.info(workerMsg.reportStart);
      try {
        const report = await generateSystemReport();
        // Save to Redis for fast retrieval by the API
        await redis.set(cacheKey.latestReport, JSON.stringify(report), "EX", 3600); // 1 hour TTL
        logger.info(commonMsg.reportPrecomputed);
      } catch (err) {
        logger.error(workerMsg.reportError, err);
      }
    });

    logger.info(workerMsg.listening);

    // 5. Minimal health check server for worker
    const healthApp = express();
    healthApp.get(`${baseRoute}/health`, (_req: Request, res: Response) => {
      res.status(200).json({ status: "healthy", service: "Worker", uptime: process.uptime() });
    });
    healthApp.listen(dotEnv.workerPort, () => {
      logger.info(`[Worker] Health monitor running on port ${dotEnv.workerPort}`);
    });

    // 6. Automated Governance Trigger (Run every 5 minutes)
    setInterval(
      async () => {
        logger.info(workerMsg.triggeringExpiry);
        await validateAssetExpiry();
      },
      5 * 60 * 1000,
    );
  } catch (err) {
    logger.error("[Worker] Bootstrap failed:", err);
    process.exit(1);
  }
};

bootstrap();
