import api from "@/lib/axios";
import type { ApiResponse } from "@/types/api.types";
import type {
  Product,
  ProductCreatePayload,
  ProductListParams,
  ProductListResult,
} from "@/types/product.types";

export const productService = {
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
