import { Op } from "sequelize";
import {
  assetModel,
  usageModel,
  metadataModel,
  sequelize,
  findAll,
  statusCode,
  CustomError,
  cache,
} from "@dam/shared";

const OVERVIEW_KEY = "analytics:overview";
const COMPLIANCE_KEY = "analytics:compliance";

/**
 * Generates dashboard analytics: total assets, status breakdown, usage trends, compliance score.
 * Uses Sequelize fn() for aggregation. Results are Redis-cached for 1 hour.
 *
 * @returns {Promise<any | CustomError>}
 */
export const getSystemOverview = async () => {
  try {
    const cached = await cache.get(OVERVIEW_KEY);
    if (cached) return cached;

    // 1. Status distribution via GROUP BY
    const { result: statusRows } = await findAll(assetModel, {
      attributes: [
        "status",
        [sequelize.fn("COUNT", sequelize.col("id")), "count"],
      ],
      group: ["status"],
      raw: true,
    });

    const totalAssets = statusRows.reduce(
      (sum: number, row: any) => sum + parseInt(row.count, 10), 0,
    );

    const statusDistribution = statusRows.reduce((acc: any, row: any) => {
      acc[row.status] = parseInt(row.count, 10);
      return acc;
    }, {});

    // 2. Duplicate and expired counts using repository
    const { totalCount: duplicateCount } = await findAll(metadataModel, {
      where: { isDuplicate: true },
    });

    const { totalCount: expiredCount } = await findAll(assetModel, {
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

    const result = {
      totalAssets,
      statusDistribution,
      duplicateCount,
      expiredCount,
      usageTrends,
      complianceScore: parseFloat(complianceScore),
    };

    await cache.set(OVERVIEW_KEY, result, 3600);
    return result;
  } catch (error) {
    return new CustomError((error as Error).message, statusCode.badRequest);
  }
};

/**
 * Returns compliance metrics: status counts and duplicate flags.
 * Results are Redis-cached for 6 hours.
 *
 * @returns {Promise<any | CustomError>}
 */
export const getComplianceReport = async () => {
  try {
    const cached = await cache.get(COMPLIANCE_KEY);
    if (cached) return cached;

    const { result: statusRows } = await findAll(assetModel, {
      attributes: [
        "status",
        [sequelize.fn("COUNT", sequelize.col("id")), "count"],
      ],
      group: ["status"],
      raw: true,
    });

    const { totalCount: duplicates } = await findAll(metadataModel, {
      where: { isDuplicate: true },
    });

    const result = { statusRows, duplicates };
    await cache.set(COMPLIANCE_KEY, result, 21600);
    return result;
  } catch (error) {
    return new CustomError((error as Error).message, statusCode.badRequest);
  }
};
