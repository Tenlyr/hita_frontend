"use client";

import * as React from "react";

import {
  clearCustomerSession,
  getCustomerRefreshToken,
  hasCustomerSession,
} from "@/lib/auth";
import { authService } from "@/services/auth.service";
import { useCartStore } from "@/store/cart.store";
import { useWishlistStore } from "@/store/wishlist.store";
import type { AuthUser } from "@/types/session.types";

/** The signed-in shopper, plus sign-out. */
export function useCustomerSession() {
  const [user, setUser] = React.useState<AuthUser | null>(null);
  const [isLoading, setIsLoading] = React.useState(true);
  const clearWishlist = useWishlistStore((state) => state.clear);
  const resetCart = useCartStore((state) => state.reset);

  React.useEffect(() => {
    let cancelled = false;

    async function load() {
      if (!hasCustomerSession()) {
        if (!cancelled) {
          setUser(null);
          setIsLoading(false);
        }
        return;
      }
      try {
        const profile = await authService.me();
        if (!cancelled) setUser(profile);
      } catch {
        // Token expired or revoked — treat as signed out.
        if (!cancelled) {
          clearCustomerSession();
          setUser(null);
        }
      } finally {
        if (!cancelled) setIsLoading(false);
      }
    }

    void load();
    return () => {
      cancelled = true;
    };
  }, []);

  const logout = React.useCallback(async () => {
    const refresh = getCustomerRefreshToken();
    if (refresh) {
      try {
        await authService.logout(refresh);
      } catch {
        // Revoking server-side is best effort — never trap someone signed in.
      }
    }
    clearCustomerSession();
    clearWishlist();
    // Emptied, not demoted to a guest cart — on a shared device that would
    // hand the next person this basket.
    resetCart();
    setUser(null);
  }, [clearWishlist, resetCart]);

  return { user, isLoading, isAuthenticated: user !== null, logout };
}
