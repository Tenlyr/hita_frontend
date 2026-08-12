/** Admin console coupons. */

export type CouponType = "percent" | "flat";

export interface Coupon {
  id: number;
  code: string;
  discount_type: CouponType;
  discount_value: string;
  min_order_amount: string;
  /** Ready-made summary, e.g. "10% off". */
  label: string;
  is_active: boolean;
  created_at: string | null;
}

export interface CouponInput {
  code: string;
  discount_type: CouponType;
  discount_value: number;
  min_order_amount: number;
  is_active: boolean;
}

export interface CouponListResult {
  results: Coupon[];
  count: number;
  page: number;
  page_size: number;
  total_pages: number;
  has_next: boolean;
  has_previous: boolean;
  active_count: number;
}

export interface CouponQuery {
  search?: string;
  status?: "" | "active" | "inactive";
  page?: number;
  page_size?: number;
}

/** What the checkout gets back when a shopper's code is accepted. */
export interface AppliedCoupon {
  code: string;
  label: string;
  discount: string;
  subtotal: string;
  total: string;
}
