"use client";

import { HeartOff } from "lucide-react";
import * as React from "react";

import { ProductCard } from "@/components/product/product-card";
import { SweepButton } from "@/components/ui/sweep-button";
import { APP_ROUTES } from "@/constants/routes";
import { wishlistService } from "@/services/wishlist.service";
import { useWishlistStore } from "@/store/wishlist.store";
import type { Product } from "@/types/product.types";

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

export function WishlistPanel() {
  const [products, setProducts] = React.useState<Product[]>([]);
  const [isLoading, setIsLoading] = React.useState(true);
  // Ids come from the shared store, so un-hearting a card drops it from here.
  const savedIds = useWishlistStore((state) => state.ids);
  const idsLoaded = useWishlistStore((state) => state.isLoaded);
  const loadIds = useWishlistStore((state) => state.load);

  // The cards fill the store themselves, but nothing renders until the ids
  // are in — so this panel has to prime it.
  React.useEffect(() => {
    if (!idsLoaded) void loadIds();
  }, [idsLoaded, loadIds]);

  React.useEffect(() => {
    let cancelled = false;

    async function load() {
      try {
        const result = await wishlistService.list();
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

  const visible = products.filter((product) => savedIds.includes(product.id));

  if (isLoading || !idsLoaded) {
    return (
      <div className="grid grid-cols-2 gap-x-6 gap-y-10 lg:grid-cols-3">
        {Array.from({ length: 3 }).map((_, index) => (
          <CardSkeleton key={index} />
        ))}
      </div>
    );
  }

  if (visible.length === 0) {
    return (
      <div className="flex flex-col items-center gap-4 py-16 text-center">
        <span className="flex size-16 items-center justify-center rounded-full bg-primary/10">
          <HeartOff className="size-7 text-primary" />
        </span>
        <p className="text-lg font-black text-secondary">
          Your wishlist is empty
        </p>
        <p className="max-w-sm leading-relaxed text-muted-foreground">
          Tap the heart on any product to save it here for later.
        </p>
        <SweepButton
          label="Browse Products"
          href={APP_ROUTES.SHOP.PRODUCTS}
          color="sidebar"
          variant="filled"
          className="mt-2"
        />
      </div>
    );
  }

  return (
    <>
      <p className="mb-6 text-sm text-muted-foreground">
        {visible.length} saved item{visible.length === 1 ? "" : "s"}
      </p>
      <div className="grid grid-cols-2 gap-x-6 gap-y-10 lg:grid-cols-3">
        {visible.map((product) => (
          <ProductCard key={product.id} product={product} />
        ))}
      </div>
    </>
  );
}
