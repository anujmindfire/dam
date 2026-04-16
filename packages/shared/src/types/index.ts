import { Request } from "express";

/**
 * Represents the structure of an entry in the error log.
 */

export interface ErrorLogProps {
  id: number;
  route: string;
  error: string;
  type: string;
}

/**
 * Standardized structure for all API success responses.
 */

export interface SuccessResponseProps<T = unknown> {
  success: boolean;
  message: string;
  data?: T;
  totalCount?: number;
}

/**
 * Parameters used for paginating database queries and API results.
 */

export interface PaginationProps {
  limit: number | null;
  offset: number | null;
}

export interface PaginatedResult<T> {
  result: T[];
  totalCount: number;
}

/**
 * Core properties of a digital asset (image, video, etc.).
 */

export interface AssetsProps {
  id: number;
  filename: string;
  storageKey: string;
  owner: string | null;
  size: number | null;
  mimetype: string | null;
  status:
    | "pending"
    | "pending_approval"
    | "reviewed"
    | "approved"
    | "rejected"
    | "expired"
    | "archived";
  currentVersion: number;
  department: string | null;
  usageRights: string | null;
  expiryDate: Date | null;
  collectionId: number | null;
}

/**
 * Metadata associated with an asset for search and classification.
 */

export interface MetadataProps {
  id: number;
  assetId: string;
  tags: string[];
  department: string | null;
  analysisResults?: any;
  isDuplicate?: boolean;
  hash: string;
}

/**
 * Represents an entry in the asset usage logs.
 */

export interface UsageLogProps {
  id: number;
  assetId: string;
  action: string;
  context: any;
  loggedAt: Date;
}

/**
 * Data required for uploading or updating an asset's basic information.
 */

export interface AssetData {
  id: number;
  filename: string;
  storageKey: string;
  owner: string;
  size: number;
  mimetype: string;
  department?: string;
  usageRights?: string;
  expiryDate?: string | Date;
  collectionId?: number;
}

/**
 * Represents a logical grouping or folder of assets.
 */

export interface CollectionProps {
  id: number;
  name: string;
  description: string | null;
  owner: string;
  parentId: number | null;
}

/**
 * Represents a specific version of a digital asset.
 */

export interface AssetVersionProps {
  id: number;
  assetId: number;
  versionNumber: number;
  storageKey: string;
  size: number;
  note: string | null;
  author: string;
}

/**
 * Data required for creating or updating an asset version.
 */

export interface VersionData {
  assetId: string;
  versionNumber: number;
  storageKey: string;
  size: number;
  note?: string;
  author: string;
}

/**
 * Represents a user role in the system for RBAC.
 */

export interface RoleProps {
  id: number;
  name: string;
}

/**
 * Represents a user account in the system.
 */

export interface UserProps {
  id: number;
  name: string;
  email: string;
  password?: string | null;
  roleId: number;
  tokenVersion: number;
  createdAt?: Date;
  updatedAt?: Date;
}

/**
 * Tracks a user's login session history.
 */

export interface LoginHistoryProps {
  id: number;
  userId: number;
  refreshToken: string;
  loggedInAt: Date;
  loggedOutAt: Date;
  createdAt?: Date;
  updatedAt?: Date;
}

/**
 * Structure of the payload decoded from a JWT authentication token.
 */

export interface TokenPayloadProps {
  userId: number;
  email: string;
  loginId: number;
  roleId: number;
  tokenVersion: number;
}

export interface ApprovalProps {
  id: number;
  assetId: number;
  requestedBy: string;
  approvedBy?: string | null;
  status: "pending" | "approved" | "rejected";
  reason?: string | null;
  priority: "low" | "normal" | "high";
  assignedTo?: string[] | null;
  createdAt?: Date;
  updatedAt?: Date;
}

export interface ApprovalCommentProps {
  id: number;
  approvalId: number;
  userId: string;
  message: string;
  createdAt?: Date;
  updatedAt?: Date;
}

export interface SystemReportProps {
  generatedAt: string;
  summary: {
    totalAssets: number;
    freshAssets: number;
    duplicates: number;
    expired: number;
    complianceRate: string;
  };
  statusBreakdown: any[];
  failingAssets: {
    expiredCount: number;
    duplicateProbability: string;
  };
}

export interface RequestWithUser extends Request {
  user?: {
    id: string;
    email: string;
    tokenVersion: number;
    roleId: number;
  };
}

/**
 * Extends the global Express Request interface to include the authenticated user object.
 */

declare global {
  // eslint-disable-next-line @typescript-eslint/no-namespace
  namespace Express {
    interface Request {
      user?: {
        id: string;
        email: string;
        tokenVersion: number;
        roleId: number;
      };
    }
  }
}
