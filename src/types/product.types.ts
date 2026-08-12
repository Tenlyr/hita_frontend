/** Product entities as the API returns them — shared by admin and storefront. */

export interface ProductVariant {
  id: number;
  size: string | null;
  quantity_available: number | null;
  price: string | null;
  length_in_cm: string | null;
  width_in_cm: string | null;
  height_in_cm: string | null;
  diameter_in_cm: string | null;
  /** Derived from active offers, e.g. "15% OFF" — not stored on the variant. */
  offer: string | null;
  /** The price after that offer, or null when none applies. */
  offer_price: string | null;
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
