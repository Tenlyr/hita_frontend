"use client";

import { useRouter } from "next/navigation";
import * as React from "react";

import { APP_ROUTES } from "@/constants/routes";
import { useAuthStore } from "@/store/auth.store";
import type { AdminLoginPayload } from "@/types/auth.types";

/** Drives the admin login form: submits credentials, then routes to the dashboard. */
export function useAdminLogin() {
  const router = useRouter();
  const adminLogin = useAuthStore((state) => state.adminLogin);
  const clearError = useAuthStore((state) => state.clearError);
  const isLoading = useAuthStore((state) => state.isLoading);
  const error = useAuthStore((state) => state.error);

  const login = React.useCallback(
    async (payload: AdminLoginPayload) => {
      const ok = await adminLogin(payload);
      if (ok) {
        router.replace(APP_ROUTES.APP.DASHBOARD);
      }
      return ok;
    },
    [adminLogin, router],
  );

  return { login, isLoading, error, clearError };
}
