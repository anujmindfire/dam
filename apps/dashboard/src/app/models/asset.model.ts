/**
 * @file models/asset.model.ts
 * @description Shared TypeScript interfaces for the DAM Dashboard application.
 * These types eliminate `any` usage and provide IDE autocomplete across components.
 */

// ─────────────────────────────────────────────
// API Generic Wrapper
// ─────────────────────────────────────────────

/** Standard API envelope returned by all gateway endpoints. */
export interface ApiResponse<T> {
  success: boolean;
  message: string;
  data: T;
  totalCount?: number;
}

/** Paginated list response */
export interface PaginatedResponse<T> {
  result: T[];
  totalCount: number;
}

// ─────────────────────────────────────────────
// Asset
// ─────────────────────────────────────────────

export type AssetStatus = 'pending' | 'processing' | 'approved' | 'rejected' | 'expired';

export interface Asset {
  id: number;
  filename: string;
  storageKey: string;
  mimetype: string;
  size: number;
  status: AssetStatus;
  department: string;
  usageRights: string;
  expiryDate: string | null;
  uploader?: { id: number; name: string; email: string };
  createdAt: string;
  updatedAt: string;
}

export interface AssetListItem {
  id: number;
  filename: string;
  mimetype: string;
  status: AssetStatus;
  owner: string;
  createdAt: string;
  size?: number;
}

export interface DownloadUrlResponse {
  downloadUrl: string;
}

export interface UploadUrlRequest {
  filename: string;
  mimetype: string;
}

export interface UploadUrlResponse {
  uploadUrl: string;
  storageKey: string;
}

export interface CompleteUploadRequest {
  department: string;
  usageRights: string;
  expiryDate?: string;
  filename: string;
  storageKey: string;
  size: number;
  mimetype: string;
}

// ─────────────────────────────────────────────
// Auth
// ─────────────────────────────────────────────

export interface LoginCredentials {
  email: string;
  password: string;
}

export interface AuthUser {
  userId: number;
  email: string;
  name: string;
  roleId: number;
  accessToken: string;
  refreshToken: string;
}

// ─────────────────────────────────────────────
// Analytics / Dashboard
// ─────────────────────────────────────────────

export interface UsageTrend {
  date: string;   // ISO date string "2026-05-14"
  count: string;  // Comes as string from PostgreSQL GROUP BY
}

export interface MimetypeDistribution {
  mimetype: string;
  count: string;
}

export interface DashboardStats {
  totalAssets: number;
  totalStorage: number;
  statusDistribution: Record<AssetStatus | string, number>;
  mimetypeDistribution: MimetypeDistribution[];
  duplicateCount: number;
  expiredCount: number;
  atRiskCount: number;
  usageTrends: UsageTrend[];
  complianceScore: number;
}

// ─────────────────────────────────────────────
// Compliance
// ─────────────────────────────────────────────

export interface ComplianceViolation {
  title: string;
  description: string;
}

export interface ComplianceReport {
  score: number;
  approvedCount: number;
  duplicates: number;
  alertsCount: number;
  atRiskCount: number;
  violations: ComplianceViolation[];
}

// ─────────────────────────────────────────────
// Job
// ─────────────────────────────────────────────

export type JobStatus = 'pending' | 'processing' | 'completed' | 'failed';

export interface Job {
  id: number;
  type: string;
  status: JobStatus;
  payload?: Record<string, unknown>;
  result?: Record<string, unknown>;
  createdAt: string;
  updatedAt: string;
}
