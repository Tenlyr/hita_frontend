import api from "@/lib/axios";
import type { ApiResponse } from "@/types/api.types";
import type {
  WishlistResult,
  WishlistToggleResult,
} from "@/types/customer.wishlist.types";

export const wishlistService = {
  /** GET /wishlist — saved products with their ids. */
  async list(): Promise<WishlistResult> {
    const { data } = await api.get<ApiResponse<WishlistResult>>("/wishlist");
    return data.data;
  },

  /** GET /wishlist/ids — enough to paint hearts without loading products. */
  async ids(): Promise<number[]> {
    const { data } = await api.get<ApiResponse<{ product_ids: number[] }>>(
      "/wishlist/ids",
    );
    return data.data.product_ids;
  },

  /** POST /wishlist/toggle — the server returns the resulting state. */
  async toggle(productId: number): Promise<WishlistToggleResult> {
    const { data } = await api.post<ApiResponse<WishlistToggleResult>>(
      "/wishlist/toggle",
      { product_id: productId },
    );
    return data.data;
  },

  /** DELETE /wishlist/{id} — explicit remove, used by the wishlist page. */
  async remove(productId: number): Promise<void> {
    await api.delete<ApiResponse<WishlistToggleResult>>(
      `/wishlist/${productId}`,
    );
  },
};
