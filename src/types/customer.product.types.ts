/** Storefront browsing — listing queries, paged results, category tiles. */

import type { Product } from "@/types/product.types";

export interface Category {
  name: string;
  image: string | null;
  product_count: number;
}

export type ProductSort =
  "latest" | "popular" | "price_low" | "price_high" | "name";

export const SORT_LABELS: Record<ProductSort, string> = {
  popular: "Sort by Popularity",
  latest: "Sort by Latest",
  price_low: "Price: Low to High",
  price_high: "Price: High to Low",
  name: "Name: A to Z",
};

export interface ProductQuery {
  page?: number;
  page_size?: number;
  category?: string;
  sub_category?: string;
  sort?: ProductSort;
  search?: string;
  in_stock?: boolean;
}

export interface ProductPage {
  results: Product[];
  count: number;
  page: number;
  page_size: number;
  total_pages: number;
  has_next: boolean;
}
