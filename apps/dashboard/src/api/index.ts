import axios, { AxiosError } from "axios";
import { apiUrl, baseRoute } from "@dam/shared/utils/constant";

// Create Axios Instance
const api = axios.create({
  baseURL: baseRoute,
  headers: {
    "Content-Type": "application/json",
  },
});

// Flag to avoid infinite refresh loops
let isRefreshing = false;
let failedQueue: any[] = [];

const processQueue = (error: any, token: string | null = null) => {
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
    const originalRequest: any = error.config;

    // Check if error is 401 and not already retried
    if (error.response?.status === 401 && !originalRequest._retry) {
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
  login: (data: any) => api.post(`${apiUrl.auth}${apiUrl.login}`, data),
  signup: (data: any) => api.post(`${apiUrl.auth}${apiUrl.signup}`, data),
  logout: () => api.post(`${apiUrl.auth}${apiUrl.logout}`),
};

// Assets
export const assetsService = {
  list: (params?: any) => api.get(apiUrl.assets, { params }),
  getById: (id: string) => api.get(`${apiUrl.assets}/${id}`),
  upload: (formData: FormData) =>
    api.post(`${apiUrl.assets}${apiUrl.upload}`, formData, {
      headers: { "Content-Type": "multipart/form-data" },
    }),
  update: (id: string, data: any) => api.patch(`${apiUrl.assets}/${id}`, data),
  delete: (id: string) => api.delete(`${apiUrl.assets}/${id}`),
  transitionStatus: (id: string, status: string) =>
    api.patch(`${apiUrl.assets}/${id}${apiUrl.status}`, { status }),
  uploadVersion: (id: string, formData: FormData) =>
    api.post(`${apiUrl.assets}/${id}${apiUrl.version}`, formData, {
      headers: { "Content-Type": "multipart/form-data" },
    }),
};

// Analytics
export const analyticsService = {
  getOverview: () => api.get(`${apiUrl.analytics}${apiUrl.overview}`),
  getCompliance: () => api.get(`${apiUrl.analytics}${apiUrl.compliance}`),
};

// Metadata
export const metadataService = {
  getDuplicates: () => api.get(`${apiUrl.metadata}${apiUrl.duplicates}`),
  getByAssets: (assetId: string) => api.get(`${apiUrl.metadata}/${assetId}`),
};

// Usage
export const usageService = {
  getLogs: (params?: any) => api.get(apiUrl.usage, { params }),
};

// Approval
export const approvalService = {
  request: (data: { assetId: string; comments?: string }) => api.post(apiUrl.approval, data),
  list: (params?: any) => api.get(apiUrl.approval, { params }),
  getById: (id: string) => api.get(`${apiUrl.approval}/${id}`),
  approve: (id: string) => api.patch(`${apiUrl.approval}/${id}${apiUrl.approve}`),
  reject: (id: string) => api.patch(`${apiUrl.approval}/${id}${apiUrl.reject}`),
  history: (assetId: string) =>
    api.get(`${apiUrl.approval}${apiUrl.assets}/${assetId}${apiUrl.history}`),
};

// Collections
export const collectionService = {
  create: (data: { name: string; description?: string }) => api.post(apiUrl.collection, data),
  list: (params?: any) => api.get(apiUrl.collection, { params }),
  getById: (id: string) => api.get(`${apiUrl.collection}/${id}`),
  update: (id: string, data: any) => api.patch(`${apiUrl.collection}/${id}`, data),
  remove: (id: string) => api.delete(`${apiUrl.collection}/${id}`),
  addAsset: (collectionId: string, assetId: string) =>
    api.post(`${apiUrl.collection}/${collectionId}${apiUrl.assets}`, { assetId }),
};

// Users
export const userService = {
  create: (data: any) => api.post(apiUrl.user, data),
  list: (params?: any) => api.get(apiUrl.user, { params }),
  update: (id: number, data: any) => api.patch(`${apiUrl.user}/${id}`, data),
  remove: (id: number) => api.delete(`${apiUrl.user}/${id}`),
};
