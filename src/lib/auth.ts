import Cookies from "js-cookie";

import { APP_CONFIG } from "@/constants/config";
import type { AuthTokens } from "@/types/auth.types";

const isProduction = process.env.NODE_ENV === "production";

const COOKIE_OPTIONS: Cookies.CookieAttributes = {
  sameSite: "lax",
  secure: isProduction,
  path: "/",
};

// Refresh token outlives the access token; mirrors NINJA_JWT lifetimes.
const ACCESS_TOKEN_DAYS = 1;
const REFRESH_TOKEN_DAYS = 30;

export function getAdminAccessToken(): string | undefined {
  return Cookies.get(APP_CONFIG.adminAccessTokenCookieName);
}

export function getAdminRefreshToken(): string | undefined {
  return Cookies.get(APP_CONFIG.adminRefreshTokenCookieName);
}

export function setAdminAccessToken(access: string): void {
  Cookies.set(APP_CONFIG.adminAccessTokenCookieName, access, {
    ...COOKIE_OPTIONS,
    expires: ACCESS_TOKEN_DAYS,
  });
}

export function setAdminSession({ access, refresh }: AuthTokens): void {
  setAdminAccessToken(access);
  Cookies.set(APP_CONFIG.adminRefreshTokenCookieName, refresh, {
    ...COOKIE_OPTIONS,
    expires: REFRESH_TOKEN_DAYS,
  });
}

export function clearAdminSession(): void {
  Cookies.remove(APP_CONFIG.adminAccessTokenCookieName, { path: "/" });
  Cookies.remove(APP_CONFIG.adminRefreshTokenCookieName, { path: "/" });
}

export function hasAdminSession(): boolean {
  return Boolean(getAdminAccessToken());
}
