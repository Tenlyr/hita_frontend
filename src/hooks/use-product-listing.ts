"use client";

import type { Product } from "@/types/product.types";
import type { ProductQuery } from "@/types/customer.product.types";
import * as React from "react";

import { getApiErrorMessage } from "@/lib/api-error";
import { productService } from "@/services/product.service";

const PAGE_SIZE = 12;

/**
 * Catalogue listing that appends pages as the sentinel scrolls into view.
 *
 * `filters` is the applied set — changing it resets to page 1 and replaces the
 * list rather than appending.
 */
export function useProductListing(filters: ProductQuery) {
  const [products, setProducts] = React.useState<Product[]>([]);
  const [count, setCount] = React.useState(0);
  const [page, setPage] = React.useState(1);
  const [hasNext, setHasNext] = React.useState(false);
  const [isLoading, setIsLoading] = React.useState(true);
  const [isLoadingMore, setIsLoadingMore] = React.useState(false);
  const [error, setError] = React.useState<string | null>(null);

  // Serialised so the effect compares by value, not object identity.
  const filterKey = JSON.stringify(filters);

  React.useEffect(() => {
    let cancelled = false;

    async function loadFirstPage() {
      setIsLoading(true);
      setError(null);
      try {
        const result = await productService.browse({
          ...(JSON.parse(filterKey) as ProductQuery),
          page: 1,
          page_size: PAGE_SIZE,
        });
        if (cancelled) return;
        setProducts(result.results);
        setCount(result.count);
        setPage(result.page);
        setHasNext(result.has_next);
      } catch (err) {
        if (cancelled) return;
        setError(getApiErrorMessage(err, "Could not load products."));
        setProducts([]);
        setHasNext(false);
      } finally {
        if (!cancelled) setIsLoading(false);
      }
    }

    void loadFirstPage();
    return () => {
      cancelled = true;
    };
  }, [filterKey]);

  const loadMore = React.useCallback(async () => {
    if (isLoading || isLoadingMore || !hasNext) return;

    setIsLoadingMore(true);
    try {
      const result = await productService.browse({
        ...(JSON.parse(filterKey) as ProductQuery),
        page: page + 1,
        page_size: PAGE_SIZE,
      });
      // Guard against duplicates if a page arrives twice.
      setProducts((current) => {
        const seen = new Set(current.map((product) => product.id));
        return [
          ...current,
          ...result.results.filter((product) => !seen.has(product.id)),
        ];
      });
      setPage(result.page);
      setHasNext(result.has_next);
    } catch (err) {
      setError(getApiErrorMessage(err, "Could not load more products."));
    } finally {
      setIsLoadingMore(false);
    }
  }, [filterKey, hasNext, isLoading, isLoadingMore, page]);

  return {
    products,
    count,
    hasNext,
    isLoading,
    isLoadingMore,
    error,
    loadMore,
    pageSize: PAGE_SIZE,
  };
}
