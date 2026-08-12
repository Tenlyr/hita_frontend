import api from "@/lib/axios";
import type { DashboardSummary } from "@/types/admin.dashboard.types";
import type { ApiResponse } from "@/types/api.types";

export const dashboardService = {
  /** GET /admin/dashboard/summary — everything the console home draws. */
  async summary(): Promise<DashboardSummary> {
    const { data } = await api.get<ApiResponse<DashboardSummary>>(
      "/admin/dashboard/summary",
    );
    return data.data;
  },
};
