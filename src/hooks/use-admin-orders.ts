"use client";

import * as React from "react";
import { toast } from "sonner";

import { getApiErrorMessage } from "@/lib/api-error";
import { adminOrderService } from "@/services/order.service";
import type {
  AdminOrder,
  AdminOrderListResult,
  OrderStats,
} from "@/types/admin.order.types";

const PAGE_SIZE = 20;
const SEARCH_DEBOUNCE_MS = 300;

const EMPTY_STATS: OrderStats = {
  total: 0,
  by_status: {},
  awaiting_fulfilment: 0,
  paid_revenue: "0",
};

const EMPTY: AdminOrderListResult = {
  results: [],
  count: 0,
  page: 1,
  page_size: PAGE_SIZE,
  total_pages: 1,
  has_next: false,
  has_previous: false,
  stats: EMPTY_STATS,
};

export function useAdminOrders() {
  const [data, setData] = React.useState<AdminOrderListResult>(EMPTY);
  const [isLoading, setIsLoading] = React.useState(true);
  const [error, setError] = React.useState<string | null>(null);

  const [search, setSearch] = React.useState("");
  const [status, setStatus] = React.useState("");
  const [paymentStatus, setPaymentStatus] = React.useState("");
  const [dateFrom, setDateFrom] = React.useState("");
  const [dateTo, setDateTo] = React.useState("");
  const [pageSize, setPageSize] = React.useState<number>(PAGE_SIZE);
  const [page, setPage] = React.useState(1);
  const [revision, setRevision] = React.useState(0);

  React.useEffect(() => {
    let cancelled = false;

    const timer = window.setTimeout(async () => {
      setIsLoading(true);
      try {
        const result = await adminOrderService.list({
          search: search.trim(),
          status,
          payment_status: paymentStatus,
          date_from: dateFrom,
          date_to: dateTo,
          page,
          page_size: pageSize,
        });
        if (!cancelled) {
          setData(result);
          setError(null);
        }
      } catch (err) {
        if (!cancelled) {
          setError(getApiErrorMessage(err, "Could not load orders."));
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
  }, [
    search,
    status,
    paymentStatus,
    dateFrom,
    dateTo,
    pageSize,
    page,
    revision,
  ]);

  const refresh = React.useCallback(
    () => setRevision((current) => current + 1),
    [],
  );

  const setOrderStatus = React.useCallback(
    async (order: AdminOrder, next: string) => {
      const previous = order.status;
      // Paint the row straight away; the select should not feel like a form.
      setData((current) => ({
        ...current,
        results: current.results.map((row) =>
          row.id === order.id ? { ...row, status: next as never } : row,
        ),
      }));

      try {
        await adminOrderService.setStatus(order.id, next);
        toast.success(`${order.order_number} marked ${next}.`);
        // The status counts in the header are now stale.
        refresh();
      } catch (err) {
        setData((current) => ({
          ...current,
          results: current.results.map((row) =>
            row.id === order.id ? { ...row, status: previous } : row,
          ),
        }));
        toast.error(getApiErrorMessage(err, "Could not update that order."));
      }
    },
    [refresh],
  );

  /** Filters change what page 1 means, so reset when they move. */
  const changeFilter = React.useCallback(
    (setter: (value: string) => void) => (value: string) => {
      setter(value);
      setPage(1);
    },
    [],
  );

  const setRange = React.useCallback((from: string, to: string) => {
    setDateFrom(from);
    setDateTo(to);
    setPage(1);
  }, []);

  const changePageSize = React.useCallback((size: number) => {
    setPageSize(size);
    setPage(1);
  }, []);

  return {
    orders: data.results,
    stats: data.stats,
    count: data.count,
    page: data.page,
    totalPages: data.total_pages,
    hasNext: data.has_next,
    hasPrevious: data.has_previous,
    isLoading,
    error,
    search,
    setSearch: changeFilter(setSearch),
    status,
    setStatus: changeFilter(setStatus),
    paymentStatus,
    setPaymentStatus: changeFilter(setPaymentStatus),
    dateFrom,
    dateTo,
    setRange,
    pageSize,
    setPageSize: changePageSize,
    setPage,
    setOrderStatus,
    refresh,
  };
}
