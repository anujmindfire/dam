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
} from "@dam/shared";

const OVERVIEW_KEY = "analytics:overview";
const COMPLIANCE_KEY = "analytics:compliance";

/**
 * Generates dashboard analytics: total assets, status breakdown, usage trends, compliance score.
 * Uses Sequelize fn() for aggregation. Results are Redis-cached for 1 hour.
 *
 * @returns {Promise<any | CustomError>}
 */
export const getSystemOverview = async (filters: any = {}): Promise<any | CustomError> => {
  try {
    const { department, assetType, timeRange, userId, isAdmin } = filters;

    // Non-admin users only see their own assets
    const ownerFilter = !isAdmin && userId ? { owner: userId } : {};

    const hasFilters =
      (department && department !== "All Departments") ||
      (assetType && assetType !== "All Asset Types") ||
      (timeRange && timeRange !== "Last 30 Days") ||
      Object.keys(ownerFilter).length > 0;

    if (!hasFilters) {
      const cached = await cache.get(OVERVIEW_KEY);
      if (cached) return cached;
    }

    const assetWhere: any = { ...ownerFilter };
    if (department && department !== "All Departments") assetWhere.department = department;
    if (assetType && assetType !== "All Asset Types") {
      const typeMap: any = { Images: "image", Videos: "video", Documents: "pdf" };
      assetWhere.mimetype = { [Op.like]: `%${typeMap[assetType] || assetType.toLowerCase()}%` };
    }

    const includeAsset = hasFilters
      ? [
          {
            model: assetsModel,
            as: "assets",
            where: assetWhere,
            required: true,
            attributes: [], // Don't select any columns from Assets to avoid GROUP BY errors
          },
        ]
      : [];

    // 1. Status distribution
    const { result: statusRows } = await findAll(assetsModel, {
      where: assetWhere,
      attributes: ["status", [sequelize.fn("COUNT", sequelize.col("Assets.id")), "count"]],
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

    // 2. Duplicate and expired counts
    const { totalCount: duplicateCount } = await findAll(metadataModel, {
      include: includeAsset,
      where: { isDuplicate: true },
    });

    const { totalCount: expiredCount } = await findAll(assetsModel, {
      where: { ...assetWhere, status: "expired" },
    });

    // 2.1 Expiring soon (At Risk) - Expiry within next 7 days
    const nextWeek = new Date();
    nextWeek.setDate(nextWeek.getDate() + 7);

    const { totalCount: atRiskCount } = await findAll(assetsModel, {
      where: {
        ...assetWhere,
        status: { [Op.ne]: "expired" },
        expiryDate: {
          [Op.between]: [new Date(), nextWeek],
        },
      },
    });

    // 3. Usage trends
    const days = timeRange === "Last 7 Days" ? 7 : 30;
    const startDate = new Date();
    startDate.setDate(startDate.getDate() - days);

    const { result: usageTrends } = await findAll(usageModel, {
      include: includeAsset,
      where: { loggedAt: { [Op.gte]: startDate } },
      attributes: [
        [sequelize.fn("DATE", sequelize.col("Usage.loggedAt")), "date"],
        [sequelize.fn("COUNT", sequelize.col("Usage.id")), "count"],
      ],
      group: [sequelize.fn("DATE", sequelize.col("Usage.loggedAt"))],
      order: [[sequelize.fn("DATE", sequelize.col("Usage.loggedAt")), "ASC"]],
      raw: true,
    });

    const complianceScore =
      totalAssets > 0
        ? (
            ((totalAssets - expiredCount - duplicateCount - atRiskCount) / totalAssets) *
            100
          ).toFixed(1)
        : "100.0";

    const totalStorage =
      statusRows.length > 0 ? (await assetsModel.sum("size", { where: assetWhere })) || 0 : 0;

    const { result: mimetypeRows } = await findAll(assetsModel, {
      where: assetWhere,
      attributes: ["mimetype", [sequelize.fn("COUNT", sequelize.col("Assets.id")), "count"]],
      group: ["mimetype"],
      raw: true,
    });

    const result = {
      totalAssets,
      totalStorage,
      statusDistribution,
      mimetypeDistribution: mimetypeRows,
      duplicateCount,
      expiredCount,
      atRiskCount,
      usageTrends,
      complianceScore: parseFloat(complianceScore),
    };

    if (!hasFilters) {
      await cache.set(OVERVIEW_KEY, result, 60);
    }
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

    // New: At Risk (Expiring soon)
    const nextWeek = new Date();
    nextWeek.setDate(nextWeek.getDate() + 7);
    const { totalCount: atRiskCount } = await findAll(assetsModel, {
      where: {
        status: { [Op.ne]: "expired" },
        expiryDate: {
          [Op.between]: [new Date(), nextWeek],
        },
      },
    });

    if (atRiskCount > 0) {
      violations.push({
        title: "Expiring Soon (At Risk)",
        description: `${atRiskCount} assets will expire within the next 7 days and require review.`,
      });
    }

    const result = {
      statusRows,
      duplicates,
      score,
      alertsCount: duplicates + expiredCount + atRiskCount,
      approvedCount,
      atRiskCount,
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
