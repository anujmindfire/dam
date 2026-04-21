import { assetsModel, metadataModel } from "../models";
import sequelize from "../config/sequelizeConnection";
import { ModelStatic, Model } from "sequelize";
import { findAll } from "../repositories";
import { statusCode } from "./constant";
import { CustomError } from "./customError";
import { SystemReportProps } from "../types";
import { Op } from "sequelize";

/**
 * Generates a detailed system report including fresh assets,
 * duplication rates, and compliance metrics.
 */
export const generateSystemReport = async (): Promise<SystemReportProps> => {
  try {
    // 1. Fetch raw data for aggregation
    const totalAssets = await assetsModel.count();

    const { totalCount: duplicates } = await findAll(metadataModel as ModelStatic<Model<any>>, {
      where: { isDuplicate: true },
    });

    const { totalCount: expired } = await findAll(assetsModel as ModelStatic<Model<any>>, {
      where: { status: "expired" },
    });

    const { result: statusDistribution } = await findAll(assetsModel as ModelStatic<Model<any>>, {
      attributes: ["status", [sequelize.fn("COUNT", sequelize.col("id")), "count"]],
      group: ["status"],
      raw: true,
    });

    // 2. Freshness check: Assets uploaded in the last 30 days
    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
    const { totalCount: freshAssets } = await findAll(assetsModel as ModelStatic<Model<any>>, {
      where: { createdAt: { [Op.gte]: thirtyDaysAgo } },
    });

    // 3. Compile report
    const report: SystemReportProps = {
      generatedAt: new Date().toISOString(),
      summary: {
        totalAssets,
        freshAssets,
        duplicates,
        expired,
        complianceRate:
          totalAssets > 0
            ? (((totalAssets - expired - duplicates) / totalAssets) * 100).toFixed(2) + "%"
            : "100%",
      },
      statusBreakdown: statusDistribution,
      failingAssets: {
        expiredCount: expired,
        duplicateProbability:
          (totalAssets > 0 ? ((duplicates / totalAssets) * 100).toFixed(2) : "0") + "%",
      },
    };

    return report;
  } catch (error) {
    throw new CustomError((error as Error).message, statusCode.badRequest);
  }
};
