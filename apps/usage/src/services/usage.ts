import { usageModel, create, findAll, statusCode, CustomError, RequestWithUser } from "@dam/shared";

/**
 * Logs an assets usage event (view, download, share, update).
 * Stores user context including IP and user agent for auditing.
 * @param {Request} req - Express request with assetsId, action, context in body.
 * @returns {Promise<any | CustomError>}
 */
export const trackUsage = async (req: RequestWithUser): Promise<any | CustomError> => {
  try {
    const { assetsId, action, context } = req.body;

    const log = await create(usageModel, {
      assetsId: String(assetsId),
      action,
      context: {
        ...context,
        userId: req.user?.id,
        ip: req.ip,
        userAgent: req.get("User-Agent"),
      },
      loggedAt: new Date(),
    });

    return log;
  } catch (error) {
    throw new CustomError((error as Error).message, statusCode.badRequest);
  }
};

/**
 * Retrieves paginated usage logs for a specific assets.
 * @param {Request} req - Express request with assetsId in params.
 * @returns {Promise<any | CustomError>}
 */
export const getAssetUsage = async (req: RequestWithUser): Promise<any | CustomError> => {
  try {
    const { assetsId } = req.params;
    const { limit = "50", offset = "0" } = req.query;

    const { result, totalCount } = await findAll(usageModel, {
      where: { assetsId: String(assetsId) },
      order: [["loggedAt", "DESC"]],
      limit: parseInt(limit as string),
      offset: parseInt(offset as string),
    });

    return { result, totalCount };
  } catch (error) {
    throw new CustomError((error as Error).message, statusCode.badRequest);
  }
};

/**
 * Retrieves all usage logs across all assets, with pagination.
 * @param {Request} req - Express request with page/limit query.
 * @returns {Promise<any | CustomError>}
 */
export const getAllUsage = async (req: RequestWithUser): Promise<any | CustomError> => {
  try {
    const { limit = "100", offset = "0" } = req.query;

    const { result, totalCount } = await findAll(usageModel, {
      order: [["loggedAt", "DESC"]],
      limit: parseInt(limit as string),
      offset: parseInt(offset as string),
    });

    return { result, totalCount };
  } catch (error) {
    throw new CustomError((error as Error).message, statusCode.badRequest);
  }
};
