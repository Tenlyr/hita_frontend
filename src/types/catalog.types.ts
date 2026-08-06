import type { Product } from "@/types/product.types";

export interface CatalogCategory {
  name: string;
  image: string | null;
  product_count: number;
}

export type CatalogSort =
  | "latest"
  | "popular"
  | "price_low"
  | "price_high"
  | "name";

export const CATALOG_SORT_LABELS: Record<CatalogSort, string> = {
  popular: "Sort by Popularity",
  latest: "Sort by Latest",
  price_low: "Price: Low to High",
  price_high: "Price: High to Low",
  name: "Name: A to Z",
};

export interface CatalogQuery {
  page?: number;
  page_size?: number;
  category?: string;
  sub_category?: string;
  sort?: CatalogSort;
  search?: string;
  in_stock?: boolean;
}

export interface CatalogPage {
  results: Product[];
  count: number;
  page: number;
  page_size: number;
  total_pages: number;
  has_next: boolean;
}
