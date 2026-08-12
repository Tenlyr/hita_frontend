import api from "@/lib/axios";
import type {
  Invoice,
  InvoiceInput,
  InvoiceListResult,
  InvoiceQuery,
} from "@/types/admin.invoice.types";
import type { ApiResponse } from "@/types/api.types";

export const invoiceService = {
  async list(query: InvoiceQuery = {}): Promise<InvoiceListResult> {
    const { data } = await api.get<ApiResponse<InvoiceListResult>>(
      "/admin/invoices",
      { params: query },
    );
    return data.data;
  },

  async detail(id: number): Promise<Invoice> {
    const { data } = await api.get<ApiResponse<Invoice>>(
      `/admin/invoices/${id}`,
    );
    return data.data;
  },

  async create(payload: InvoiceInput): Promise<Invoice> {
    const { data } = await api.post<ApiResponse<Invoice>>(
      "/admin/invoices",
      payload,
    );
    return data.data;
  },

  async update(id: number, payload: InvoiceInput): Promise<Invoice> {
    const { data } = await api.put<ApiResponse<Invoice>>(
      `/admin/invoices/${id}`,
      payload,
    );
    return data.data;
  },

  async remove(id: number): Promise<void> {
    await api.delete(`/admin/invoices/${id}`);
  },

  /**
   * The same PDF for an unsaved draft, so the builder can show the real
   * document while you type. Nothing is persisted.
   */
  async preview(
    payload: InvoiceInput,
    number = "",
    signal?: AbortSignal,
  ): Promise<Blob> {
    const { data } = await api.post<Blob>("/admin/invoices/preview", payload, {
      params: number ? { number } : undefined,
      responseType: "blob",
      signal,
    });
    return data;
  },

  /** Fetched through axios: the endpoint needs the auth header, which a
      plain <a href> cannot send. */
  async pdf(id: number): Promise<Blob> {
    const { data } = await api.get<Blob>(`/admin/invoices/${id}/pdf`, {
      responseType: "blob",
    });
    return data;
  },
};
