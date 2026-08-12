"use client";

import * as React from "react";
import { toast } from "sonner";

import { getApiErrorMessage } from "@/lib/api-error";
import { offerService } from "@/services/offer.service";
import type {
  Offer,
  OfferListResult,
  OfferQuery,
} from "@/types/admin.offer.types";

const PAGE_SIZE = 20;
const SEARCH_DEBOUNCE_MS = 300;

const EMPTY: OfferListResult = {
  results: [],
  count: 0,
  page: 1,
  page_size: PAGE_SIZE,
  total_pages: 1,
  has_next: false,
  has_previous: false,
  active_count: 0,
};

export function useOffers() {
  const [data, setData] = React.useState<OfferListResult>(EMPTY);
  const [isLoading, setIsLoading] = React.useState(true);
  const [error, setError] = React.useState<string | null>(null);

  const [search, setSearch] = React.useState("");
  const [status, setStatus] = React.useState<OfferQuery["status"]>("");
  const [page, setPage] = React.useState(1);
  const [revision, setRevision] = React.useState(0);
  const [busyId, setBusyId] = React.useState<number | null>(null);

  React.useEffect(() => {
    let cancelled = false;

    const timer = window.setTimeout(async () => {
      setIsLoading(true);
      try {
        const result = await offerService.list({
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
          setError(getApiErrorMessage(err, "Could not load offers."));
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
  async function toggle(offer: Offer) {
    const next = !offer.is_active;
    setBusyId(offer.id);
    setData((current) => ({
      ...current,
      results: current.results.map((row) =>
        row.id === offer.id ? { ...row, is_active: next } : row,
      ),
      active_count: current.active_count + (next ? 1 : -1),
    }));

    try {
      await offerService.setStatus(offer.id, next);
      // A status filter is showing a set this row may have just left.
      if (status) refresh();
    } catch (err) {
      setData((current) => ({
        ...current,
        results: current.results.map((row) =>
          row.id === offer.id ? { ...row, is_active: offer.is_active } : row,
        ),
        active_count: current.active_count + (next ? -1 : 1),
      }));
      toast.error(getApiErrorMessage(err, "Could not change that offer."));
    } finally {
      setBusyId(null);
    }
  }

  async function remove(offer: Offer) {
    setBusyId(offer.id);
    try {
      await offerService.remove(offer.id);
      toast.success(`${offer.title} was deleted.`);
      // Stepping back a page when the last row of the last page goes.
      if (data.results.length === 1 && page > 1) setPage((n) => n - 1);
      else refresh();
    } catch (err) {
      toast.error(getApiErrorMessage(err, "Could not delete that offer."));
    } finally {
      setBusyId(null);
    }
  }

  return {
    offers: data.results,
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
    setStatus: (value: OfferQuery["status"]) => {
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
