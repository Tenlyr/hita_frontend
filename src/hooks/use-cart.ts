"use client";

import * as React from "react";
import { toast } from "sonner";

import { useCartSheetStore } from "@/store/cart-sheet.store";
import { useCartStore } from "@/store/cart.store";
import type { Product, ProductVariant } from "@/types/product.types";

let hydrationStarted = false;

/**
 * Cart actions for the storefront.
 *
 * Guest and signed-in carts are the same API here — the store decides whether
 * a change goes to localStorage or the server.
 */
export function useCart() {
  const items = useCartStore((state) => state.items);
  const isHydrated = useCartStore((state) => state.isHydrated);
  const isSyncing = useCartStore((state) => state.isSyncing);
  const addToStore = useCartStore((state) => state.addItem);
  const setQuantity = useCartStore((state) => state.setQuantity);
  const removeFromStore = useCartStore((state) => state.removeItem);
  const openSheet = useCartSheetStore((state) => state.open);

  // Reading localStorage has to wait for the client, and only the first
  // mounted consumer should do it — several cards mount at once.
  React.useEffect(() => {
    if (hydrationStarted) return;
    hydrationStarted = true;
    void (async () => {
      // Must finish before hydrate(): it decides whether to merge based on
      // what came off disk, and reading it early sees an empty cart.
      await useCartStore.persist.rehydrate();
      await useCartStore.getState().hydrate();
    })();
  }, []);

  const add = React.useCallback(
    async (product: Product, variant: ProductVariant, quantity = 1) => {
      try {
        await addToStore(product, variant, quantity);
        toast.success(`${product.product_name ?? "Product"} added to cart`);
        openSheet();
      } catch (error) {
        toast.error(
          error instanceof Error
            ? error.message
            : "Could not add that to your cart.",
        );
      }
    },
    [addToStore, openSheet],
  );

  const updateQuantity = React.useCallback(
    async (variantId: number, quantity: number) => {
      try {
        await setQuantity(variantId, quantity);
      } catch {
        toast.error("Could not update your cart. Please try again.");
      }
    },
    [setQuantity],
  );

  const remove = React.useCallback(
    async (variantId: number) => {
      try {
        await removeFromStore(variantId);
        toast.success("Removed from cart");
      } catch {
        toast.error("Could not update your cart. Please try again.");
      }
    },
    [removeFromStore],
  );

  const count = items.reduce((total, item) => total + item.quantity, 0);

  return {
    items,
    count,
    // The badge stays blank until the persisted cart is read, so the server
    // HTML and the first client paint agree.
    isHydrated,
    isSyncing,
    add,
    updateQuantity,
    remove,
  };
}
