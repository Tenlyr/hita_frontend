"use client";

import * as React from "react";
import { toast } from "sonner";

import { getApiErrorMessage } from "@/lib/api-error";
import { saveBlob } from "@/lib/download";
import { invoiceService } from "@/services/invoice.service";
import type { Invoice, InvoiceListResult } from "@/types/admin.invoice.types";

const PAGE_SIZE = 20;
const SEARCH_DEBOUNCE_MS = 300;

const EMPTY: InvoiceListResult = {
  results: [],
  count: 0,
  page: 1,
  page_size: PAGE_SIZE,
  total_pages: 1,
  has_next: false,
  has_previous: false,
};

export function useInvoices() {
  const [data, setData] = React.useState<InvoiceListResult>(EMPTY);
  const [isLoading, setIsLoading] = React.useState(true);
  const [error, setError] = React.useState<string | null>(null);

  const [search, setSearch] = React.useState("");
  const [dateFrom, setDateFrom] = React.useState("");
  const [dateTo, setDateTo] = React.useState("");
  const [pageSize, setPageSize] = React.useState<number>(PAGE_SIZE);
  const [page, setPage] = React.useState(1);
  const [revision, setRevision] = React.useState(0);
  const [downloadingId, setDownloadingId] = React.useState<number | null>(null);

  React.useEffect(() => {
    let cancelled = false;

    const timer = window.setTimeout(async () => {
      setIsLoading(true);
      try {
        const result = await invoiceService.list({
          search: search.trim(),
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
          setError(getApiErrorMessage(err, "Could not load invoices."));
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
  }, [search, dateFrom, dateTo, pageSize, page, revision]);

  const refresh = React.useCallback(
    () => setRevision((current) => current + 1),
    [],
  );

  const download = React.useCallback(async (invoice: Invoice) => {
    setDownloadingId(invoice.id);
    try {
      const blob = await invoiceService.pdf(invoice.id);
      saveBlob(blob, `${invoice.invoice_number}.pdf`);
    } catch (err) {
      toast.error(getApiErrorMessage(err, "Could not download the invoice."));
    } finally {
      setDownloadingId(null);
    }
  }, []);

  const remove = React.useCallback(
    async (invoice: Invoice) => {
      try {
        await invoiceService.remove(invoice.id);
        toast.success(`${invoice.invoice_number} deleted.`);
        refresh();
        return true;
      } catch (err) {
        toast.error(getApiErrorMessage(err, "Could not delete that invoice."));
        return false;
      }
    },
    [refresh],
  );

  /** Filters change what page 1 means, so reset when they move. */
  const changeSearch = React.useCallback((value: string) => {
    setSearch(value);
    setPage(1);
  }, []);

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
    invoices: data.results,
    count: data.count,
    page: data.page,
    totalPages: data.total_pages,
    hasNext: data.has_next,
    hasPrevious: data.has_previous,
    isLoading,
    error,
    search,
    setSearch: changeSearch,
    dateFrom,
    dateTo,
    setRange,
    pageSize,
    setPageSize: changePageSize,
    setPage,
    downloadingId,
    download,
    remove,
    refresh,
  };
}
