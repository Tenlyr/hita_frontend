/** Customer cart — lines key on a variant, since price and stock live there. */

export interface CartLine {
  variant_id: number;
  product_id: number;
  product_name: string | null;
  image: string | null;
  size: string | null;
  offer: string | null;
  /** Set only when an offer moved the price, so the UI knows when to strike
      the old one through. */
  original_price: string | null;
  /** Decimal string, straight from the server. Never do maths on this. */
  price: string;
  quantity: number;
  line_total: string;
  quantity_available: number;
}

export type CartSkipReason = "unavailable" | "out_of_stock";

/** A line the server refused to keep — deleted variant, or nothing in stock. */
export interface CartSkippedLine {
  variant_id: number;
  product_name?: string | null;
  reason: CartSkipReason;
}

export interface CartResult {
  items: CartLine[];
  /** Total units, not total lines — this is the header badge. */
  count: number;
  subtotal: string;
  skipped: CartSkippedLine[];
}

/** What the guest cart sends up: ids and quantities, nothing trusted. */
export interface CartMergeLine {
  variant_id: number;
  quantity: number;
}
