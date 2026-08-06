/** Customer wishlist — saved products for the signed-in shopper. */

import type { Product } from "@/types/product.types";

export interface WishlistResult {
  results: Product[];
  product_ids: number[];
  count: number;
}

export interface WishlistToggleResult {
  product_id: number;
  wishlisted: boolean;
}
