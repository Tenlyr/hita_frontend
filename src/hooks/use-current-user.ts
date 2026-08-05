"use client";

import { useRouter } from "next/navigation";
import * as React from "react";

import { APP_ROUTES } from "@/constants/routes";
import { useAuthStore } from "@/store/auth.store";

/** Loads GET /auth/me once per mount and exposes the logout action. */
export function useCurrentUser() {
  const router = useRouter();
  const user = useAuthStore((state) => state.user);
  const isLoading = useAuthStore((state) => state.isLoading);
  const loadUser = useAuthStore((state) => state.loadUser);
  const logoutFromStore = useAuthStore((state) => state.logout);

  React.useEffect(() => {
    if (!user) {
      void loadUser();
    }
  }, [user, loadUser]);

  const logout = React.useCallback(async () => {
    await logoutFromStore();
    router.replace(APP_ROUTES.ADMIN.LOGIN);
  }, [logoutFromStore, router]);

  return { user, isLoading, logout };
}
