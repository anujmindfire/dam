import { RequestWithUser, jobModel, findAll, statusCode, CustomError } from "@dam/shared";

/**
 * Lists all background jobs with pagination.
 * @param {RequestWithUser} req - Express request with page and limit.
 */
export const listJobs = async (req: RequestWithUser) => {
  try {
    const { page = "1", limit = "50" } = req.query;
    const offset = (parseInt(page as string) - 1) * parseInt(limit as string);

    const { result, totalCount } = await findAll(jobModel, {
      order: [["createdAt", "DESC"]],
      limit: parseInt(limit as string),
      offset,
    });

    return { result, totalCount };
  } catch (error) {
    return new CustomError((error as Error).message, statusCode.badRequest);
  }
};
