/** Admin console order management. */

import type { Order, OrderStatus } from "@/types/customer.order.types";

export interface AdminOrder extends Order {
  /** Only on the detail endpoint. */
  customer?: {
    name: string | null;
    phone_number: string | null;
    email: string | null;
  };
}

export interface OrderStats {
  total: number;
  by_status: Partial<Record<OrderStatus, number>>;
  awaiting_fulfilment: number;
  paid_revenue: string;
}

export interface AdminOrderListResult {
  results: AdminOrder[];
  count: number;
  page: number;
  page_size: number;
  total_pages: number;
  has_next: boolean;
  has_previous: boolean;
  stats: OrderStats;
}

export interface AdminOrderQuery {
  search?: string;
  status?: string;
  payment_status?: string;
  /** YYYY-MM-DD, inclusive. */
  date_from?: string;
  date_to?: string;
  page?: number;
  page_size?: number;
}

export const PAGE_SIZES = [10, 20, 50, 100] as const;

/** Ranges people actually ask for, so the two date fields stay a fallback. */
export const DATE_PRESETS = [
  { value: "all", label: "All time", days: null },
  { value: "today", label: "Today", days: 0 },
  { value: "7d", label: "Last 7 days", days: 6 },
  { value: "30d", label: "Last 30 days", days: 29 },
  { value: "90d", label: "Last 90 days", days: 89 },
  { value: "custom", label: "Custom range", days: null },
] as const;

export type DatePreset = (typeof DATE_PRESETS)[number]["value"];

/** Local YYYY-MM-DD. `toISOString` would shift the day for anyone east of UTC. */
export function toDateInput(date: Date): string {
  const month = `${date.getMonth() + 1}`.padStart(2, "0");
  const day = `${date.getDate()}`.padStart(2, "0");
  return `${date.getFullYear()}-${month}-${day}`;
}

export function presetRange(days: number): { from: string; to: string } {
  const today = new Date();
  const from = new Date(today);
  from.setDate(from.getDate() - days);
  return { from: toDateInput(from), to: toDateInput(today) };
}

/** Pipeline order, used for the status select and the badge palette. */
export const ORDER_STATUSES: { value: OrderStatus; label: string }[] = [
  { value: "pending", label: "Pending payment" },
  { value: "confirmed", label: "Confirmed" },
  { value: "packed", label: "Packed" },
  { value: "shipped", label: "Shipped" },
  { value: "delivered", label: "Delivered" },
  { value: "cancelled", label: "Cancelled" },
  { value: "failed", label: "Failed" },
];
