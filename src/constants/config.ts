export const API_BASE_URL =
  process.env.NEXT_PUBLIC_API_BASE_URL ?? "http://127.0.0.1:8000/api/v1";

export const APP_CONFIG = {
  appName: "Hita Frontend",
  appUrl: process.env.NEXT_PUBLIC_APP_URL ?? "http://localhost:3000",
  accessTokenCookieName: "hf_access_token",
  refreshTokenCookieName: "hf_refresh_token",
  otpPendingCookieName: "hf_otp_pending",
  adminAccessTokenCookieName: "hf_admin_access",
  adminRefreshTokenCookieName: "hf_admin_refresh",
  tokenRefreshBuffer: 60,
  otpExpirySeconds: 59,
} as const;
