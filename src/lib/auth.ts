import type { AuthTokens } from "@/types/session.types";
import Cookies from "js-cookie";

import { APP_CONFIG } from "@/constants/config";

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

/* Customer (storefront) session — kept separate from the admin cookies so
   signing out of one never affects the other. */

export function getCustomerAccessToken(): string | undefined {
  return Cookies.get(APP_CONFIG.accessTokenCookieName);
}

export function getCustomerRefreshToken(): string | undefined {
  return Cookies.get(APP_CONFIG.refreshTokenCookieName);
}

export function setCustomerAccessToken(access: string): void {
  Cookies.set(APP_CONFIG.accessTokenCookieName, access, {
    ...COOKIE_OPTIONS,
    expires: ACCESS_TOKEN_DAYS,
  });
}

export function setCustomerSession({ access, refresh }: AuthTokens): void {
  Cookies.set(APP_CONFIG.accessTokenCookieName, access, {
    ...COOKIE_OPTIONS,
    expires: ACCESS_TOKEN_DAYS,
  });
  Cookies.set(APP_CONFIG.refreshTokenCookieName, refresh, {
    ...COOKIE_OPTIONS,
    expires: REFRESH_TOKEN_DAYS,
  });
}

export function clearCustomerSession(): void {
  Cookies.remove(APP_CONFIG.accessTokenCookieName, { path: "/" });
  Cookies.remove(APP_CONFIG.refreshTokenCookieName, { path: "/" });
}

export function hasCustomerSession(): boolean {
  return Boolean(getCustomerAccessToken());
}
