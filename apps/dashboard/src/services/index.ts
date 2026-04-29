import axios, { AxiosError } from "axios";
import { apiUrl, baseRoute } from "@dam/shared/utils/constant";

// Create Axios Instance
const api = axios.create({
  baseURL: (import.meta.env.VITE_API_URL as string) || baseRoute,
  headers: {
    "Content-Type": "application/json",
  },
});

// Flag to avoid infinite refresh loops
let isRefreshing = false;
let failedQueue: {
  resolve: (token: string | null) => void;
  reject: (error: unknown) => void;
}[] = [];

const processQueue = (error: unknown, token: string | null = null) => {
  failedQueue.forEach((prom) => {
    if (error) {
      prom.reject(error);
    } else {
      prom.resolve(token);
    }
  });
  failedQueue = [];
};

// Request Interceptor
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem("accessToken");
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error),
);

// Response Interceptor for Silent Refresh
api.interceptors.response.use(
  (response) => response,
  async (error: AxiosError) => {
    const originalRequest = error.config as { _retry?: boolean; headers: Record<string, string> };

    // Check if error is 401 and not already retried
    if (error.response?.status === 401 && !originalRequest?._retry) {
      if (isRefreshing) {
        return new Promise((resolve, reject) => {
          failedQueue.push({ resolve, reject });
        })
          .then((token) => {
            originalRequest.headers.Authorization = `Bearer ${token}`;
            return api(originalRequest);
          })
          .catch((err) => Promise.reject(err));
      }

      originalRequest._retry = true;
      isRefreshing = true;

      try {
        const refreshToken = localStorage.getItem("refreshToken");
        if (!refreshToken) throw new Error("No refresh token");

        // Attempt to rotate tokens
        const res = await axios.post(`${baseRoute}${apiUrl.auth}/refresh`, {
          refreshToken,
        });

        const { accessToken, refreshToken: newRefreshToken } = res.data.data;

        localStorage.setItem("accessToken", accessToken);
        localStorage.setItem("refreshToken", newRefreshToken);

        api.defaults.headers.common["Authorization"] = `Bearer ${accessToken}`;
        processQueue(null, accessToken);

        return api(originalRequest);
      } catch (refreshError) {
        processQueue(refreshError, null);
        localStorage.removeItem("accessToken");
        localStorage.removeItem("refreshToken");
        window.location.href = "/login";
        return Promise.reject(refreshError);
      } finally {
        isRefreshing = false;
      }
    }

    return Promise.reject(error);
  },
);

export default api;

// Support Services

// Auth
export const authService = {
  login: (data: Record<string, unknown>) => api.post(`${apiUrl.auth}${apiUrl.login}`, data),
  signup: (data: Record<string, unknown>) => api.post(`${apiUrl.auth}${apiUrl.signup}`, data),
  logout: () => api.post(`${apiUrl.auth}${apiUrl.logout}`),
};

// Assets
export const assetsService = {
  list: (params?: Record<string, unknown>) => {
    // Filter out undefined values to prevent axios from converting them to "undefined" string
    const filteredParams = params
      ? Object.fromEntries(Object.entries(params).filter(([_, value]) => value !== undefined))
      : undefined;
    return api.get(apiUrl.assets, { params: filteredParams });
  },
  getById: (id: string) => api.get(`${apiUrl.assets}/${id}`),
  upload: (formData: FormData, onProgress?: (percent: number) => void) =>
    api.post(`${apiUrl.assets}${apiUrl.upload}`, formData, {
      headers: { "Content-Type": "multipart/form-data" },
      onUploadProgress: (progressEvent) => {
        if (onProgress && progressEvent.total) {
          const percentCompleted = Math.round((progressEvent.loaded * 100) / progressEvent.total);
          onProgress(percentCompleted);
        }
      },
    }),
  update: (id: string, data: Record<string, unknown>) => api.patch(`${apiUrl.assets}/${id}`, data),
  delete: (id: string) => api.delete(`${apiUrl.assets}/${id}`),
  transitionStatus: (id: string, status: string) =>
    api.patch(`${apiUrl.assets}/${id}${apiUrl.status}`, { status }),
  uploadVersion: (id: string, formData: FormData) =>
    api.post(`${apiUrl.assets}/${id}${apiUrl.version}`, formData, {
      headers: { "Content-Type": "multipart/form-data" },
    }),
  getUploadUrl: (data: { filename: string; mimetype: string }) =>
    api.post(`${apiUrl.assets}${apiUrl.upload}${apiUrl.presignedUrl}`, data),
  completeUpload: (data: Record<string, unknown>) =>
    api.post(`${apiUrl.assets}${apiUrl.upload}${apiUrl.complete}`, data),
  directUpload: async (
    file: File,
    extraData: Record<string, unknown>,
    onProgress?: (percent: number) => void,
  ) => {
    const {
      data: {
        data: { uploadUrl, storageKey },
      },
    } = await assetsService.getUploadUrl({
      filename: file.name,
      mimetype: file.type,
    });

    await axios.put(uploadUrl, file, {
      headers: { "Content-Type": file.type },
      onUploadProgress: (progressEvent) => {
        if (onProgress && progressEvent.total) {
          const percentCompleted = Math.round((progressEvent.loaded * 100) / progressEvent.total);
          onProgress(percentCompleted);
        }
      },
    });

    return await assetsService.completeUpload({
      ...extraData,
      filename: file.name,
      storageKey,
      size: file.size,
      mimetype: file.type,
    });
  },
  getDownloadUrl: (id: string) => api.get(`${apiUrl.assets}/${id}/download`),
};

// Analytics
export const analyticsService = {
  getOverview: (params?: Record<string, unknown>) =>
    api.get(`${apiUrl.analytics}${apiUrl.overview}`, { params }),
  getCompliance: () => api.get(`${apiUrl.analytics}${apiUrl.compliance}`),
  getReport: () => api.get(`${apiUrl.analytics}${apiUrl.report}`),
  triggerReport: () => api.post(`${apiUrl.analytics}${apiUrl.report}/trigger`),
};

// Metadata
export const metadataService = {
  getDuplicates: () => api.get(`${apiUrl.metadata}${apiUrl.duplicates}`),
  getByAssets: (assetsId: string) => api.get(`${apiUrl.metadata}/${assetsId}`),
};

// Usage
export const usageService = {
  getLogs: (params?: Record<string, unknown>) => api.get(apiUrl.usage, { params }),
};

// Approval
export const approvalService = {
  request: (data: { assetsId: string; comments?: string }) => api.post(apiUrl.approval, data),
  list: (params?: Record<string, unknown>) => api.get(apiUrl.approval, { params }),
  getById: (id: string) => api.get(`${apiUrl.approval}/${id}`),
  approve: (id: string) => api.patch(`${apiUrl.approval}/${id}${apiUrl.approve}`),
  reject: (id: string, reason: string) =>
    api.patch(`${apiUrl.approval}/${id}${apiUrl.reject}`, { reason }),
  history: (assetsId: string) =>
    api.get(`${apiUrl.approval}${apiUrl.assets}/${assetsId}${apiUrl.history}`),
};

// Collections
export const collectionService = {
  create: (data: { name: string; description?: string; parentId?: string | number | null }) =>
    api.post(apiUrl.collection, data),
  list: (params?: Record<string, unknown>) => api.get(apiUrl.collection, { params }),
  getById: (id: string) => api.get(`${apiUrl.collection}/${id}`),
  update: (id: string, data: Record<string, unknown>) =>
    api.patch(`${apiUrl.collection}/${id}`, data),
  remove: (id: string) => api.delete(`${apiUrl.collection}/${id}`),
  addAsset: (collectionId: string, assetsId: string) =>
    api.post(`${apiUrl.collection}/${collectionId}${apiUrl.assets}`, { assetsId }),
};

// Users
export const userService = {
  create: (data: Record<string, unknown>) => api.post(apiUrl.user, data),
  list: (params?: Record<string, unknown>) => api.get(apiUrl.user, { params }),
  update: (id: number, data: Record<string, unknown>) => api.patch(`${apiUrl.user}/${id}`, data),
  remove: (id: number) => api.delete(`${apiUrl.user}/${id}`),
};
