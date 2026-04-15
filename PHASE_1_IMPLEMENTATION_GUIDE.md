# Phase 1 Implementation Guide - Critical Backend Features

> **Goal**: Make the system event-driven and add approval workflow
> 
> **Timeline**: 13-15 hours
> 
> **Priority**: Complete all tasks in this phase before Phase 2

---

## Overview

Phase 1 focuses on 5 critical elements that enable the entire system:

1. **Approval Workflow** - Allow assets to be reviewed/approved before use
2. **Queue Consumers** - Enable microservices to react to events
3. **Event Publishing** - Publish all asset lifecycle events
4. **Error Handling** - Handle queue failures gracefully
5. **Fixes** - Resolve import/type issues

Once Phase 1 is complete, the system becomes truly event-driven and assets can flow through a complete lifecycle with proper governance.

---

## Task 1: Approval & Review Workflow (6 hours)

### Purpose
Currently, assets can be uploaded and immediately used. We need:
- Assets to be marked as "pending review"
- Designated approvers to approve/reject assets
- Feedback/comments during approval
- Complete audit trail of approvals

### Data Models Required

**New Model: Approval** (apps/server or in shared)

```typescript
interface ApprovalProps {
  id: number;
  assetId: number;           // FK to Asset
  requestedBy: string;        // User ID who uploaded
  approvedBy?: string;        // User ID who approved
  status: 'pending' | 'approved' | 'rejected';
  reason?: string;            // Rejection reason
  comments?: string;          // Approval comments
  assignedTo?: string[];      // Array of approver emails
  priority: 'low' | 'normal' | 'high';
  createdAt: Date;
  updatedAt: Date;
}
```

**New Model: ApprovalComment**

```typescript
interface ApprovalCommentProps {
  id: number;
  approvalId: number;         // FK to Approval
  userId: string;             // Who commented
  message: string;
  createdAt: Date;
}
```

### Implementation Steps

#### Step 1: Create Models (~30 minutes)

Create `packages/shared/src/models/approval.ts`:

```typescript
import sequelize from "../config/sequelizeConnection";
import { DataTypes, Model, Optional } from "sequelize";

interface ApprovalAttributes {
  id: number;
  assetId: number;
  requestedBy: string;
  approvedBy?: string;
  status: 'pending' | 'approved' | 'rejected';
  reason?: string;
  priority: string;
  createdAt: Date;
  updatedAt: Date;
}

interface ApprovalCreationAttributes extends Optional<ApprovalAttributes, "id"> {}

class Approval extends Model<ApprovalAttributes, ApprovalCreationAttributes> {}

Approval.init({
  id: { type: DataTypes.INTEGER, autoIncrement: true, primaryKey: true },
  assetId: { type: DataTypes.INTEGER, allowNull: false },
  requestedBy: { type: DataTypes.STRING, allowNull: false },
  approvedBy: { type: DataTypes.STRING, allowNull: true },
  status: { 
    type: DataTypes.ENUM('pending', 'approved', 'rejected'),
    defaultValue: 'pending'
  },
  reason: { type: DataTypes.TEXT, allowNull: true },
  priority: { type: DataTypes.ENUM('low', 'normal', 'high'), defaultValue: 'normal' },
  createdAt: { type: DataTypes.DATE, defaultValue: DataTypes.NOW },
  updatedAt: { type: DataTypes.DATE, defaultValue: DataTypes.NOW },
}, {
  sequelize,
  tableName: 'approvals',
});

export default Approval;
```

Do the same for ApprovalComment.

Update `packages/shared/src/models/index.ts` to include associations:

```typescript
Asset.hasMany(Approval, { as: 'approvals', foreignKey: 'assetId' });
Approval.belongsTo(Asset, { as: 'asset', foreignKey: 'assetId' });
```

#### Step 2: Create Service (~2 hours)

Create `apps/server/src/services/approval.ts`:

```typescript
import { Request } from "express";
import {
  create,
  findOne,
  findAll,
  findOneAndUpdate,
  Approval,
  Asset,
  statusCode,
  CustomError,
  publishMessage,
} from "@dam/shared";

/**
 * Creates an approval request for an asset.
 * Transitions asset to "pending_approval" status.
 */
export const requestApproval = async (req: Request) => {
  try {
    const { assetId, priority = 'normal', assignedTo } = req.body;

    // Verify asset exists
    const asset = await findOne(Asset, { id: assetId });
    if (!asset) {
      return new CustomError("Asset not found", statusCode.notFound);
    }

    // Create approval request
    const approval = await create(Approval, {
      assetId,
      requestedBy: req.user?.id,
      status: 'pending',
      priority,
      assignedTo: assignedTo || [],
    });

    // Update asset status
    await findOneAndUpdate(Asset, { id: assetId }, { status: 'pending_approval' });

    // Publish event for notification service
    await publishMessage('approval_requested', {
      approvalId: approval.id,
      assetId,
      requestedBy: req.user?.id,
      assignedTo: assignedTo || [],
      timestamp: new Date(),
    });

    return approval;
  } catch (error) {
    return new CustomError((error as Error).message, statusCode.badRequest);
  }
};

/**
 * Lists pending approvals for the current user.
 */
export const listApprovals = async (req: Request) => {
  try {
    const { status = 'pending', page = '1', limit = '20' } = req.query;

    const offset = (parseInt(page as string) - 1) * parseInt(limit as string);

    const { result, totalCount } = await findAll(Approval, {
      where: { status },
      include: [{ association: 'asset', attributes: ['id', 'filename', 'status'] }],
      limit: parseInt(limit as string),
      offset,
      order: [['priority', 'DESC'], ['createdAt', 'DESC']],
    });

    return { result, totalCount };
  } catch (error) {
    return new CustomError((error as Error).message, statusCode.badRequest);
  }
};

/**
 * Approves an asset.
 */
export const approveAsset = async (req: Request) => {
  try {
    const { approvalId } = req.params;
    const { comments } = req.body;

    const approval = await findOne(Approval, { id: approvalId });
    if (!approval) {
      return new CustomError("Approval not found", statusCode.notFound);
    }

    // Update approval
    await findOneAndUpdate(
      Approval,
      { id: approvalId },
      { status: 'approved', approvedBy: req.user?.id }
    );

    // Update asset status
    await findOneAndUpdate(
      Asset,
      { id: approval.assetId },
      { status: 'approved' }
    );

    // Publish event
    await publishMessage('asset_approved', {
      approvalId,
      assetId: approval.assetId,
      approvedBy: req.user?.id,
      comments,
      timestamp: new Date(),
    });

    return { success: true, message: "Asset approved" };
  } catch (error) {
    return new CustomError((error as Error).message, statusCode.badRequest);
  }
};

/**
 * Rejects an asset.
 */
export const rejectAsset = async (req: Request) => {
  try {
    const { approvalId } = req.params;
    const { reason } = req.body;

    const approval = await findOne(Approval, { id: approvalId });
    if (!approval) {
      return new CustomError("Approval not found", statusCode.notFound);
    }

    // Update approval
    await findOneAndUpdate(
      Approval,
      { id: approvalId },
      { status: 'rejected', approvedBy: req.user?.id, reason }
    );

    // Update asset status back to 'pending'
    await findOneAndUpdate(
      Asset,
      { id: approval.assetId },
      { status: 'pending' }
    );

    // Publish event
    await publishMessage('asset_rejected', {
      approvalId,
      assetId: approval.assetId,
      rejectedBy: req.user?.id,
      reason,
      timestamp: new Date(),
    });

    return { success: true, message: "Asset rejected" };
  } catch (error) {
    return new CustomError((error as Error).message, statusCode.badRequest);
  }
};
```

#### Step 3: Create Controller (~1 hour)

Create `apps/server/src/controllers/approval.ts`:

```typescript
import { Request, Response, NextFunction } from "express";
import {
  requestApproval,
  listApprovals,
  approveAsset,
  rejectAsset,
} from "../services/approval";
import { sendSuccessResponse, CustomError, statusCode } from "@dam/shared";

export const request = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const result = await requestApproval(req);
    if (result instanceof CustomError) {
      return next(result);
    }
    sendSuccessResponse({
      res,
      statusCode: statusCode.successCreated,
      message: "Approval request created",
      data: result,
    });
  } catch (error) {
    return next(error);
  }
};

export const list = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const result = await listApprovals(req);
    if (result instanceof CustomError) {
      return next(result);
    }
    sendSuccessResponse({
      res,
      statusCode: statusCode.success,
      message: "Approvals retrieved",
      data: result.result,
      totalCount: result.totalCount,
    });
  } catch (error) {
    return next(error);
  }
};

export const approve = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const result = await approveAsset(req);
    if (result instanceof CustomError) {
      return next(result);
    }
    sendSuccessResponse({
      res,
      statusCode: statusCode.success,
      message: "Asset approved successfully",
      data: result,
    });
  } catch (error) {
    return next(error);
  }
};

export const reject = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const result = await rejectAsset(req);
    if (result instanceof CustomError) {
      return next(result);
    }
    sendSuccessResponse({
      res,
      statusCode: statusCode.success,
      message: "Asset rejected",
      data: result,
    });
  } catch (error) {
    return next(error);
  }
};
```

#### Step 4: Create Routes (~30 minutes)

Create `apps/server/src/routes/approval.ts`:

```typescript
import express, { Router } from "express";
import { request, list, approve, reject } from "../controllers/approval";
import { verifyToken } from "../config/verifyToken";

const apiRoutes: Router = express.Router();

apiRoutes.use(verifyToken);

// Approval routes
apiRoutes.post("/", request);           // Request approval for asset
apiRoutes.get("/", list);               // List pending approvals
apiRoutes.patch("/:approvalId/approve", approve);  // Approve asset
apiRoutes.patch("/:approvalId/reject", reject);    // Reject asset

export default apiRoutes;
```

Add to `apps/server/src/routes/index.ts`:

```typescript
import approval from "./approval";
// ...
router.use(`${baseRoute}/approvals`, approval);
```

#### Step 5: Update Asset Status Enum (~15 minutes)

Update `packages/shared/src/models/asset.ts`:

```typescript
status: {
  type: DataTypes.STRING(50),
  defaultValue: enums.pending,
  // Add to allowed values: 'pending', 'pending_approval', 'reviewed', 'approved', 'expired', 'archived'
}
```

---

## Task 2: Complete Queue Consumers (3 hours)

### Purpose
Currently, the worker service publishes analysis results but metadata and usage services don't consume any events. They should listen to asset events and maintain their own data.

### Implementation for Metadata Service

Update `apps/metadata/src/index.ts` to add consumer:

```typescript
import { consumeMessage } from "@dam/shared";

const startConsumer = async () => {
  // Listen for asset analysis complete
  await consumeMessage("metadata_analyzed", async (payload) => {
    // payload: { assetId, analysisResults, timestamp }
    logger.info(`[Metadata] Processing analyzed metadata for asset ${payload.assetId}`);
    
    // Update metadata in database
    await findOneAndUpdate(metadataModel, 
      { assetId: payload.assetId },
      { analysisResults: payload.analysisResults }
    );
  });

  logger.info("Metadata Service consumers started");
};
```

### Implementation for Usage Service

Update `apps/usage/src/index.ts`:

```typescript
await consumeMessage("asset_created", async (payload) => {
  // payload: { assetId, owner, timestamp }
  logger.info(`[Usage] Tracking new asset ${payload.assetId}`);
  
  // Initialize usage tracking
  await create(UsageMetrics, {
    assetId: payload.assetId,
    owner: payload.owner,
    views: 0,
    downloads: 0,
    lastAccessed: payload.timestamp,
  });
});
```

---

## Task 3: Event Publishing Completeness (2 hours)

### Current State
Only `asset_uploaded` event is published.

### Missing Events

Update `apps/server/src/services/asset.ts` updateAsset():

```typescript
await publishMessage("asset_updated", {
  assetId: newAsset.id,
  changes: { ...updateData },
  updatedBy: req.user?.id,
  timestamp: new Date().toISOString(),
});
```

Update deleteAsset():

```typescript
await publishMessage("asset_deleted", {
  assetId: id,
  deletedBy: req.user?.id,
  timestamp: new Date().toISOString(),
});
```

---

## Task 4: Error Handling in Queues (2 hours)

Add retry logic to consumeMessage in `packages/shared/src/utils/messaging.ts`:

```typescript
const MAX_RETRIES = 3;
const RETRY_DELAY = 1000; // ms

export const consumeMessage = async (
  queue: string,
  callback: (payload: any) => Promise<void>,
  maxRetries = MAX_RETRIES
): Promise<void> => {
  // ... existing code ...
  await channel!.consume(queue, async (msg) => {
    if (msg) {
      const retryCount = msg.properties.headers?.['x-retry-count'] || 0;
      
      try {
        const payload = JSON.parse(msg.content.toString());
        await callback(payload);
        channel!.ack(msg);
      } catch (error) {
        if (retryCount < maxRetries) {
          // Requeue with increased retry count
          const newHeaders = { 'x-retry-count': retryCount + 1 };
          channel!.nack(msg, false, true);
        } else {
          // Send to dead-letter queue
          const dlQueue = `${queue}.dlq`;
          await channel!.assertQueue(dlQueue, { durable: true });
          channel!.sendToQueue(dlQueue, msg.content, { headers: newHeaders });
          channel!.ack(msg);
          logger.error(`Message moved to DLQ: ${dlQueue}`, error);
        }
      }
    }
  });
};
```

---

## Testing Phase 1

### Manual Testing Checklist

- [ ] Start all services (server, worker, metadata, usage)
- [ ] Upload an asset
  - [ ] Asset should be created with status: 'pending'
  - [ ] worker should process and update metadata
  - [ ] approval record not created yet (need to add route)
- [ ] Request approval for asset
  - [ ] Approval record created
  - [ ] Asset status becomes 'pending_approval'
  - [ ] approval_requested event published
- [ ] Approve asset
  - [ ] Approval status becomes 'approved'
  - [ ] Asset status becomes 'approved'
  - [ ] asset_approved event published
- [ ] Reject asset
  - [ ] Approval status becomes 'rejected'
  - [ ] Asset status back to 'pending'
  - [ ] asset_rejected event published

### Unit Tests

Create `apps/server/__tests__/approval.test.ts`:

```typescript
import { requestApproval, approveAsset, rejectAsset } from "../src/services/approval";

describe("Approval Service", () => {
  test("should create approval request", async () => {
    // Test requestApproval
  });

  test("should approve asset", async () => {
    // Test approveAsset
  });

  test("should reject asset", async () => {
    // Test rejectAsset
  });
});
```

---

## Phase 1 Completion Metrics

Once all tasks are done:

- ✅ Approval workflow fully functional
- ✅ All asset events published to queue
- ✅ Metadata service consumes analyzed data
- ✅ Usage service tracks asset lifecycle
- ✅ Error messages retry and go to DLQ
- ✅ 10+ new API endpoints working
- ✅ Asset status includes 'pending_approval'

---

## Integration with Dashboard

Once Phase 1 is complete, the dashboard needs:

1. **Approval Queue View** - Show pending approvals
2. **Asset Status Badge** - Show current status
3. **Approval History** - Show who approved/rejected when
4. **Notification Bell** - Show pending approvals needing action

These are frontend changes triggered by new backend endpoints.

---

## Success Criteria

Phase 1 is complete when:

- [ ] All 5 models created (Asset, Approval, ApprovalComment, Metadata, Usage)
- [ ] All approval endpoints working (request, list, approve, reject)
- [ ] All asset lifecycle events publishing to queue
- [ ] All microservices consuming their events
- [ ] Error handling with retries working
- [ ] Tests passing (> 80% coverage)
- [ ] Documentation updated
- [ ] Code committed and pushed

**Estimated Time**: 13-15 hours
**Recommended Pace**: Complete in 2-3 days of focused work
