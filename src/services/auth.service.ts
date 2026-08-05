import api from "@/lib/axios";
import type { ApiResponse } from "@/types/api.types";
import type {
  AdminLoginPayload,
  AuthTokens,
  AuthUser,
  RefreshedAccessToken,
} from "@/types/auth.types";

export const authService = {
  /** POST /auth/admin/login — email + password, admin console only. */
  async adminLogin(payload: AdminLoginPayload): Promise<AuthTokens> {
    const { data } = await api.post<ApiResponse<AuthTokens>>(
      "/auth/admin/login",
      payload,
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
