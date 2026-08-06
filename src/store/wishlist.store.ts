import { create } from "zustand";

import { hasCustomerSession } from "@/lib/auth";
import { wishlistService } from "@/services/wishlist.service";

interface WishlistState {
  /** Product ids the shopper has saved. */
  ids: number[];
  isLoaded: boolean;
  has: (productId: number) => boolean;
  load: () => Promise<void>;
  toggle: (productId: number) => Promise<boolean>;
  clear: () => void;
}

/**
 * Shared across every heart on the site, so the same product shows the same
 * state on a card, the detail page and the wishlist page.
 */
export const useWishlistStore = create<WishlistState>((set, get) => ({
  ids: [],
  isLoaded: false,

  has: (productId) => get().ids.includes(productId),

  load: async () => {
    if (!hasCustomerSession()) {
      set({ ids: [], isLoaded: true });
      return;
    }
    try {
      set({ ids: await wishlistService.ids(), isLoaded: true });
    } catch {
      // A failed load just means no hearts are filled in yet.
      set({ isLoaded: true });
    }
  },

  toggle: async (productId) => {
    const previous = get().ids;
    const optimistic = previous.includes(productId)
      ? previous.filter((id) => id !== productId)
      : [...previous, productId];

    // Paint immediately; the heart should not wait on the network.
    set({ ids: optimistic });

    try {
      const result = await wishlistService.toggle(productId);
      // Trust the server's answer over the optimistic guess.
      set({
        ids: result.wishlisted
          ? Array.from(new Set([...get().ids, productId]))
          : get().ids.filter((id) => id !== productId),
      });
      return result.wishlisted;
    } catch {
      set({ ids: previous });
      throw new Error("Could not update your wishlist.");
    }
  },

  clear: () => set({ ids: [], isLoaded: false }),
}));
