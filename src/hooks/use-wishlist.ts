"use client";

import * as React from "react";
import { toast } from "sonner";

import { hasCustomerSession } from "@/lib/auth";
import { useAuthDialogStore } from "@/store/auth-dialog.store";
import { useWishlistStore } from "@/store/wishlist.store";

/**
 * Wishlist actions for the storefront hearts.
 *
 * Signed out, the heart opens the login dialog instead of failing with a 401.
 */
export function useWishlist() {
  const ids = useWishlistStore((state) => state.ids);
  const isLoaded = useWishlistStore((state) => state.isLoaded);
  const load = useWishlistStore((state) => state.load);
  const toggleInStore = useWishlistStore((state) => state.toggle);
  const openAuthDialog = useAuthDialogStore((state) => state.open);

  React.useEffect(() => {
    if (!isLoaded) void load();
  }, [isLoaded, load]);

  const isWishlisted = React.useCallback(
    (productId: number) => ids.includes(productId),
    [ids],
  );

  const toggle = React.useCallback(
    async (productId: number, productName?: string | null) => {
      if (!hasCustomerSession()) {
        openAuthDialog();
        return;
      }
      try {
        const saved = await toggleInStore(productId);
        toast.success(
          saved
            ? `${productName ?? "Product"} saved to wishlist`
            : `${productName ?? "Product"} removed from wishlist`,
        );
      } catch {
        toast.error("Could not update your wishlist. Please try again.");
      }
    },
    [openAuthDialog, toggleInStore],
  );

  return { ids, isWishlisted, toggle };
}
