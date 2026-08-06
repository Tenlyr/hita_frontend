"use client";

import { Loader2, PackageSearch } from "lucide-react";
import * as React from "react";

import { CatalogFilters } from "@/components/product/catalog-filters";
import { ProductCard } from "@/components/product/product-card";
import { useCatalogProducts } from "@/hooks/use-catalog-products";
import { REVEAL_ITEM, useGsapReveal } from "@/hooks/use-gsap-reveal";
import { catalogService } from "@/services/catalog.service";
import type { CatalogCategory, CatalogQuery } from "@/types/catalog.types";

function CardSkeleton() {
  return (
    <div className="flex flex-col">
      <div className="aspect-square animate-pulse bg-muted" />
      <div className="space-y-2 pt-4">
        <div className="h-5 w-24 animate-pulse rounded bg-muted" />
        <div className="h-4 w-32 animate-pulse rounded bg-muted" />
      </div>
    </div>
  );
}

export function ProductGrid() {
  const [categories, setCategories] = React.useState<CatalogCategory[]>([]);
  const [filters, setFilters] = React.useState<CatalogQuery>({
    sort: "popular",
  });

  const {
    products,
    count,
    hasNext,
    isLoading,
    isLoadingMore,
    error,
    loadMore,
    pageSize,
  } = useCatalogProducts(filters);

  const sentinelRef = React.useRef<HTMLDivElement>(null);

  // Replays when the applied filters change, not when a page is appended.
  const gridRef = useGsapReveal<HTMLDivElement>({
    enabled: !isLoading && products.length > 0,
    replayKey: JSON.stringify(filters),
    stagger: 0.07,
  });

  React.useEffect(() => {
    let cancelled = false;

    async function loadCategories() {
      try {
        const result = await catalogService.categories();
        if (!cancelled) setCategories(result);
      } catch {
        // Filters degrade gracefully to "All Categories".
      }
    }

    void loadCategories();
    return () => {
      cancelled = true;
    };
  }, []);

  // Fetch the next page as the sentinel nears the viewport.
  React.useEffect(() => {
    const sentinel = sentinelRef.current;
    if (!sentinel || !hasNext) return;

    const observer = new IntersectionObserver(
      (entries) => {
        if (entries[0].isIntersecting) void loadMore();
      },
      { rootMargin: "400px" },
    );
    observer.observe(sentinel);

    return () => observer.disconnect();
  }, [hasNext, loadMore]);

  return (
    <section className="mx-auto w-full max-w-7xl px-4 py-12 sm:px-6 sm:py-16">
      <CatalogFilters
        categories={categories}
        applied={filters}
        onApply={setFilters}
      />

      {error ? (
        <p
          role="alert"
          className="mt-8 border border-destructive/30 bg-destructive/10 px-4 py-3 text-sm text-destructive"
        >
          {error}
        </p>
      ) : null}

      {!isLoading && products.length > 0 ? (
        <p className="mt-8 text-sm text-muted-foreground">
          Showing {products.length} of {count} product
          {count === 1 ? "" : "s"}
        </p>
      ) : null}

      {isLoading ? (
        <div className="mt-8 grid grid-cols-2 gap-x-6 gap-y-10 lg:grid-cols-4">
          {Array.from({ length: pageSize }).map((_, index) => (
            <CardSkeleton key={index} />
          ))}
        </div>
      ) : products.length === 0 ? (
        <div className="mt-8 flex flex-col items-center gap-2 border border-dashed border-border py-20 text-center">
          <PackageSearch className="size-8 text-muted-foreground" />
          <p className="font-bold text-secondary">No products found</p>
          <p className="text-sm text-muted-foreground">
            Try a different category or clear the filters.
          </p>
        </div>
      ) : (
        <>
          <div
            ref={gridRef}
            className="mt-4 grid grid-cols-2 gap-x-6 gap-y-10 lg:grid-cols-4"
          >
            {products.map((product) => (
              <ProductCard
                key={product.id}
                product={product}
                className={REVEAL_ITEM}
              />
            ))}
          </div>

          {/* Sits below the grid; crossing it triggers the next page. */}
          <div ref={sentinelRef} aria-hidden className="h-px" />

          {isLoadingMore ? (
            <div className="mt-10 flex items-center justify-center gap-2 text-sm text-muted-foreground">
              <Loader2 className="size-4 animate-spin" />
              Loading more…
            </div>
          ) : null}

          {!hasNext ? (
            <p className="mt-10 text-center text-sm text-muted-foreground">
              You&apos;ve reached the end.
            </p>
          ) : null}
        </>
      )}
    </section>
  );
}
