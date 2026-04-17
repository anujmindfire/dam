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
  metadata?: {
    tags?: string[];
    department?: string;
    [key: string]: any;
  };
  versions: AssetsVersionProps[];
}

// --- Analytics & Dashboard Types ---

export interface DashboardStatsProps {
  totalAssets: number;
  duplicateCount: number;
  expiredCount: number;
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
}

export interface ComplianceIssuesProps {
  id: string;
  asset: string;
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
  asset: string;
  status: string;
  started: string;
  duration: string;
  progress: number;
  details: string;
}

export interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: "primary" | "secondary" | "outline" | "ghost" | "danger";
  size?: "sm" | "md" | "lg" | "icon";
  isLoading?: boolean;
}

export interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  error?: string;
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
}

export interface LayoutProps {
  children: React.ReactNode;
}

export interface HeaderProps {
  onMenuClick: () => void;
}

export interface SidebarProps {
  isOpen: boolean;
  onClose: () => void;
}

export interface UploadModalProps {
  isOpen: boolean;
  onClose: () => void;
}

// --- Collection Types ---
export interface CollectionsProps {
  id: string;
  name: string;
  description?: string;
  ownerId: number;
  assetCount?: number;
  createdAt: string;
}

// --- Approval Types ---
export interface ApprovalRequestProps {
  id: string;
  assetId: string;
  requesterId: number;
  status: "pending" | "approved" | "rejected";
  comments?: string;
  createdAt: string;
  asset?: AssetsProps;
}
