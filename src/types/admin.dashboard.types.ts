/** Console home. One request draws the whole screen. */

export interface DashboardTotals {
  sales: number;
  units: number;
  revenue: string;
  average_order: string;
  products: number;
  awaiting_fulfilment: number;
  unread_messages: number;
}

export interface MonthlyPoint {
  /** "2026-08" — stable key for sorting, unlike the label. */
  month: string;
  label: string;
  revenue: string;
  orders: number;
}

export interface StatusCount {
  status: string;
  count: number;
}

export interface TopProduct {
  product_id: number | null;
  name: string;
  units: number;
  revenue: string;
}

export interface RecentTransaction {
  id: number;
  product_name: string;
  order_number: string;
  amount: string;
  created_at: string | null;
}

export interface ActivityEntry {
  id: number;
  order_number: string;
  customer: string;
  status: string;
  payment_status: string;
  total: string;
  created_at: string | null;
}

export interface LowStockEntry {
  variant_id: number;
  product_id: number | null;
  name: string;
  size: string;
  quantity: number;
}

export interface DashboardSummary {
  totals: DashboardTotals;
  monthly: MonthlyPoint[];
  by_status: StatusCount[];
  top_products: TopProduct[];
  recent_transactions: RecentTransaction[];
  activity: ActivityEntry[];
  low_stock: LowStockEntry[];
}
