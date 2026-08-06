export interface ProductVariant {
  id: number;
  size: string | null;
  quantity_available: number | null;
  price: string | null;
  length_in_cm: string | null;
  width_in_cm: string | null;
  height_in_cm: string | null;
  diameter_in_cm: string | null;
  offer: string | null;
}

export interface ProductImage {
  id: number;
  product_image: string;
}

export interface Product {
  id: number;
  product_name: string | null;
  category: string | null;
  sub_category: string | null;
  description: string | null;
  made_in: string | null;
  rating: number | null;
  is_hot_sale: boolean;
  care_instruction: string | null;
  usage_instruction: string | null;
  created_at: string | null;
  images: ProductImage[];
  variants: ProductVariant[];
}

/** A variant row while it is being edited — every field is a string in the DOM. */
export interface ProductVariantDraft {
  key: string;
  /** Set for variants that already exist server-side; absent means "new". */
  id?: number;
  size: string;
  quantity_available: string;
  price: string;
  length_in_cm: string;
  width_in_cm: string;
  height_in_cm: string;
  diameter_in_cm: string;
  offer: string;
}

export interface ProductDraft {
  product_name: string;
  category: string;
  sub_category: string;
  made_in: string;
  rating: string;
  is_hot_sale: boolean;
  description: string;
  care_instruction: string;
  usage_instruction: string;
  variants: ProductVariantDraft[];
}

export type ProductDraftErrors = Partial<Record<keyof ProductDraft, string>> & {
  variants?: string;
};

export interface ProductCategoryOptions {
  categories: string[];
  sub_categories: string[];
}

export interface ProductListParams {
  search?: string;
  page?: number;
  page_size?: number;
}

export interface ProductListResult {
  results: Product[];
  count: number;
  page: number;
  page_size: number;
  total_pages: number;
  has_next: boolean;
  has_previous: boolean;
}

/** Shape the API expects — empty strings become null, numbers become numbers. */
export interface ProductVariantPayload {
  id?: number;
  size: string | null;
  quantity_available: number | null;
  price: number | null;
  length_in_cm: number | null;
  width_in_cm: number | null;
  height_in_cm: number | null;
  diameter_in_cm: number | null;
  offer: string | null;
}

export interface ProductCreatePayload {
  product_name: string;
  category: string | null;
  sub_category: string | null;
  description: string | null;
  made_in: string | null;
  rating: number | null;
  is_hot_sale: boolean;
  care_instruction: string | null;
  usage_instruction: string | null;
  variants: ProductVariantPayload[];
}

export interface ProductUpdatePayload extends ProductCreatePayload {
  removed_image_ids: number[];
}
