import axios, { AxiosError, type InternalAxiosRequestConfig } from "axios";

import { API_BASE_URL } from "@/constants/config";
import {
  clearAdminSession,
  clearCustomerSession,
  getAdminAccessToken,
  getAdminRefreshToken,
  getCustomerAccessToken,
  getCustomerRefreshToken,
  setAdminAccessToken,
  setCustomerAccessToken,
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
const AUTH_ENDPOINTS = [
  "/auth/admin/login",
  "/auth/refresh",
  "/auth/otp/request",
  "/auth/otp/verify",
];

type Audience = "admin" | "customer";
type RetriableConfig = InternalAxiosRequestConfig & { _retry?: boolean };

/**
 * Admin and customer sessions live in separate cookies and can be active at
 * once, so every request has to pick a side.
 *
 * `/admin/*` is unambiguous. `/auth/me`, `/auth/logout` and `/auth/refresh`
 * serve both, so the browser location decides: the console only ever runs
 * under /dashboard.
 */
function audienceFor(url = ""): Audience {
  if (url.startsWith("/admin")) return "admin";
  if (
    typeof window !== "undefined" &&
    window.location.pathname.startsWith("/dashboard")
  ) {
    return "admin";
  }
  return "customer";
}

function accessTokenFor(audience: Audience): string | undefined {
  return audience === "admin"
    ? (getAdminAccessToken() ?? getCustomerAccessToken())
    : (getCustomerAccessToken() ?? getAdminAccessToken());
}

api.interceptors.request.use((config) => {
  const token = accessTokenFor(audienceFor(config.url));
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// Serialise concurrent refreshes so a burst of 401s triggers only one call.
const refreshPromises: Partial<Record<Audience, Promise<string> | null>> = {};

function refreshAccessToken(audience: Audience): Promise<string> {
  if (!refreshPromises[audience]) {
    const refresh =
      audience === "admin" ? getAdminRefreshToken() : getCustomerRefreshToken();

    if (!refresh) {
      return Promise.reject(new Error("No refresh token available."));
    }

    refreshPromises[audience] = axios
      .post(`${API_BASE_URL}/auth/refresh`, { refresh })
      .then((response) => {
        const access: string = response.data.data.access;
        if (audience === "admin") setAdminAccessToken(access);
        else setCustomerAccessToken(access);
        return access;
      })
      .finally(() => {
        refreshPromises[audience] = null;
      });
  }
  return refreshPromises[audience];
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

    const audience = audienceFor(config.url);
    config._retry = true;
    try {
      const access = await refreshAccessToken(audience);
      config.headers.Authorization = `Bearer ${access}`;
      return api(config);
    } catch {
      if (audience === "admin") clearAdminSession();
      else clearCustomerSession();
      return Promise.reject(error);
    }
  },
);

export default api;
