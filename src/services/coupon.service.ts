import api from "@/lib/axios";
import type {
  AppliedCoupon,
  Coupon,
  CouponInput,
  CouponListResult,
  CouponQuery,
} from "@/types/admin.coupon.types";
import type { ApiResponse } from "@/types/api.types";

export const couponService = {
  async list(query: CouponQuery = {}): Promise<CouponListResult> {
    const { data } = await api.get<ApiResponse<CouponListResult>>(
      "/admin/coupons",
      { params: query },
    );
    return data.data;
  },

  async create(payload: CouponInput): Promise<Coupon> {
    const { data } = await api.post<ApiResponse<Coupon>>(
      "/admin/coupons",
      payload,
    );
    return data.data;
  },

  async update(id: number, payload: CouponInput): Promise<Coupon> {
    const { data } = await api.put<ApiResponse<Coupon>>(
      `/admin/coupons/${id}`,
      payload,
    );
    return data.data;
  },

  async setStatus(id: number, isActive: boolean): Promise<Coupon> {
    const { data } = await api.post<ApiResponse<Coupon>>(
      `/admin/coupons/${id}/status`,
      { is_active: isActive },
    );
    return data.data;
  },

  async remove(id: number): Promise<void> {
    await api.delete(`/admin/coupons/${id}`);
  },

  /**
   * Checkout preview. The order recomputes the discount server-side, so this
   * is only ever what the shopper is shown — never what they are charged.
   */
  async apply(code: string): Promise<AppliedCoupon> {
    const { data } = await api.post<ApiResponse<AppliedCoupon>>(
      "/coupons/apply",
      { code },
    );
    return data.data;
  },
};
