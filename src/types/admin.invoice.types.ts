/** Admin console invoice builder. */

export interface InvoiceItem {
  id?: number;
  description: string;
  sub_note: string;
  unit_price: string;
  quantity: number;
  /** Computed server-side and echoed back. */
  normal_price: string;
  cgst: string;
  sgst: string;
  line_total: string;
}

/** A discount is read as a rate off the total, or a flat rupee amount. */
export type DiscountType = "percent" | "flat";

export interface Invoice {
  id: number;
  invoice_number: string;
  invoice_date: string;
  to_name: string;
  to_address: string;
  to_gstin: string;
  ship_name: string;
  ship_address: string;
  gst_percent: string;
  discount_type: DiscountType;
  discount_value: string;
  notes: string[];
  closing_note: string;
  footer_note: string;
  items: InvoiceItem[];
  item_count: number;
  total: string;
  discount: string;
  sub_total: string;
  cgst_total: string;
  sgst_total: string;
  created_at: string | null;
}

/** What the form sends. Prices are GST-inclusive, as quoted. */
export interface InvoiceItemInput {
  description: string;
  sub_note: string;
  unit_price: number;
  quantity: number;
}

export interface InvoiceInput {
  invoice_date: string;
  to_name: string;
  to_address: string;
  to_gstin: string;
  ship_name: string;
  ship_address: string;
  gst_percent: number;
  discount_type: DiscountType;
  discount_value: number;
  notes: string[];
  closing_note: string;
  footer_note: string;
  items: InvoiceItemInput[];
}

export interface InvoiceListResult {
  results: Invoice[];
  count: number;
  page: number;
  page_size: number;
  total_pages: number;
  has_next: boolean;
  has_previous: boolean;
}

export interface InvoiceQuery {
  search?: string;
  date_from?: string;
  date_to?: string;
  page?: number;
  page_size?: number;
}
