/** Customer orders and the Razorpay handoff. */

export type OrderStatus =
  | "pending"
  | "confirmed"
  | "packed"
  | "shipped"
  | "delivered"
  | "cancelled"
  | "failed";
export type PaymentStatus = "created" | "paid" | "failed";

export interface OrderItem {
  id: number;
  variant_id: number | null;
  product_id: number | null;
  product_name: string;
  size: string;
  image: string | null;
  unit_price: string;
  /** Which offer discounted this line, snapshotted at checkout. */
  offer_title: string;
  offer_label: string;
  /** The listed price before that offer, or null when none applied. */
  original_price: string | null;
  quantity: number;
  line_total: string;
}

export interface OrderAddress {
  full_name: string;
  phone_number: string;
  address_line1: string;
  address_line2: string;
  city: string;
  state: string;
  postal_code: string;
}

export interface Order {
  id: number;
  order_number: string;
  status: OrderStatus;
  payment_status: PaymentStatus;
  subtotal: string;
  /** Coupon typed at checkout, and what it took off. */
  coupon_code: string;
  discount: string;
  /** What the offers took off, before any coupon. */
  offer_savings: string;
  shipping: string;
  total: string;
  address: OrderAddress;
  razorpay_order_id: string;
  razorpay_payment_id: string;
  items: OrderItem[];
  item_count: number;
  created_at: string | null;
  paid_at: string | null;
}

/** Everything Razorpay Checkout needs, built server-side. */
export interface RazorpayHandoff {
  key_id: string;
  order_id: string;
  /** Paise — Razorpay's own unit, passed straight through. */
  amount: number;
  currency: string;
  name: string;
  description: string;
  prefill: {
    name: string;
    email: string;
    contact: string;
  };
}

export interface CreateOrderResult {
  order: Order;
  razorpay: RazorpayHandoff;
}

export interface VerifyPaymentInput {
  razorpay_order_id: string;
  razorpay_payment_id: string;
  razorpay_signature: string;
}
