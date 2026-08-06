import api from "@/lib/axios";
import type { ApiResponse } from "@/types/api.types";
import type {
  AddressInput,
  AddressListResult,
} from "@/types/customer.address.types";

/**
 * Every mutation returns the full list, so the client never has to reconcile
 * which address became the default after a save or a delete.
 */
export const addressService = {
  async list(): Promise<AddressListResult> {
    const { data } =
      await api.get<ApiResponse<AddressListResult>>("/addresses");
    return data.data;
  },

  async create(payload: AddressInput): Promise<AddressListResult> {
    const { data } = await api.post<ApiResponse<AddressListResult>>(
      "/addresses",
      payload,
    );
    return data.data;
  },

  async update(id: number, payload: AddressInput): Promise<AddressListResult> {
    const { data } = await api.put<ApiResponse<AddressListResult>>(
      `/addresses/${id}`,
      payload,
    );
    return data.data;
  },

  async setDefault(id: number): Promise<AddressListResult> {
    const { data } = await api.post<ApiResponse<AddressListResult>>(
      `/addresses/${id}/default`,
    );
    return data.data;
  },

  async remove(id: number): Promise<AddressListResult> {
    const { data } = await api.delete<ApiResponse<AddressListResult>>(
      `/addresses/${id}`,
    );
    return data.data;
  },
};
