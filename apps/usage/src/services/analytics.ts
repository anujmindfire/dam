import {
  assetsModel,
  usageModel,
  metadataModel,
  sequelize,
  findAll,
  statusCode,
  CustomError,
  cacheUtil as cache,
  Op,
  jobModel,
} from "@dam/shared";

const OVERVIEW_KEY = "analytics:overview";
const COMPLIANCE_KEY = "analytics:compliance";

/**
 * Generates dashboard analytics: total assets, status breakdown, usage trends, compliance score.
 * Uses Sequelize fn() for aggregation. Results are Redis-cached for 1 hour.
 *
 * @returns {Promise<any | CustomError>}
 */
export const getSystemOverview = async (): Promise<any | CustomError> => {
  try {
    const cached = await cache.get(OVERVIEW_KEY);
    if (cached) return cached;

    // 1. Status distribution via GROUP BY
    const { result: statusRows } = await findAll(assetsModel, {
      attributes: ["status", [sequelize.fn("COUNT", sequelize.col("id")), "count"]],
      group: ["status"],
      raw: true,
    });

    const totalAssets = statusRows.reduce(
      (sum: number, row: any) => sum + parseInt(row.count, 10),
      0,
    );

    const statusDistribution = statusRows.reduce((acc: any, row: any) => {
      acc[row.status] = parseInt(row.count, 10);
      return acc;
    }, {});

    // 2. Duplicate and expired counts using repository
    const { totalCount: duplicateCount } = await findAll(metadataModel, {
      where: { isDuplicate: true },
    });

    const { totalCount: expiredCount } = await findAll(assetsModel, {
      where: { status: "expired" },
    });

    // 3. Usage trends over last 7 days
    const sevenDaysAgo = new Date();
    sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);

    const { result: usageTrends } = await findAll(usageModel, {
      where: { loggedAt: { [Op.gte]: sevenDaysAgo } },
      attributes: [
        [sequelize.fn("DATE", sequelize.col("loggedAt")), "date"],
        [sequelize.fn("COUNT", sequelize.col("id")), "count"],
      ],
      group: [sequelize.fn("DATE", sequelize.col("loggedAt"))],
      order: [[sequelize.fn("DATE", sequelize.col("loggedAt")), "ASC"]],
      raw: true,
    });

    const complianceScore =
      totalAssets > 0
        ? (((totalAssets - expiredCount - duplicateCount) / totalAssets) * 100).toFixed(1)
        : "100.0";

    const totalStorage = statusRows.length > 0 ? (await assetsModel.sum("size")) || 0 : 0;

    const { result: mimetypeRows } = await findAll(assetsModel, {
      attributes: ["mimetype", [sequelize.fn("COUNT", sequelize.col("id")), "count"]],
      group: ["mimetype"],
      raw: true,
    });

    const activeJobsCount = await jobModel.count({
      where: { status: { [Op.in]: ["queued", "processing"] } },
    });

    const result = {
      totalAssets,
      totalStorage,
      statusDistribution,
      mimetypeDistribution: mimetypeRows,
      activeJobsCount,
      duplicateCount,
      expiredCount,
      usageTrends,
      complianceScore: parseFloat(complianceScore),
    };

    await cache.set(OVERVIEW_KEY, result, 60); // Cache for 60 seconds
    return result;
  } catch (error) {
    throw new CustomError((error as Error).message, statusCode.badRequest);
  }
};

/**
 * Returns compliance metrics: status counts and duplicate flags.
 * Results are Redis-cached for 6 hours.
 *
 * @returns {Promise<any | CustomError>}
 */
export const getComplianceReport = async (): Promise<any | CustomError> => {
  try {
    const cached = await cache.get(COMPLIANCE_KEY);
    if (cached) return cached;

    const { result: statusRows } = await findAll(assetsModel, {
      attributes: ["status", [sequelize.fn("COUNT", sequelize.col("id")), "count"]],
      group: ["status"],
      raw: true,
    });

    const { totalCount: duplicates } = await findAll(metadataModel, {
      where: { isDuplicate: true },
    });

    const totalAssets = statusRows.reduce((sum: number, r: any) => sum + parseInt(r.count), 0);
    const approvedCount = parseInt(
      statusRows.find((r: any) => r.status === "approved")?.count || "0",
    );
    const score = totalAssets > 0 ? Math.round((approvedCount / totalAssets) * 100) : 100;

    const violations = [];
    if (duplicates > 0) {
      violations.push({
        title: "Duplicate Assets Detected",
        description: `There are ${duplicates} assets flagged as duplicates that require review.`,
      });
    }

    const { totalCount: expiredCount } = await findAll(assetsModel, {
      where: { status: "expired" },
    });
    if (expiredCount > 0) {
      violations.push({
        title: "Expired Asset Rights",
        description: `${expiredCount} assets have reached their expiry date and should be archived.`,
      });
    }

    const result = {
      statusRows,
      duplicates,
      score,
      alertsCount: duplicates + expiredCount,
      approvedCount,
      violations,
    };
    await cache.set(COMPLIANCE_KEY, result, 60); // Cache for 60 seconds
    return result;
  } catch (error) {
    throw new CustomError((error as Error).message, statusCode.badRequest);
  }
};

/**
 * Retrieves the latest precomputed system report from Redis.
 * This is the outcome of the background 'report_generation' worker job.
 */
export const getLatestReport = async (): Promise<any | CustomError> => {
  try {
    const report = await cache.get("system:report:latest");
    if (!report) {
      return {
        status: "pending",
        message: "Report is not yet generated. Please trigger a new report generation job.",
      };
    }
    return { status: "ready", data: report };
  } catch (error) {
    throw new CustomError((error as Error).message, statusCode.badRequest);
  }
};

/**
 * Triggers a new background report generation job via RabbitMQ.
 */
export const triggerReport = async (): Promise<any | CustomError> => {
  try {
    const { publishMessage } = await import("@dam/shared");
    await publishMessage("report_generation", { triggeredAt: new Date().toISOString() });
    return { success: true, message: "Background report generation job triggered successfully." };
  } catch (error) {
    throw new CustomError((error as Error).message, statusCode.badRequest);
  }
};
