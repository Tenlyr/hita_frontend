import { create } from "zustand";
import { createJSONStorage, persist } from "zustand/middleware";

import { hasCustomerSession } from "@/lib/auth";
import { cartService } from "@/services/cart.service";
import type {
  CartLine,
  CartMergeLine,
  CartResult,
  CartSkippedLine,
} from "@/types/customer.cart.types";
import type { Product, ProductVariant } from "@/types/product.types";

/** One line can't exceed this, matching the server's guard. */
const MAX_QUANTITY_PER_LINE = 99;

type CartMode = "guest" | "server";

interface CartState {
  mode: CartMode;
  items: CartLine[];
  /** Lines the server dropped on the last sync, for a one-off toast. */
  skipped: CartSkippedLine[];
  /** False until the persisted guest cart has been read back in. */
  isHydrated: boolean;
  isSyncing: boolean;

  count: () => number;
  subtotal: () => string;
  quantityOf: (variantId: number) => number;

  hydrate: () => Promise<void>;
  addItem: (
    product: Product,
    variant: ProductVariant,
    quantity?: number,
  ) => Promise<void>;
  setQuantity: (variantId: number, quantity: number) => Promise<void>;
  removeItem: (variantId: number) => Promise<void>;
  clear: () => Promise<void>;
  mergeOnLogin: () => Promise<CartSkippedLine[]>;
  reset: () => void;
  clearSkipped: () => void;
}

/* Money is handled in paise. Rupee floats drift once a cart has a few lines
   in it, and a subtotal that is off by a paisa is the kind of bug nobody can
   reproduce on demand. */

function toPaise(value: string): number {
  const amount = Number(value);
  return Number.isNaN(amount) ? 0 : Math.round(amount * 100);
}

function fromPaise(paise: number): string {
  return (paise / 100).toFixed(2);
}

function stockOf(variant: Pick<ProductVariant, "quantity_available">): number {
  return variant.quantity_available ?? 0;
}

function clamp(quantity: number, available: number): number {
  return Math.max(0, Math.min(quantity, available, MAX_QUANTITY_PER_LINE));
}

/** Builds the local snapshot a guest line renders from. */
function lineFrom(
  product: Product,
  variant: ProductVariant,
  quantity: number,
): CartLine {
  // A guest line prices itself the same way the server does, or the total
  // would jump the moment they sign in and the cart merges.
  const listed = variant.price ?? "0";
  const price = variant.offer_price ?? listed;
  return {
    variant_id: variant.id,
    product_id: product.id,
    product_name: product.product_name,
    image: product.images[0]?.product_image ?? null,
    size: variant.size,
    offer: variant.offer,
    original_price: variant.offer_price ? listed : null,
    price,
    quantity,
    line_total: fromPaise(toPaise(price) * quantity),
    quantity_available: stockOf(variant),
  };
}

function withTotals(items: CartLine[]): CartLine[] {
  return items.map((item) => ({
    ...item,
    line_total: fromPaise(toPaise(item.price) * item.quantity),
  }));
}

function toMergeLines(items: CartLine[]): CartMergeLine[] {
  return items.map((item) => ({
    variant_id: item.variant_id,
    quantity: item.quantity,
  }));
}

/* A sign-in merge and a stray Add to Cart can overlap — the shopper can keep
   clicking while the request is in flight. Mutations await this so they land
   on top of the merged cart instead of racing it. */
let pendingSync: Promise<unknown> | null = null;

async function afterSync<T>(run: () => Promise<T>): Promise<T> {
  if (pendingSync) {
    await pendingSync.catch(() => undefined);
  }
  return run();
}

export const useCartStore = create<CartState>()(
  persist(
    (set, get) => {
      /** Adopt a server response wholesale — it is the source of truth. */
      function adopt(result: CartResult, mode: CartMode = "server") {
        set({
          mode,
          items: result.items,
          skipped: result.skipped ?? [],
          isSyncing: false,
        });
      }

      return {
        mode: "guest",
        items: [],
        skipped: [],
        isHydrated: false,
        isSyncing: false,

        count: () =>
          get().items.reduce((total, item) => total + item.quantity, 0),

        subtotal: () =>
          fromPaise(
            get().items.reduce(
              (total, item) => total + toPaise(item.price) * item.quantity,
              0,
            ),
          ),

        quantityOf: (variantId) =>
          get().items.find((item) => item.variant_id === variantId)?.quantity ??
          0,

        hydrate: async () => {
          if (hasCustomerSession()) {
            // A guest cart surviving a page load after sign-in means the
            // merge never ran (a hard refresh mid-flight, say) — fold it in
            // now rather than stranding it.
            const local = get().items;
            set({ isSyncing: true });
            try {
              const result =
                get().mode === "guest" && local.length > 0
                  ? await cartService.merge(toMergeLines(local))
                  : await cartService.get();
              adopt(result);
            } catch {
              set({ isSyncing: false });
            }
            return;
          }

          set({ mode: "guest" });
          if (get().items.length === 0) return;

          // Snapshot prices came off disk and may be weeks stale, so the
          // drawer paints from them but the numbers come from the server.
          set({ isSyncing: true });
          try {
            adopt(
              await cartService.resolve(toMergeLines(get().items)),
              "guest",
            );
          } catch {
            set({ isSyncing: false });
          }
        },

        addItem: async (product, variant, quantity = 1) =>
          afterSync(async () => {
            const available = stockOf(variant);
            if (available === 0)
              throw new Error("That option is out of stock.");

            // Adding twice should add up, but the wire call still *sets* the
            // final number so a retry can't double the line.
            const existing = get().quantityOf(variant.id);
            const target = clamp(existing + quantity, available);
            if (target === existing) {
              throw new Error("That is all we have in stock right now.");
            }

            if (get().mode === "server") {
              adopt(await cartService.setItem(variant.id, target));
              return;
            }

            const items = get().items.some(
              (item) => item.variant_id === variant.id,
            )
              ? get().items.map((item) =>
                  item.variant_id === variant.id
                    ? { ...item, quantity: target }
                    : item,
                )
              : [lineFrom(product, variant, target), ...get().items];

            set({ items: withTotals(items) });
          }),

        setQuantity: async (variantId, quantity) =>
          afterSync(async () => {
            const current = get().items.find(
              (item) => item.variant_id === variantId,
            );
            if (!current) return;

            const target = clamp(quantity, current.quantity_available);

            if (get().mode === "server") {
              adopt(
                target === 0
                  ? await cartService.removeItem(variantId)
                  : await cartService.updateQuantity(variantId, target),
              );
              return;
            }

            const items =
              target === 0
                ? get().items.filter((item) => item.variant_id !== variantId)
                : get().items.map((item) =>
                    item.variant_id === variantId
                      ? { ...item, quantity: target }
                      : item,
                  );

            set({ items: withTotals(items) });
          }),

        removeItem: async (variantId) =>
          afterSync(async () => {
            if (get().mode === "server") {
              adopt(await cartService.removeItem(variantId));
              return;
            }
            set({
              items: get().items.filter(
                (item) => item.variant_id !== variantId,
              ),
            });
          }),

        clear: async () => {
          if (get().mode === "server") {
            adopt(await cartService.clear());
            return;
          }
          set({ items: [] });
        },

        mergeOnLogin: async () => {
          const local = get().items;
          set({ isSyncing: true });

          const request = local.length
            ? cartService.merge(toMergeLines(local))
            : cartService.get();

          pendingSync = request;
          try {
            const result = await request;
            adopt(result);
            return result.skipped ?? [];
          } catch {
            // Keep the guest lines rather than dropping them on the floor;
            // hydrate() will try the merge again on the next load.
            set({ isSyncing: false, mode: "guest" });
            return [];
          } finally {
            pendingSync = null;
          }
        },

        // Signing out wipes the cart instead of demoting it to a guest cart:
        // on a shared device that would hand the next person this basket.
        reset: () =>
          set({ mode: "guest", items: [], skipped: [], isSyncing: false }),

        clearSkipped: () => set({ skipped: [] }),
      };
    },
    {
      name: "hita_cart",
      storage: createJSONStorage(() => localStorage),
      // Only the guest cart belongs on disk. A signed-in cart lives on the
      // server, and writing it here would outlive the session.
      partialize: (state) => ({
        items: state.mode === "guest" ? state.items : [],
      }),
      // Rehydrating during render would make the server HTML and the first
      // client paint disagree on the badge count. `useCart` calls
      // `persist.rehydrate()` from an effect instead.
      skipHydration: true,
      onRehydrateStorage: () => () => {
        useCartStore.setState({ isHydrated: true });
      },
    },
  ),
);
