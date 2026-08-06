import api from "@/lib/axios";
import type { ApiResponse } from "@/types/api.types";
import type {
  Product,
  ProductCategoryOptions,
  ProductCreatePayload,
  ProductListParams,
  ProductListResult,
  ProductUpdatePayload,
} from "@/types/product.types";

export const productService = {
  /** GET /products/{id} — full detail for one product. */
  async retrieve(id: number): Promise<Product> {
    const { data } = await api.get<ApiResponse<Product>>(`/products/${id}`);
    return data.data;
  },

  /** PUT /products/{id} — same multipart shape as create. */
  async update(
    id: number,
    payload: ProductUpdatePayload,
    images: File[] = [],
  ): Promise<Product> {
    const formData = new FormData();
    formData.append("payload", JSON.stringify(payload));
    images.forEach((image) => formData.append("images", image));

    const { data } = await api.put<ApiResponse<Product>>(
      `/products/${id}`,
      formData,
      { headers: { "Content-Type": undefined } },
    );
    return data.data;
  },

  /** DELETE /products/{id} — removes the product, its variants and images. */
  async remove(id: number): Promise<void> {
    await api.delete<ApiResponse<{ id: number }>>(`/products/${id}`);
  },

  /** GET /products/categories — values already used, for the pickers. */
  async categoryOptions(): Promise<ProductCategoryOptions> {
    const { data } = await api.get<ApiResponse<ProductCategoryOptions>>(
      "/products/categories",
    );
    return data.data;
  },

  /** GET /products — paginated, optionally filtered by `search`. */
  async list(params: ProductListParams = {}): Promise<ProductListResult> {
    const { data } = await api.get<ApiResponse<ProductListResult>>("/products", {
      params,
    });
    return data.data;
  },

  /**
   * POST /products — multipart, because images travel with the product.
   * `payload` is a JSON string so the nested variants survive form encoding.
   */
  async create(
    payload: ProductCreatePayload,
    images: File[] = [],
  ): Promise<Product> {
    const formData = new FormData();
    formData.append("payload", JSON.stringify(payload));
    images.forEach((image) => formData.append("images", image));

    const { data } = await api.post<ApiResponse<Product>>("/products", formData, {
      // Let the browser set the multipart boundary itself.
      headers: { "Content-Type": undefined },
    });
    return data.data;
  },
};
