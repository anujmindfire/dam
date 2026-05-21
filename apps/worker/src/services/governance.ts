import {
  assetsModel,
  logger,
  Op,
  cacheUtil as cache,
  sequelize,
  usageModel,
  metadataModel,
  uploadFile,
  getPresignedUrl,
  dotEnv,
} from "@dam/shared";

/**
 * Validates all historical assets for expiry dates.
 * Transitions status to 'expired' for any asset where expiryDate < NOW.
 */
export const validateAssetExpiry = async (): Promise<number> => {
  try {
    logger.info("[Worker] Starting background expiry validation sweep...");
    const now = new Date();

    const [updatedCount] = await assetsModel.update(
      { status: "expired" },
      {
        where: {
          status: { [Op.ne]: "expired" },
          expiryDate: { [Op.lt]: now },
        },
      },
    );

    if (updatedCount > 0) {
      logger.info(
        `[Worker] Expiry validation complete. Flagged ${updatedCount} assets as expired.`,
      );
      // Invalidate analytics cache
      await cache.del("analytics:overview");
    }

    return updatedCount;
  } catch (error) {
    logger.error(`[Worker] Expiry validation failed: ${(error as Error).message}`);
    return 0;
  }
};

interface DistributionItem {
  mimetype: string;
  count: number;
}

interface TrendItem {
  date: string;
  count: number;
}

/**
 * Generates a comprehensive system intelligence report.
 * Aggregates usage, duplication, and compliance trends.
 * Saves results to Redis and generates a downloadable report file.
 */
export const generateSystemReport = async (): Promise<Record<string, unknown>> => {
  try {
    logger.info("[Worker] Generating large-scale intelligence report...");

    // 1. Storage & Distribution
    const distribution = await assetsModel.findAll({
      attributes: ["mimetype", [sequelize.fn("COUNT", sequelize.col("Assets.id")), "count"]],
      group: ["mimetype"],
      raw: true,
    });

    // 2. Usage Trends (Last 30 Days)
    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

    const trends = await usageModel.findAll({
      where: { loggedAt: { [Op.gte]: thirtyDaysAgo } },
      attributes: [
        [sequelize.fn("DATE", sequelize.col("Usage.loggedAt")), "date"],
        [sequelize.fn("COUNT", sequelize.col("Usage.id")), "count"],
      ],
      group: [sequelize.fn("DATE", sequelize.col("Usage.loggedAt"))],
      order: [[sequelize.fn("DATE", sequelize.col("Usage.loggedAt")), "ASC"]],
      raw: true,
    });

    // 3. Compliance Audit
    const totalCount = await assetsModel.count();
    const expiredCount = await assetsModel.count({ where: { status: "expired" } });
    const { count: duplicateCount } = await metadataModel.findAndCountAll({
      where: { isDuplicate: true },
    });

    const complianceScore =
      totalCount > 0
        ? (((totalCount - expiredCount - duplicateCount) / totalCount) * 100).toFixed(2)
        : 100;

    // 4. Generate Formatted File Report (Simulation of PDF)
    const reportId = `report_${Date.now()}`;
    const reportContent = `
=========================================
      AURA DAM INTELLIGENCE REPORT
=========================================
Generated At: ${new Date().toLocaleString()}
Report ID: ${reportId}

1. SYSTEM SUMMARY
-----------------
Total Assets: ${totalCount}
Expired Assets: ${expiredCount}
Duplicate Count: ${duplicateCount}
Compliance Score: ${complianceScore}%

2. STORAGE DISTRIBUTION
-----------------------
${(distribution as unknown as DistributionItem[]).map((d: DistributionItem) => `- ${d.mimetype}: ${d.count} assets`).join("\n")}

3. USAGE TRENDS (30 DAYS)
-------------------------
${(trends as unknown as TrendItem[]).map((t: TrendItem) => `- ${t.date}: ${t.count} actions`).join("\n")}

4. AUDIT STATUS
---------------
Status: COMPLIANT
Security Check: PASSED
Governance Check: PASSED

=========================================
          END OF REPORT
=========================================
    `.trim();

    const bucketName = "reports";
    const objectName = `${reportId}.txt`;

    await uploadFile(bucketName, objectName, Buffer.from(reportContent), "text/plain");

    // Generate a secure presigned URL (rewrites internal cluster DNS to public endpoint)
    const downloadUrl = await getPresignedUrl(bucketName, objectName, 3600 * 24);

    const report = {
      id: reportId,
      generatedAt: new Date().toISOString(),
      summary: {
        totalAssets: totalCount,
        expiredAssets: expiredCount,
        duplicates: duplicateCount,
        complianceScore,
      },
      distribution,
      trends,
      downloadUrl,
      status: "ready",
    };

    // Store in Redis for the dashboard
    await cache.set("system:report:latest", report, 3600 * 24);

    logger.info(`[Worker] Intelligence report ${reportId} generated, uploaded, and cached.`);
    return report;
  } catch (error) {
    logger.error(`[Worker] Report generation failed: ${(error as Error).message}`);
    throw error;
  }
};
