/** Admin console offers. */

export type OfferType = "percent" | "flat";

/** What the offer is attached to. Narrowest match wins at checkout. */
export type OfferTarget = "product" | "variant" | "category";

export interface Offer {
  id: number;
  title: string;
  discount_type: OfferType;
  discount_value: string;
  /** The storefront badge, e.g. "15% OFF". */
  label: string;
  target_type: OfferTarget;
  product_id: number | null;
  variant_id: number | null;
  category: string;
  /** Readable name of whatever it is attached to. */
  target_label: string;
  is_active: boolean;
  created_at: string | null;
}

export interface OfferInput {
  title: string;
  discount_type: OfferType;
  discount_value: number;
  target_type: OfferTarget;
  product_id: number | null;
  variant_id: number | null;
  category: string;
  is_active: boolean;
}

export interface OfferListResult {
  results: Offer[];
  count: number;
  page: number;
  page_size: number;
  total_pages: number;
  has_next: boolean;
  has_previous: boolean;
  /** Across every page, not just this one. */
  active_count: number;
}

export interface OfferQuery {
  search?: string;
  status?: "" | "active" | "inactive";
  page?: number;
  page_size?: number;
}
