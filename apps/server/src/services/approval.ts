import {
  approvalModel,
  assetsModel,
  create,
  findOne,
  findAll,
  findOneAndUpdate,
  statusCode,
  CustomError,
  publishMessage,
  cacheUtil as cache,
  approvalMsg,
  RequestWithUser,
} from "@dam/shared";

/**
 * Requests approval for an asset.
 * Transitions asset to "pending_approval" status.
 * @param {Request} req - Express request with assetsId, priority, assignedTo
 */
export const requestApproval = async (req: RequestWithUser) => {
  try {
    const { assetsId, priority = "normal", assignedTo = [] } = req.body;

    // Verify asset exists
    const assetsData = await findOne(assetsModel, { id: assetsId });
    if (!assetsData) {
      return new CustomError(approvalMsg.assetNotFound, statusCode.notFound);
    }

    // Create approval request
    const approval = await create(approvalModel, {
      assetsId,
      requestedBy: req.user?.id,
      status: "pending",
      priority,
      assignedTo: assignedTo || [],
    });

    if (!approval) {
      return new CustomError(approvalMsg.createFailed, statusCode.badRequest);
    }

    // Update asset status
    await findOneAndUpdate(assetsModel, { id: assetsId }, { status: "pending_approval" });

    // Publish event for notification service
    await publishMessage("approval_requested", {
      approvalId: approval.id,
      assetsId,
      filename: assetsData.filename,
      requestedBy: req.user?.id,
      assignedTo: assignedTo || [],
      timestamp: new Date().toISOString(),
    });

    // Invalidate cache
    await cache.delByPattern("approval*");

    return approval;
  } catch (error) {
    return new CustomError((error as Error).message, statusCode.badRequest);
  }
};

/**
 * Lists approvals with optional filtering.
 * @param {Request} req - Express request with status, page, limit params
 */
export const listApproval = async (req: RequestWithUser) => {
  try {
    const { status = "pending", page = "1", limit = "20" } = req.query;

    const offset = (parseInt(page as string) - 1) * parseInt(limit as string);

    const { result, totalCount } = await findAll(approvalModel, {
      where: status ? { status } : {},
      include: [
        {
          association: "assets",
          attributes: ["id", "filename", "status"],
        },
      ],
      limit: parseInt(limit as string),
      offset,
      order: [
        ["priority", "DESC"],
        ["createdAt", "DESC"],
      ],
    });

    return { result, totalCount };
  } catch (error) {
    return new CustomError((error as Error).message, statusCode.badRequest);
  }
};

/**
 * Gets a single approval record by ID.
 * @param {Request} req - Express request with approval ID in params
 */
export const getApprovalById = async (req: RequestWithUser) => {
  try {
    const { id } = req.params;

    const approval = await findOne(
      approvalModel,
      { id },
      {
        include: [
          {
            association: "assets",
            attributes: ["id", "filename", "status", "owner"],
          },
          {
            association: "comments",
            attributes: ["id", "userId", "message", "createdAt"],
          },
        ],
      },
    );

    if (!approval) {
      return new CustomError(approvalMsg.notFound, statusCode.notFound);
    }

    return approval;
  } catch (error) {
    return new CustomError((error as Error).message, statusCode.badRequest);
  }
};

/**
 * Approves an asset.
 * @param {Request} req - Express request with approvalId in params and optional comments
 */
export const approveAsset = async (req: RequestWithUser) => {
  try {
    const { approvalId } = req.params;
    const { comments } = req.body;

    const approval = await findOne(approvalModel, { id: approvalId });
    if (!approval) {
      return new CustomError(approvalMsg.notFound, statusCode.notFound);
    }

    // Update approval
    await findOneAndUpdate(
      approvalModel,
      { id: approvalId },
      { status: "approved", approvedBy: req.user?.id },
    );

    // Update asset status
    await findOneAndUpdate(assetsModel, { id: (approval as any).assetsId }, { status: "approved" });

    // Publish event
    await publishMessage("assets_approved", {
      approvalId,
      assetsId: (approval as any).assetsId,
      approvedBy: req.user?.id,
      comments,
      timestamp: new Date().toISOString(),
    });

    // Invalidate cache
    await cache.delByPattern("approval*");
    await cache.delByPattern("asset*");

    return { success: true, message: approvalMsg.approveSuccess };
  } catch (error) {
    return new CustomError((error as Error).message, statusCode.badRequest);
  }
};

/**
 * Rejects an asset.
 * @param {Request} req - Express request with approvalId in params and rejection reason
 */
export const rejectAsset = async (req: RequestWithUser) => {
  try {
    const { approvalId } = req.params;
    const { reason } = req.body;

    if (!reason) {
      return new CustomError(approvalMsg.rejectionRequired, statusCode.badRequest);
    }

    const approval = await findOne(approvalModel, { id: approvalId });
    if (!approval) {
      return new CustomError(approvalMsg.notFound, statusCode.notFound);
    }

    // Update approval
    await findOneAndUpdate(
      approvalModel,
      { id: approvalId },
      { status: "rejected", approvedBy: req.user?.id, reason },
    );

    // Update asset status back to 'pending'
    await findOneAndUpdate(assetsModel, { id: (approval as any).assetsId }, { status: "pending" });

    // Publish event
    await publishMessage("assets_rejected", {
      approvalId,
      assetsId: (approval as any).assetsId,
      rejectedBy: req.user?.id,
      reason,
      timestamp: new Date().toISOString(),
    });

    // Invalidate cache
    await cache.delByPattern("approval*");
    await cache.delByPattern("asset*");

    return { success: true, message: approvalMsg.rejectSuccess };
  } catch (error) {
    return new CustomError((error as Error).message, statusCode.badRequest);
  }
};

/**
 * Gets approval history for a specific asset.
 * @param {Request} req - Express request with assetsId in params
 */
export const getApprovalHistory = async (req: RequestWithUser) => {
  try {
    const { assetsId } = req.params;
    const { page = "1", limit = "10" } = req.query;

    const offset = (parseInt(page as string) - 1) * parseInt(limit as string);

    const { result, totalCount } = await findAll(approvalModel, {
      where: { assetsId: assetsId },
      limit: parseInt(limit as string),
      offset,
      order: [["createdAt", "DESC"]],
    });

    return { result, totalCount };
  } catch (error) {
    return new CustomError((error as Error).message, statusCode.badRequest);
  }
};
