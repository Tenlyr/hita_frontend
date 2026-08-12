"use client";

import * as React from "react";
import { toast } from "sonner";

import { getApiErrorMessage } from "@/lib/api-error";
import { couponService } from "@/services/coupon.service";
import type {
  Coupon,
  CouponListResult,
  CouponQuery,
} from "@/types/admin.coupon.types";

const PAGE_SIZE = 20;
const SEARCH_DEBOUNCE_MS = 300;

const EMPTY: CouponListResult = {
  results: [],
  count: 0,
  page: 1,
  page_size: PAGE_SIZE,
  total_pages: 1,
  has_next: false,
  has_previous: false,
  active_count: 0,
};

export function useCoupons() {
  const [data, setData] = React.useState<CouponListResult>(EMPTY);
  const [isLoading, setIsLoading] = React.useState(true);
  const [error, setError] = React.useState<string | null>(null);

  const [search, setSearch] = React.useState("");
  const [status, setStatus] = React.useState<CouponQuery["status"]>("");
  const [page, setPage] = React.useState(1);
  const [revision, setRevision] = React.useState(0);
  const [busyId, setBusyId] = React.useState<number | null>(null);

  React.useEffect(() => {
    let cancelled = false;

    const timer = window.setTimeout(async () => {
      setIsLoading(true);
      try {
        const result = await couponService.list({
          search: search.trim(),
          status,
          page,
          page_size: PAGE_SIZE,
        });
        if (!cancelled) {
          setData(result);
          setError(null);
        }
      } catch (err) {
        if (!cancelled) {
          setError(getApiErrorMessage(err, "Could not load coupons."));
          setData(EMPTY);
        }
      } finally {
        if (!cancelled) setIsLoading(false);
      }
    }, SEARCH_DEBOUNCE_MS);

    return () => {
      cancelled = true;
      window.clearTimeout(timer);
    };
  }, [search, status, page, revision]);

  const refresh = React.useCallback(() => setRevision((n) => n + 1), []);

  /** Optimistic: the switch has to answer the click, not the round trip. */
  async function toggle(coupon: Coupon) {
    const next = !coupon.is_active;
    setBusyId(coupon.id);
    setData((current) => ({
      ...current,
      results: current.results.map((row) =>
        row.id === coupon.id ? { ...row, is_active: next } : row,
      ),
      active_count: current.active_count + (next ? 1 : -1),
    }));

    try {
      await couponService.setStatus(coupon.id, next);
      // A status filter is showing a set this row may have just left.
      if (status) refresh();
    } catch (err) {
      setData((current) => ({
        ...current,
        results: current.results.map((row) =>
          row.id === coupon.id ? { ...row, is_active: coupon.is_active } : row,
        ),
        active_count: current.active_count + (next ? -1 : 1),
      }));
      toast.error(getApiErrorMessage(err, "Could not change that coupon."));
    } finally {
      setBusyId(null);
    }
  }

  async function remove(coupon: Coupon) {
    setBusyId(coupon.id);
    try {
      await couponService.remove(coupon.id);
      toast.success(`${coupon.code} was deleted.`);
      // Stepping back a page when the last row of the last page goes.
      if (data.results.length === 1 && page > 1) setPage((n) => n - 1);
      else refresh();
    } catch (err) {
      toast.error(getApiErrorMessage(err, "Could not delete that coupon."));
    } finally {
      setBusyId(null);
    }
  }

  return {
    coupons: data.results,
    count: data.count,
    activeCount: data.active_count,
    page: data.page,
    totalPages: data.total_pages,
    hasNext: data.has_next,
    hasPrevious: data.has_previous,
    pageSize: data.page_size,
    isLoading,
    error,
    search,
    setSearch: (value: string) => {
      setSearch(value);
      setPage(1);
    },
    status,
    setStatus: (value: CouponQuery["status"]) => {
      setStatus(value);
      setPage(1);
    },
    setPage,
    busyId,
    toggle,
    remove,
    refresh,
  };
}
