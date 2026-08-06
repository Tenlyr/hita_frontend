import type {
  AuthTokens,
  AuthUser,
  RefreshedAccessToken,
} from "@/types/session.types";
import type { AdminLoginPayload } from "@/types/admin.auth.types";
import type { OtpRequestResult } from "@/types/customer.auth.types";
import api from "@/lib/axios";
import type { ApiResponse } from "@/types/api.types";

export const authService = {
  /** POST /auth/admin/login — email + password, admin console only. */
  async adminLogin(payload: AdminLoginPayload): Promise<AuthTokens> {
    const { data } = await api.post<ApiResponse<AuthTokens>>(
      "/auth/admin/login",
      payload,
    );
    return data.data;
  },

  /** POST /auth/otp/request — start a customer phone login. */
  async requestOtp(phoneNumber: string): Promise<OtpRequestResult> {
    const { data } = await api.post<ApiResponse<OtpRequestResult>>(
      "/auth/otp/request",
      { phone_number: phoneNumber },
    );
    return data.data;
  },

  /** POST /auth/otp/verify — sign in, creating the customer on first use. */
  async verifyOtp(phoneNumber: string, otp: string): Promise<AuthTokens> {
    const { data } = await api.post<ApiResponse<AuthTokens>>(
      "/auth/otp/verify",
      { phone_number: phoneNumber, otp },
    );
    return data.data;
  },

  /** POST /auth/refresh — exchange a refresh token for a new access token. */
  async refresh(refresh: string): Promise<RefreshedAccessToken> {
    const { data } = await api.post<ApiResponse<RefreshedAccessToken>>(
      "/auth/refresh",
      { refresh },
    );
    return data.data;
  },

  /** GET /auth/me — the currently authenticated user's profile. */
  async me(): Promise<AuthUser> {
    const { data } = await api.get<ApiResponse<AuthUser>>("/auth/me");
    return data.data;
  },

  /** POST /auth/logout — blacklists the refresh token server-side. */
  async logout(refresh: string): Promise<void> {
    await api.post<ApiResponse<null>>("/auth/logout", { refresh });
  },
};
