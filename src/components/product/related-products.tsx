"use client";

import * as React from "react";

import { ProductCard } from "@/components/product/product-card";
import { REVEAL_ITEM, useGsapReveal } from "@/hooks/use-gsap-reveal";
import { catalogService } from "@/services/catalog.service";
import type { Product } from "@/types/product.types";

const LIMIT = 4;

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

export function RelatedProducts({ productId }: { productId: number }) {
  const [products, setProducts] = React.useState<Product[]>([]);
  const [isLoading, setIsLoading] = React.useState(true);
  const gridRef = useGsapReveal<HTMLDivElement>({
    enabled: !isLoading && products.length > 0,
    stagger: 0.09,
  });

  React.useEffect(() => {
    let cancelled = false;

    async function load() {
      setIsLoading(true);
      try {
        const result = await catalogService.related(productId, LIMIT);
        if (!cancelled) setProducts(result);
      } catch {
        // Supplementary content — hide the section rather than show an error.
        if (!cancelled) setProducts([]);
      } finally {
        if (!cancelled) setIsLoading(false);
      }
    }

    void load();
    return () => {
      cancelled = true;
    };
  }, [productId]);

  if (!isLoading && products.length === 0) return null;

  return (
    <section className="border-t border-border pt-14">
      <header className="mx-auto max-w-xl text-center">
        <h2 className="text-2xl font-black text-secondary sm:text-3xl">
          Related Products
        </h2>
        <p className="mt-2 text-sm text-muted-foreground sm:text-base">
          Explore complementary options that enhance your experience. Discover
          related products curated just for you.
        </p>
      </header>

      <div
        ref={gridRef}
        className="mt-10 grid grid-cols-2 gap-x-6 gap-y-10 lg:grid-cols-4"
      >
        {isLoading
          ? Array.from({ length: LIMIT }).map((_, index) => (
              <CardSkeleton key={index} />
            ))
          : products.map((product) => (
              <ProductCard
                key={product.id}
                product={product}
                className={REVEAL_ITEM}
              />
            ))}
      </div>
    </section>
  );
}
