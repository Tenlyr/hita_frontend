import api from "@/lib/axios";
import type {
  Offer,
  OfferInput,
  OfferListResult,
  OfferQuery,
} from "@/types/admin.offer.types";
import type { ApiResponse } from "@/types/api.types";

export const offerService = {
  async list(query: OfferQuery = {}): Promise<OfferListResult> {
    const { data } = await api.get<ApiResponse<OfferListResult>>(
      "/admin/offers",
      { params: query },
    );
    return data.data;
  },

  async create(payload: OfferInput): Promise<Offer> {
    const { data } = await api.post<ApiResponse<Offer>>(
      "/admin/offers",
      payload,
    );
    return data.data;
  },

  async update(id: number, payload: OfferInput): Promise<Offer> {
    const { data } = await api.put<ApiResponse<Offer>>(
      `/admin/offers/${id}`,
      payload,
    );
    return data.data;
  },

  /** Its own endpoint so a row toggle is one call, not a whole update. */
  async setStatus(id: number, isActive: boolean): Promise<Offer> {
    const { data } = await api.post<ApiResponse<Offer>>(
      `/admin/offers/${id}/status`,
      { is_active: isActive },
    );
    return data.data;
  },

  async remove(id: number): Promise<void> {
    await api.delete(`/admin/offers/${id}`);
  },
};
