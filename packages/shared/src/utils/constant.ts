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
  assest: "/assest",
  login: "/login",
  logout: "/logout",
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
  usageLog: "usageLog",
  assetVersion: "assetVersion",
  role: "role",
  user: "user",
  approval: "approval",
  approvalComment: "approvalComment",
};

export const common = {
  expressAppRunning: (port: string) => `🚀 API Service running on port ${port}`,
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
  rmqConnected: "Successfully connected to RabbitMQ",
  redisConnecting: "Connecting to Redis...",
  redisReady: "Redis client is ready",
};

export const database = {
  dbConnectionSuccess: "Database is connected 👍 😄",
  dbConnectionError: "Database Connection Error:",
  dbSeedData: (length: number) => `Inserted ${length} roles into the database`,
  dbSeedStart: "Seeding database...",
  dbSeedComplete: "Database seeding completed...",
  seed: "--seed",
};

export const user = {
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
  notfound: "User not found"
};

export const auth = {
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
};

export const collection = {
  createSuccess: "Collection created successfully",
  listSuccess: "Collections retrieved successfully",
  getSuccess: "Collection details retrieved successfully",
  updateSuccess: "Collection updated successfully",
  deleted: "Collection deleted successfully",
  notFound: "Collection not found",
  assetAdded: "Asset added to collection successfully",
  assetNotFound: "Asset not found",
};

export const asset = {
  createSuccess: "Asset created successfully",
  listSuccess: "Assets retrieved successfully",
  getSuccess: "Asset details retrieved successfully",
  updateSuccess: "Asset metadata updated successfully",
  statusUpdateSuccess: "Asset status updated successfully",
  deleted: "Asset deleted successfully",
  notFound: "Asset not found",
  invalidStatus: "Invalid lifecycle status transition",
};

export const cache = {
  assetCacheKeyPrefix: "assets:",
  assetListCacheKey: "assets:list",
};

export const redisMsg = {
  connectionError: "Redis connection error:",
};

