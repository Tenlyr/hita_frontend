import type { AuthUser } from "@/types/session.types";
import type { AdminLoginPayload } from "@/types/admin.auth.types";
import { create } from "zustand";

import { getApiErrorMessage } from "@/lib/api-error";
import {
  clearAdminSession,
  getAdminRefreshToken,
  hasAdminSession,
  setAdminSession,
} from "@/lib/auth";
import { authService } from "@/services/auth.service";

interface AuthState {
  user: AuthUser | null;
  isLoading: boolean;
  error: string | null;
  adminLogin: (payload: AdminLoginPayload) => Promise<boolean>;
  loadUser: () => Promise<void>;
  logout: () => Promise<void>;
  clearError: () => void;
}

export const useAuthStore = create<AuthState>((set) => ({
  user: null,
  isLoading: false,
  error: null,

  adminLogin: async (payload) => {
    set({ isLoading: true, error: null });
    try {
      const tokens = await authService.adminLogin(payload);
      setAdminSession(tokens);
      const user = await authService.me();
      set({ user, isLoading: false });
      return true;
    } catch (error) {
      // Don't leave half a session behind if /me failed after login.
      clearAdminSession();
      set({
        user: null,
        isLoading: false,
        error: getApiErrorMessage(
          error,
          "Unable to sign in. Please try again.",
        ),
      });
      return false;
    }
  },

  loadUser: async () => {
    if (!hasAdminSession()) {
      set({ user: null });
      return;
    }
    set({ isLoading: true });
    try {
      set({ user: await authService.me(), isLoading: false });
    } catch {
      clearAdminSession();
      set({ user: null, isLoading: false });
    }
  },

  logout: async () => {
    const refresh = getAdminRefreshToken();
    if (refresh) {
      try {
        await authService.logout(refresh);
      } catch {
        // Revoking server-side is best effort — the local session is cleared
        // either way so the user is never stuck signed in.
      }
    }
    clearAdminSession();
    set({ user: null, error: null });
  },

  clearError: () => set({ error: null }),
}));
