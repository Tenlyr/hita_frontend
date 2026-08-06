"use client";

import Image from "next/image";
import * as React from "react";

import { ProductCard } from "@/components/product/product-card";
import { SweepButton } from "@/components/ui/sweep-button";
import { APP_ROUTES } from "@/constants/routes";
import { REVEAL_ITEM, useGsapReveal } from "@/hooks/use-gsap-reveal";
import { catalogService } from "@/services/catalog.service";
import type { Product } from "@/types/product.types";

const LIMIT = 8;
const ALL_PRODUCTS_LABEL = "All Products";

function CardSkeleton() {
  return (
    <div className="flex flex-col">
      <div className="aspect-square animate-pulse bg-muted" />
      <div className="space-y-2 pt-3">
        <div className="h-4 w-20 animate-pulse rounded bg-muted" />
        <div className="h-3 w-32 animate-pulse rounded bg-muted" />
      </div>
    </div>
  );
}

export function NewProducts() {
  const [products, setProducts] = React.useState<Product[]>([]);
  const [isLoading, setIsLoading] = React.useState(true);
  const gridRef = useGsapReveal<HTMLDivElement>({
    enabled: !isLoading && products.length > 0,
    stagger: 0.08,
  });

  React.useEffect(() => {
    let cancelled = false;

    async function load() {
      try {
        const result = await catalogService.products({
          page_size: LIMIT,
          sort: "latest",
        });
        if (!cancelled) setProducts(result.results);
      } catch {
        if (!cancelled) setProducts([]);
      } finally {
        if (!cancelled) setIsLoading(false);
      }
    }

    void load();
    return () => {
      cancelled = true;
    };
  }, []);

  if (!isLoading && products.length === 0) return null;

  return (
    <section className="mx-auto w-full max-w-7xl px-4 py-14 sm:px-6 sm:py-20">
      <header className="mx-auto flex max-w-xl flex-col items-center gap-4 text-center sm:gap-5">
        <Image
          src="/icons/ic_product.svg"
          alt=""
          width={73}
          height={63}
          className="h-14 w-auto sm:h-20"
        />
        <h2 className="text-2xl font-black text-secondary sm:text-3xl">
          New Products
        </h2>
        <p className="text-sm text-muted-foreground sm:text-base">
          Be the first to experience our latest arrivals. Stay ahead of the
          curve and discover what&apos;s new in style and design.
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

      <div className="mt-16 flex justify-center">
        <SweepButton
          label={ALL_PRODUCTS_LABEL}
          href={APP_ROUTES.SHOP.PRODUCTS}
          color="secondary"
          variant="bordered"
        />
      </div>
    </section>
  );
}
