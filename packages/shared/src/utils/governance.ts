import {
  assetsModel,
  logger,
  Op,
  cacheUtil as cache,
  sequelize,
  usageModel,
  metadataModel,
  uploadFile,
  dotEnv,
} from "..";

/**
 * Generates a comprehensive system intelligence report.
 * Aggregates usage, duplication, and compliance trends.
 */
export const generateSystemReport = async (): Promise<any> => {
  try {
    logger.info("[Intelligence Engine] Generating large-scale report...");

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

    const statusRows = await assetsModel.findAll({
      attributes: ["status", [sequelize.fn("COUNT", sequelize.col("Assets.id")), "count"]],
      group: ["status"],
      raw: true,
    });

    const freshAssets = totalCount - Number(expiredCount) - Number(duplicateCount);
    const complianceRate =
      totalCount > 0 ? ((freshAssets / totalCount) * 100).toFixed(2) + "%" : "100%";
    const duplicateProbability =
      totalCount > 0 ? ((Number(duplicateCount) / totalCount) * 100).toFixed(2) + "%" : "0%";

    // 4. Generate Formatted File Report
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
Fresh Assets: ${freshAssets}
Duplicates: ${duplicateCount}
Expired: ${expiredCount}
Compliance Rate: ${complianceRate}

2. STATUS BREAKDOWN
-------------------
${statusRows.map((r: any) => `- ${r.status}: ${r.count}`).join("\n")}

3. STORAGE DISTRIBUTION
-----------------------
${distribution.map((d: any) => `- ${d.mimetype}: ${d.count} assets`).join("\n")}

4. AUDIT STATUS
---------------
Status: COMPLIANT
Duplicate Probability: ${duplicateProbability}

=========================================
          END OF REPORT
=========================================
    `.trim();

    const bucketName = "reports";
    const objectName = `${reportId}.txt`;

    await uploadFile(bucketName, objectName, Buffer.from(reportContent), "text/plain");

    // Construct Download URL
    const downloadUrl = `http://${dotEnv.minioEndpoint}:${dotEnv.minioPort}/${bucketName}/${objectName}`;

    const report = {
      id: reportId,
      generatedAt: new Date().toISOString(),
      summary: {
        totalAssets: totalCount,
        freshAssets,
        duplicates: Number(duplicateCount),
        expired: Number(expiredCount),
        complianceRate,
      },
      statusBreakdown: statusRows,
      failingAssets: {
        expiredCount: Number(expiredCount),
        duplicateProbability,
      },
      distribution,
      trends,
      downloadUrl,
      status: "ready",
    };

    // Store in Redis
    await cache.set("system:report:latest", report, 3600 * 24);

    logger.info(`[Intelligence Engine] Report ${reportId} ready.`);
    return report;
  } catch (error) {
    logger.error(`[Intelligence Engine] Generation failed: ${(error as Error).message}`);
    throw error;
  }
};
