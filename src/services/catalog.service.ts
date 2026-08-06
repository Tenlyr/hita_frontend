import api from "@/lib/axios";
import type { ApiResponse } from "@/types/api.types";
import type {
  CatalogCategory,
  CatalogPage,
  CatalogQuery,
} from "@/types/catalog.types";
import type { Product } from "@/types/product.types";

export const catalogService = {
  /** GET /catalog/products — paginated, filterable. Public, no auth required. */
  async products(query: CatalogQuery = {}): Promise<CatalogPage> {
    const { data } = await api.get<ApiResponse<CatalogPage>>(
      "/catalog/products",
      { params: query },
    );
    return data.data;
  },

  /** GET /catalog/products/{id} — public product detail. */
  async product(id: number): Promise<Product> {
    const { data } = await api.get<ApiResponse<Product>>(
      `/catalog/products/${id}`,
    );
    return data.data;
  },

  /** GET /catalog/products/{id}/related — same category first, then others. */
  async related(id: number, limit = 4): Promise<Product[]> {
    const { data } = await api.get<ApiResponse<Product[]>>(
      `/catalog/products/${id}/related`,
      { params: { limit } },
    );
    return data.data;
  },

  /** GET /catalog/categories — values already used, for the pickers. */
  async categories(): Promise<CatalogCategory[]> {
    const { data } = await api.get<ApiResponse<CatalogCategory[]>>(
      "/catalog/categories",
    );
    return data.data;
  },
};
