import api from "@/lib/axios";
import type { ApiResponse } from "@/types/api.types";
import type { CartMergeLine, CartResult } from "@/types/customer.cart.types";

/**
 * Every call returns the whole cart, so the client never has to guess what a
 * mutation did to the totals — it just adopts the response.
 */
export const cartService = {
  /** GET /cart — the signed-in shopper's cart. */
  async get(): Promise<CartResult> {
    const { data } = await api.get<ApiResponse<CartResult>>("/cart");
    return data.data;
  },

  /** POST /cart/items — sets the line quantity; 0 removes it. */
  async setItem(variantId: number, quantity: number): Promise<CartResult> {
    const { data } = await api.post<ApiResponse<CartResult>>("/cart/items", {
      variant_id: variantId,
      quantity,
    });
    return data.data;
  },

  /** PATCH /cart/items/{variantId} — quantity stepper. */
  async updateQuantity(
    variantId: number,
    quantity: number,
  ): Promise<CartResult> {
    const { data } = await api.patch<ApiResponse<CartResult>>(
      `/cart/items/${variantId}`,
      { quantity },
    );
    return data.data;
  },

  async removeItem(variantId: number): Promise<CartResult> {
    const { data } = await api.delete<ApiResponse<CartResult>>(
      `/cart/items/${variantId}`,
    );
    return data.data;
  },

  async clear(): Promise<CartResult> {
    const { data } = await api.delete<ApiResponse<CartResult>>("/cart");
    return data.data;
  },

  /** POST /cart/merge — hands the guest cart over at sign-in. */
  async merge(items: CartMergeLine[]): Promise<CartResult> {
    const { data } = await api.post<ApiResponse<CartResult>>("/cart/merge", {
      items,
    });
    return data.data;
  },

  /** POST /cart/resolve — prices a guest cart without storing it. */
  async resolve(items: CartMergeLine[]): Promise<CartResult> {
    const { data } = await api.post<ApiResponse<CartResult>>("/cart/resolve", {
      items,
    });
    return data.data;
  },
};
