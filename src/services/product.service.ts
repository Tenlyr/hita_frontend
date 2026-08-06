import type { Product } from "@/types/product.types";
import type {
  ProductCategoryOptions,
  ProductCreatePayload,
  ProductListParams,
  ProductListResult,
  ProductUpdatePayload,
} from "@/types/admin.product.types";
import type {
  Category,
  ProductPage,
  ProductQuery,
} from "@/types/customer.product.types";
import api from "@/lib/axios";
import type { ApiResponse } from "@/types/api.types";

/**
 * Both faces of the product API live here.
 *
 * `/admin/*` needs a staff token; the storefront reads are public. Method
 * names keep them apart: retrieve/list/create/update/remove are admin,
 * browse/detail/related/categories are public.
 */
export const productService = {
  /* ---------------------------------------------------------------- public */

  /** GET /products — paginated, filterable storefront listing. */
  async browse(query: ProductQuery = {}): Promise<ProductPage> {
    const { data } = await api.get<ApiResponse<ProductPage>>("/products", {
      params: query,
    });
    return data.data;
  },

  /** GET /products/{id} — storefront product detail. */
  async detail(id: number): Promise<Product> {
    const { data } = await api.get<ApiResponse<Product>>(`/products/${id}`);
    return data.data;
  },

  /** GET /products/{id}/related — same category first, then others. */
  async related(id: number, limit = 4): Promise<Product[]> {
    const { data } = await api.get<ApiResponse<Product[]>>(
      `/products/${id}/related`,
      { params: { limit } },
    );
    return data.data;
  },

  /** GET /categories — categories with a representative image and count. */
  async categories(): Promise<Category[]> {
    const { data } =
      await api.get<ApiResponse<Category[]>>("/categories");
    return data.data;
  },

  /* ----------------------------------------------------------------- admin */

  /** GET /admin/products/{id} — full detail for one product. */
  async retrieve(id: number): Promise<Product> {
    const { data } = await api.get<ApiResponse<Product>>(
      `/admin/products/${id}`,
    );
    return data.data;
  },

  /** PUT /admin/products/{id} — same multipart shape as create. */
  async update(
    id: number,
    payload: ProductUpdatePayload,
    images: File[] = [],
  ): Promise<Product> {
    const formData = new FormData();
    formData.append("payload", JSON.stringify(payload));
    images.forEach((image) => formData.append("images", image));

    const { data } = await api.put<ApiResponse<Product>>(
      `/admin/products/${id}`,
      formData,
      { headers: { "Content-Type": undefined } },
    );
    return data.data;
  },

  /** DELETE /admin/products/{id} — removes the product, variants and images. */
  async remove(id: number): Promise<void> {
    await api.delete<ApiResponse<{ id: number }>>(`/admin/products/${id}`);
  },

  /** GET /admin/categories — values already used, for the pickers. */
  async categoryOptions(): Promise<ProductCategoryOptions> {
    const { data } =
      await api.get<ApiResponse<ProductCategoryOptions>>("/admin/categories");
    return data.data;
  },

  /** GET /admin/products — paginated, optionally filtered by `search`. */
  async list(params: ProductListParams = {}): Promise<ProductListResult> {
    const { data } = await api.get<ApiResponse<ProductListResult>>(
      "/admin/products",
      {
        params,
      },
    );
    return data.data;
  },

  /**
   * POST /admin/products — multipart, because images travel with the product.
   * `payload` is a JSON string so the nested variants survive form encoding.
   */
  async create(
    payload: ProductCreatePayload,
    images: File[] = [],
  ): Promise<Product> {
    const formData = new FormData();
    formData.append("payload", JSON.stringify(payload));
    images.forEach((image) => formData.append("images", image));

    const { data } = await api.post<ApiResponse<Product>>(
      "/admin/products",
      formData,
      {
        // Let the browser set the multipart boundary itself.
        headers: { "Content-Type": undefined },
      },
    );
    return data.data;
  },
};
