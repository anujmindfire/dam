export const statusCode = {
  success: 200,
  successCreated: 201,
  accepted: 202,
  badRequest: 400,
  unAuthorize: 401,
  accessDenied: 403,
  notFound: 404,
  alreadyExist: 409,
  expired: 410,
  tooManyRequest: 429,
  somethingWentWrong: 500,
  serviceUnavailable: 503,
};

export const baseRoute = "/api/v1";
export const defaultRoute = "/";
export const updateRoute = "/:id";

export const method = {
  delete: "DELETE",
  get: "GET",
  patch: "PATCH",
  post: "POST",
  put: "PUT",
};

export const apiUrl = {
  collection: "/collection",
  auth: "/auth",
  user: "/users",
  assets: "/assets",
  metadata: "/metadata",
  usage: "/usage",
  analytics: "/analytics",
  login: "/login",
  logout: "/logout",
  signup: "/signup",
  approval: "/approval",
  upload: "/upload",
  status: "/status",
  search: "/search",
  duplicates: "/duplicates",
  overview: "/overview",
  compliance: "/compliance",
  track: "/track",
  approve: "/approve",
  reject: "/reject",
  history: "/history",
  report: "/report",
  version: "/version",
  refresh: "/refresh",
};

export const enums = {
  pending: "pending",
  pending_approval: "pending_approval",
  reviewed: "reviewed",
  approved: "approved",
  rejected: "rejected",
  expired: "expired",
  archived: "archived",
};

export const roleId = {
  admin: 1,
  user: 2,
};

export const role = {
  admin: "Admin",
  user: "User",
};

export const regex = {
  email: /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/,
  name: /^[A-Za-z]+$/,
  password: /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[^A-Za-z0-9])(?=.{8,})(?!.*\s).*$/,
};

export const sortOrders = {
  ASC: "ASC",
  DESC: "DESC",
};

export const seedData = {
  users: [
    {
      name: "Admin",
      email: "admin@dam.com",
      password: "$2b$10$sanKUITnsVbzhkzlxddqRuk37YviPx5SEdvs6F4B4jvJ7bWnETZPW",
      roleId: 1,
    },
  ],
  roles: [
    {
      id: 1,
      name: role.admin,
    },
    {
      id: 2,
      name: role.user,
    },
  ],
};

export const modelName = {
  assets: "assets",
  collection: "collection",
  metadata: "metadata",
  usage: "usage",
  version: "version",
  role: "role",
  user: "user",
  approval: "approval",
  approvalComment: "approvalComment",
  jobs: "jobs",
};

export const commonMsg = {
  expressAppRunning: (port: number) => `🚀 API Service running on port ${port}`,
  assetsServiceRunning: (port: number) => `🚀  Service running on port ${port}`,
  metadataServiceRunning: (port: number) => `🚀 Metadata Service running on port ${port}`,
  usageServiceRunning: (port: number) => `🚀 Usage Service running on port ${port}`,
  serviceFailed: (serviceName: string) => `${serviceName} Service failed to start:`,
  unSupportMethod: "Unsupported HTTP method",
  signInDown: "SIGINT received. Shutting down...",
  httpServerClosed: "HTTP server closed",
  httpCloseConnection: "SIGTERM received. Closing connections...",
  apiSuccessMessage: "API is running successfully.",
  somethingWentWrong: "Something went wrong. Please try again later.",
  pageNotFound: "Requested page not found.",
  tooManyRequest: "Too many requests from this IP address. Please try again later.",
  accessForbidden: "Access forbidden. Insufficient permissions for this resource",
  unAuthorized: "Unauthorized access. User role not found.",
  healthy: "healthy",
  uncaughtException: "Uncaught Exception",
  unhandledRejection: "Unhandled Rejection",
  rmqConnected: "🔗 Connected to RabbitMQ",
  rmqConnectionError: "Failed to connect to RabbitMQ:",
  redisConnecting: "Connecting to Redis...",
  redisReady: "Redis client is ready",
  badGateway: "Bad Gateway: Service temporarily unavailable",
  reportSuccess: "Report generated successfully",
};

export const databaseMsg = {
  dbConnectionSuccess: "Database is connected 👍 😄",
  dbConnectionError: "Database Connection Error:",
  dbSeedData: (length: number) => `Inserted ${length} roles into the database`,
  dbSeedStart: "Seeding database...",
  dbSeedComplete: "Database seeding completed...",
  seed: "--seed",
};

export const userMsg = {
  nameLengthError: "Name must be between 2 and 100 characters.",
  nameRequired: "Name is required.",
  invalidEmail: "Please provide a valid email address.",
  invalidPassword:
    "Password must be at least 8 characters long and include an uppercase letter, a lowercase letter, a number, and a special character",
  emailRequired: "Email is required.",
  createSuccess: "User created successfully",
  listSuccess: "Users retrieved successfully",
  updateSuccess: "User updated successfully",
  deleted: "User deleted successfully",
  alreadyExist: "User already exists",
  notfound: "User not found",
};

export const authMsg = {
  invalidCredentials: "LogIn failed: Invalid credentials provided.",
  invalidToken: "Invalid or expired token.",
  loginSuccess: "Successfully logged in.",
  logoutSuccess: "Successfully logged out.",
  appConfiguration: "App configuration is missing",
  tokenNotFound: "Token not found",
  tokenExpiredError: "TokenExpiredError",
  tokenExpired: "Session expired. Please log in again.",
  invalidSignature: "JsonWebTokenError",
  userNotFound: "User not found or is deactivated",
  tokenRefreshSuccess: "Token refreshed successfully.",
};

export const collectionMsg = {
  createSuccess: "Collection created successfully",
  listSuccess: "Collections retrieved successfully",
  getSuccess: "Collection details retrieved successfully",
  updateSuccess: "Collection updated successfully",
  deleted: "Collection deleted successfully",
  notFound: "Collection not found",
  assetAdded: "Assets added to collection successfully",
  assetNotFound: "Assets not found",
};

export const assetMsg = {
  createSuccess: "Assets created successfully",
  listSuccess: "Assets retrieved successfully",
  getSuccess: "Assets details retrieved successfully",
  updateSuccess: "Assets metadata updated successfully",
  statusUpdateSuccess: "Assets status updated successfully",
  deleted: "Assets deleted successfully",
  notFound: "Assets not found",
  invalidStatus: "Invalid lifecycle status transition",
  noFile: "No file provided",
};

export const cacheMsg = {
  assetCacheKeyPrefix: "assets:",
  assetListCacheKey: "assets:list",
};

export const redisMsg = {
  connectionError: "Redis connection error:",
};

export const metadataMsg = {
  updateSuccess: "Metadata updated successfully",
  notFound: "Metadata not found for this assets",
  tagsRequired: "Tags query parameter is required",
};

export const usageMsg = {
  trackSuccess: "Usage tracked successfully",
};

export const approvalMsg = {
  createSuccess: "Approval request created successfully",
  listSuccess: "Approvals retrieved successfully",
  getSuccess: "Approval retrieved successfully",
  historySuccess: "Approval history retrieved successfully",
  approveSuccess: " approved successfully",
  rejectSuccess: " rejected successfully",
  assetNotFound: " not found",
  notFound: "Approval not found",
  createFailed: "Failed to create approval request",
  rejectionRequired: "Rejection reason is required",
};

export const consumerMsg = {
  metadataAnalyzedProcessing: (assetsId: number) =>
    `[Metadata Consumer] Processing analysis for assets ${assetsId}`,
  metadataAnalyzedSuccess: (assetsId: number) =>
    `[Metadata Consumer] Metadata updated for assets ${assetsId}`,
  metadataAnalyzedError: (assetsId: number) =>
    `[Metadata Consumer] Error processing assets ${assetsId}:`,
  assetCreatedMetadata: (assetsId: number) =>
    `[Metadata Consumer] Initializing metadata for new assets ${assetsId}`,
  assetCreatedMetadataReady: (assetsId: number) =>
    `[Metadata Consumer]  ${assetsId} ready for enrichment`,
  assetCreatedMetadataError: "[Metadata Consumer] Error on assets_created:",
  assetDeletedMetadata: (assetsId: number) =>
    `[Metadata Consumer] Cleaning metadata for deleted assets ${assetsId}`,
  assetDeletedMetadataCleanup: (assetsId: number) =>
    `[Metadata Consumer] Metadata cleanup done for assets ${assetsId}`,
  assetDeletedMetadataError: "[Metadata Consumer] Error on assets_deleted:",
  allMetadataConsumersStarted: "✅ All metadata consumers started",
  metadataConsumersError: "Failed to start metadata consumers:",

  usageAssetCreated: (assetsId: number) =>
    `[Usage Consumer] Initializing tracking for new assets ${assetsId}`,
  usageAssetCreatedSuccess: (assetsId: number) =>
    `[Usage Consumer] Tracking initialized for assets ${assetsId}`,
  usageAssetCreatedError: "[Usage Consumer] Error on assets_created:",
  usageAssetApproved: (assetsId: number) =>
    `[Usage Consumer]  ${assetsId} approved - usage tracking active`,
  usageAssetApprovedError: "[Usage Consumer] Error on assets_approved:",
  usageAssetDeleted: (assetsId: number) =>
    `[Usage Consumer] Archiving usage data for assets ${assetsId}`,
  usageAssetDeletedSuccess: (assetsId: number) =>
    `[Usage Consumer] Usage data archived for assets ${assetsId}`,
  usageAssetDeletedError: "[Usage Consumer] Error on assets_deleted:",
  allUsageConsumersStarted: "✅ All usage consumers started",
  usageConsumersError: "Failed to start usage consumers:",
};

export const ui = {
  dashboardTitle: "Dashboard Overview",
  dashboardSubtitle: "Monitor your digital assets and system health",
  assetListTitle: " Library",
  uploadAsset: "Upload ",
  cancel: "Cancel",
  save: "Save Changes",
  edit: "Edit",
  view: "View Details",
  delete: "Delete",
  download: "Download",
  share: "Share",
  actions: "Actions",

  filterByName: "Search by name...",
  status: "Status",
  approved: "Approved",
  pending: "Pending",
  underReview: "Under Review",
  image: "Image",
  video: "Video",
  document: "Document",
  audio: "Audio",
  noAssetsFound: "No assets found",
  tryAdjustingFilters: "Try adjusting your search or filters to find what you're looking for.",

  approve: "Approve ",
  reject: "Reject ",

  complianceTitle: "Compliance & Governance",
  complianceSubtitle: "Track assets usage and regulatory adherence",

  jobsTitle: "Background Jobs",
  jobsSubtitle: "Monitor and manage system processing tasks",
  failed: "Failed",
  completed: "Completed",
  running: "Running",
  searchJobId: "Search job ID...",
  noJobsFound: "No background jobs found",
  pause: "Pause",
  retry: "Retry",

  settingsTitle: "Account Settings",
  settingsSubtitle: "Manage your profile and platform preferences",
  profile: "Profile Information",
  theme: "Visual Theme",
  notifications: "Notifications",
  privacy: "Privacy & Security",
  changePassword: "Change Password",
  twoFactorAuth: "Two-Factor Authentication",
  enable: "Enable",
  administration: "System Administration",

  reportsTitle: "System Reports",
  reportsSubtitle: "Generate and export platform analytics",
  export: "Export Report",
};
