import React from "react";

// --- Authentication Types ---

export interface UserProps {
  id: number;
  email: string;
  name: string;
  roleId: number;
  status?: string;
  createdAt?: string;
}

export interface AuthContextTypeProps {
  user: UserProps | null;
  loading: boolean;
  login: (userData: any) => void;
  logout: () => void;
}

// --- Assets Types ---

export interface AssetsProps {
  id: string;
  filename: string;
  mimetype: string;
  type: string;
  status: string;
  owner?: string;
  createdAt: string;
  size: string | number;
}

export interface AssetsVersionProps {
  id: string;
  versionNumber: number;
  note: string;
  author: string;
  createdAt: string;
}

export interface AssetsDetailProps extends AssetsProps {
  department: string;
  usageRights?: string;
  expiryDate?: string;
  metadata?: MetadataProps;
  versions: AssetsVersionProps[];
}

export interface MetadataProps {
  id?: string;
  assetsId?: string;
  tags?: string[];
  department?: string;
  [key: string]: any;
}

// --- Analytics & Dashboard Types ---

export interface DashboardStatsProps {
  totalAssets: number;
  totalStorage: number;
  activeJobsCount: number;
  duplicateCount: number;
  expiredCount: number;
  atRiskCount: number;
  complianceScore: number;
  statusDistribution: Record<string, number>;
  usageTrends: Array<{ date: string; count: number }>;
  recentActivity: ActivityLogsProps[];
}

export interface ActivityLogsProps {
  id: number;
  action: string;
  target: string;
  timestamp: string;
}

export interface ComplianceStatsProps {
  statusRows: Array<{ status: string; count: number }>;
  duplicates: number;
  atRiskCount: number;
  approvedCount: number;
}

export interface ComplianceIssuesProps {
  id: string;
  assets: string;
  owner: string;
  type: "expired" | "duplicates" | "risky" | "all";
  severity: "critical" | "warning" | "info";
  description: string;
  action: string;
  date: string;
}

export interface SystemTasksProps {
  id: string;
  type: string;
  assets: string;
  status: string;
  started: string;
  duration: string;
  progress: number;
  details: string;
}

export interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: "primary" | "secondary" | "danger" | "success" | "outline" | "ghost";
  size?: "sm" | "md" | "lg" | "icon";
  fullWidth?: boolean;
  isLoading?: boolean;
}

export interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  error?: string;
  icon?: React.ReactNode;
  label?: string;
}

export interface HeaderProps {
  onMenuClick: () => void;
  collapsed?: boolean;
}

export type ToastTypeProps = "success" | "error" | "info" | "warning" | "loading";

export interface ToastProps {
  id: string;
  message: string;
  type: ToastTypeProps;
  onClose: (id: string) => void;
}

export interface ToastItemProps {
  id: string;
  message: string;
  type: ToastTypeProps;
}

export interface ToastContextTypeProps {
  toast: (message: string, type?: ToastTypeProps) => void;
}

export interface LoaderProps {
  size?: "sm" | "md" | "lg";
  className?: string;
}

export interface CardProps extends React.HTMLAttributes<HTMLDivElement> {
  className?: string;
  style?: React.CSSProperties;
}

export interface LayoutProps {
  children: React.ReactNode;
}

export interface SidebarProps {
  isOpen: boolean;
  onClose: () => void;
}

export interface UploadModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess?: () => void;
}

// --- Collection Types ---
export interface CollectionsProps {
  id: string;
  name: string;
  description?: string;
  parentId?: string | number | null;
  ownerId: number;
  assetCount?: number;
  subCollections?: CollectionsProps[];
  assets?: AssetsProps[];
  createdAt: string;
}

// --- Approval Types ---
export interface ApprovalRequestProps {
  id: string;
  assetsId: string;
  requesterId: number;
  status: "pending" | "approved" | "rejected";
  comments?: string;
  createdAt: string;
  assets?: AssetsProps;
  requesterName?: string;
}

export interface ApprovalHistoryProps {
  id: string;
  assetsId: string;
  status: string;
  comments?: string;
  createdAt: string;
}

// --- AppList Types ---
export interface Column {
  id: string;
  label: string;
  width?: number;
  align?: "left" | "center" | "right";
  sortable?: boolean;
}

export interface AppListProps<T> {
  columns: Column[];
  rows: T[];
  count: number;
  page: number;
  setPage: (page: number) => void;
  limit: number;
  setLimit: (limit: number) => void;
  loading?: boolean;
  onSearch?: (query: string) => void;
  addButton?: React.ReactNode;
  renderRow: (row: T, columnId: string) => React.ReactNode;
}

export interface AddToCollectionModalProps {
  assetsId: string;
  isOpen: boolean;
  onClose: () => void;
}
