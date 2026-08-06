"use client";

import { ImageOff } from "lucide-react";
import Image from "next/image";
import * as React from "react";

import { catalogService } from "@/services/catalog.service";
import type { CatalogCategory } from "@/types/catalog.types";

function CategorySkeleton() {
  return (
    <div className="flex w-16 shrink-0 flex-col items-center gap-1.5 sm:w-20">
      <div className="size-14 animate-pulse rounded-full bg-muted sm:size-16" />
      <div className="h-2.5 w-12 animate-pulse rounded bg-muted" />
    </div>
  );
}

export function CategoryRail() {
  const [categories, setCategories] = React.useState<CatalogCategory[]>([]);
  const [isLoading, setIsLoading] = React.useState(true);

  React.useEffect(() => {
    let cancelled = false;

    async function load() {
      try {
        const result = await catalogService.categories();
        if (!cancelled) setCategories(result);
      } catch {
        // Storefront decoration — a failed fetch just hides the rail.
        if (!cancelled) setCategories([]);
      } finally {
        if (!cancelled) setIsLoading(false);
      }
    }

    void load();
    return () => {
      cancelled = true;
    };
  }, []);

  if (!isLoading && categories.length === 0) return null;

  return (
    <section aria-label="Shop by category" className="w-full">
      {/* Padding tracks the site header's container so the first circle lines
          up with the logo. No scroll snapping: `snap-mandatory` pins the first
          item to the snapport edge, which eats that left padding. */}
      {/* No bottom padding: the hover underline sits flush with the section's
          lower edge instead of floating above a gap. */}
      <div className="no-scrollbar overflow-x-auto scroll-smooth px-4 pt-4 sm:px-6">
        {/* w-max + mx-auto centres a short list, but leaves the first item
            reachable once it overflows — justify-center would clip it. */}
        <div className="mx-auto flex w-max gap-3 sm:gap-4">
          {isLoading
          ? Array.from({ length: 8 }).map((_, index) => (
              <CategorySkeleton key={index} />
            ))
          : categories.map((category) => (
              <a
                key={category.name}
                href={`#category-${encodeURIComponent(category.name)}`}
                className="group/tile flex w-16 shrink-0 flex-col items-center gap-1.5 text-center sm:w-20"
              >
                <span className="relative size-14 overflow-hidden rounded-full border border-border bg-muted transition-transform duration-200 hover:scale-105 sm:size-16">
                  {category.image ? (
                    <Image
                      src={category.image}
                      alt=""
                      fill
                      unoptimized
                      sizes="96px"
                      className="object-cover"
                    />
                  ) : (
                    <span className="flex h-full items-center justify-center text-muted-foreground">
                      <ImageOff className="size-6" />
                    </span>
                  )}
                </span>
                <span className="text-xs leading-tight font-medium text-secondary">
                  {category.name}
                </span>

                {/* Underline grows from the centre on hover. mt-auto pins it
                    to the bottom so tiles with two-line labels still align. */}
                <span
                  aria-hidden
                  className="mt-auto h-0.5 w-full scale-x-0 bg-sidebar transition-transform duration-200 ease-out group-hover/tile:scale-x-100"
                />
              </a>
              ))}
        </div>
      </div>
    </section>
  );
}
