import axios, { AxiosError, type InternalAxiosRequestConfig } from "axios";

import { API_BASE_URL } from "@/constants/config";
import {
  clearAdminSession,
  getAdminAccessToken,
  getAdminRefreshToken,
  setAdminAccessToken,
} from "@/lib/auth";

const api = axios.create({
  baseURL: API_BASE_URL,
  timeout: 10000,
  headers: {
    "Content-Type": "application/json",
    "ngrok-skip-browser-warning": "true",
  },
});

/** Endpoints that issue tokens — a 401 here is bad credentials, not an expiry. */
const AUTH_ENDPOINTS = ["/auth/admin/login", "/auth/refresh"];

type RetriableConfig = InternalAxiosRequestConfig & { _retry?: boolean };

api.interceptors.request.use((config) => {
  const token = getAdminAccessToken();
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// Serialise concurrent refreshes so a burst of 401s triggers only one call.
let refreshPromise: Promise<string> | null = null;

function refreshAccessToken(): Promise<string> {
  if (!refreshPromise) {
    const refresh = getAdminRefreshToken();
    if (!refresh) {
      return Promise.reject(new Error("No refresh token available."));
    }

    refreshPromise = axios
      .post(`${API_BASE_URL}/auth/refresh`, { refresh })
      .then((response) => {
        const access: string = response.data.data.access;
        setAdminAccessToken(access);
        return access;
      })
      .finally(() => {
        refreshPromise = null;
      });
  }
  return refreshPromise;
}

api.interceptors.response.use(
  (response) => response,
  async (error: AxiosError) => {
    const config = error.config as RetriableConfig | undefined;
    const isAuthEndpoint = AUTH_ENDPOINTS.some((path) =>
      config?.url?.includes(path),
    );

    if (
      error.response?.status !== 401 ||
      !config ||
      config._retry ||
      isAuthEndpoint
    ) {
      return Promise.reject(error);
    }

    config._retry = true;
    try {
      const access = await refreshAccessToken();
      config.headers.Authorization = `Bearer ${access}`;
      return api(config);
    } catch {
      clearAdminSession();
      return Promise.reject(error);
    }
  },
);

export default api;
