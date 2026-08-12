"use client";

import * as React from "react";

import { getApiErrorMessage } from "@/lib/api-error";
import { dashboardService } from "@/services/dashboard.service";
import type { DashboardSummary } from "@/types/admin.dashboard.types";

export function useDashboard() {
  const [summary, setSummary] = React.useState<DashboardSummary | null>(null);
  const [isLoading, setIsLoading] = React.useState(true);
  const [error, setError] = React.useState<string | null>(null);

  React.useEffect(() => {
    let cancelled = false;

    async function load() {
      try {
        const result = await dashboardService.summary();
        if (!cancelled) {
          setSummary(result);
          setError(null);
        }
      } catch (err) {
        if (!cancelled) {
          setError(getApiErrorMessage(err, "Could not load the dashboard."));
        }
      } finally {
        if (!cancelled) setIsLoading(false);
      }
    }

    void load();
    return () => {
      cancelled = true;
    };
  }, []);

  return { summary, isLoading, error };
}
