import api from "@/lib/axios";
import type {
  AdminOrder,
  AdminOrderListResult,
  AdminOrderQuery,
} from "@/types/admin.order.types";
import type { ApiResponse } from "@/types/api.types";
import type {
  CreateOrderResult,
  Order,
  VerifyPaymentInput,
} from "@/types/customer.order.types";

export const orderService = {
  /** POST /orders — snapshots the cart and opens a Razorpay order. */
  async create(addressId: number): Promise<CreateOrderResult> {
    const { data } = await api.post<ApiResponse<CreateOrderResult>>("/orders", {
      address_id: addressId,
    });
    return data.data;
  },

  /** POST /orders/{id}/verify — the server checks the signature, not us. */
  async verify(orderId: number, payload: VerifyPaymentInput): Promise<Order> {
    const { data } = await api.post<ApiResponse<Order>>(
      `/orders/${orderId}/verify`,
      payload,
    );
    return data.data;
  },

  async markFailed(orderId: number, reason: string): Promise<Order> {
    const { data } = await api.post<ApiResponse<Order>>(
      `/orders/${orderId}/failed`,
      { reason },
    );
    return data.data;
  },

  async list(): Promise<{ results: Order[]; count: number }> {
    const { data } =
      await api.get<ApiResponse<{ results: Order[]; count: number }>>(
        "/orders",
      );
    return data.data;
  },

  /**
   * GET /orders/{id}/invoice — a PDF blob.
   *
   * Fetched through axios rather than linked with an <a href>, because the
   * endpoint needs the Authorization header and a plain link cannot send one.
   */
  async invoice(orderId: number): Promise<Blob> {
    const { data } = await api.get<Blob>(`/orders/${orderId}/invoice`, {
      responseType: "blob",
    });
    return data;
  },

  async detail(orderId: number): Promise<Order> {
    const { data } = await api.get<ApiResponse<Order>>(`/orders/${orderId}`);
    return data.data;
  },
};

/** Console-side order management. Separate object so the storefront bundle
    never reaches for an admin endpoint by accident. */
export const adminOrderService = {
  async list(query: AdminOrderQuery = {}): Promise<AdminOrderListResult> {
    const { data } = await api.get<ApiResponse<AdminOrderListResult>>(
      "/admin/orders",
      { params: query },
    );
    return data.data;
  },

  async detail(orderId: number): Promise<AdminOrder> {
    const { data } = await api.get<ApiResponse<AdminOrder>>(
      `/admin/orders/${orderId}`,
    );
    return data.data;
  },

  async setStatus(orderId: number, status: string): Promise<AdminOrder> {
    const { data } = await api.patch<ApiResponse<AdminOrder>>(
      `/admin/orders/${orderId}/status`,
      { status },
    );
    return data.data;
  },

  async invoice(orderId: number): Promise<Blob> {
    const { data } = await api.get<Blob>(`/admin/orders/${orderId}/invoice`, {
      responseType: "blob",
    });
    return data;
  },
};
