"use client";

import * as React from "react";

import { getApiErrorMessage } from "@/lib/api-error";
import { productService } from "@/services/product.service";
import type { ProductListResult } from "@/types/product.types";

const PAGE_SIZE = 12;
const SEARCH_DEBOUNCE_MS = 350;

export function useProducts() {
  const [search, setSearch] = React.useState("");
  const [page, setPage] = React.useState(1);
  const [data, setData] = React.useState<ProductListResult | null>(null);
  const [isLoading, setIsLoading] = React.useState(true);
  const [error, setError] = React.useState<string | null>(null);

  // Typing resets to page 1; without this you can end up on a page that no
  // longer exists for the narrowed result set.
  const [debouncedSearch, setDebouncedSearch] = React.useState("");
  React.useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedSearch(search);
      setPage(1);
    }, SEARCH_DEBOUNCE_MS);
    return () => clearTimeout(timer);
  }, [search]);

  React.useEffect(() => {
    let cancelled = false;

    async function load() {
      setIsLoading(true);
      setError(null);
      try {
        const result = await productService.list({
          search: debouncedSearch || undefined,
          page,
          page_size: PAGE_SIZE,
        });
        if (!cancelled) setData(result);
      } catch (err) {
        if (!cancelled) {
          setError(getApiErrorMessage(err, "Could not load products."));
          setData(null);
        }
      } finally {
        if (!cancelled) setIsLoading(false);
      }
    }

    void load();
    // Ignore a response that arrives after a newer request was issued.
    return () => {
      cancelled = true;
    };
  }, [debouncedSearch, page]);

  return {
    products: data?.results ?? [],
    count: data?.count ?? 0,
    page: data?.page ?? page,
    totalPages: data?.total_pages ?? 1,
    hasNext: data?.has_next ?? false,
    hasPrevious: data?.has_previous ?? false,
    isLoading,
    error,
    search,
    setSearch,
    setPage,
    pageSize: PAGE_SIZE,
  };
}
