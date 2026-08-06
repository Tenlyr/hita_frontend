"use client";

import { ChevronLeft, ChevronRight, Eye, ImageOff, Pencil, Star } from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import * as React from "react";

import { APP_ROUTES } from "@/constants/routes";
import { cn } from "@/lib/utils";
import type { Product } from "@/types/product.types";

function formatPrice(value: string | null): string | null {
  if (!value) return null;
  const amount = Number(value);
  if (Number.isNaN(amount)) return null;
  return `₹${amount.toLocaleString("en-IN", { minimumFractionDigits: 2 })}`;
}

/** Cheapest variant price — that's the "from" price shoppers expect. */
function lowestPrice(product: Product): string | null {
  const prices = product.variants
    .map((variant) => Number(variant.price))
    .filter((price) => !Number.isNaN(price) && price > 0);
  if (prices.length === 0) return null;
  return formatPrice(String(Math.min(...prices)));
}

function totalStock(product: Product): number {
  return product.variants.reduce(
    (sum, variant) => sum + (variant.quantity_available ?? 0),
    0,
  );
}

export function ProductCard({ product }: { product: Product }) {
  const [index, setIndex] = React.useState(0);
  const images = product.images;
  const hasCarousel = images.length > 1;

  // Only ever show an offer that actually exists — no "None% off".
  const offer = product.variants.find((variant) => variant.offer)?.offer ?? null;
  const price = lowestPrice(product);
  const stock = totalStock(product);

  function step(direction: 1 | -1) {
    setIndex((current) => (current + direction + images.length) % images.length);
  }

  return (
    <article className="group flex flex-col border border-border bg-background transition-shadow hover:shadow-md">
      <div className="relative aspect-square overflow-hidden bg-muted">
        {images.length > 0 ? (
          <Image
            key={images[index].id}
            src={images[index].product_image}
            alt={product.product_name ?? "Product image"}
            fill
            unoptimized
            sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 25vw"
            className="object-cover"
          />
        ) : (
          <div className="flex h-full flex-col items-center justify-center gap-2 text-muted-foreground">
            <ImageOff className="size-8" />
            <span className="text-xs">No image</span>
          </div>
        )}

        {product.is_hot_sale ? (
          <span className="absolute top-2 left-2 z-10 bg-primary px-2 py-0.5 text-[10px] font-bold tracking-wide text-white">
            HOT SALE
          </span>
        ) : null}

        {/* Hover actions. focus-within keeps them reachable by keyboard. */}
        <div className="absolute inset-0 flex items-center justify-center gap-3 bg-secondary/45 opacity-0 transition-opacity group-hover:opacity-100 group-focus-within:opacity-100">
          <Link
            href={`${APP_ROUTES.APP.PRODUCTS}/${product.id}`}
            aria-label={`View ${product.product_name ?? "product"}`}
            title="View details"
            className="cursor-pointer rounded-full bg-background p-2.5 text-secondary shadow transition-colors hover:bg-primary hover:text-white"
          >
            <Eye className="size-4" />
          </Link>
          <Link
            href={`${APP_ROUTES.APP.PRODUCTS}/${product.id}/edit`}
            aria-label={`Edit ${product.product_name ?? "product"}`}
            title="Edit product"
            className="cursor-pointer rounded-full bg-background p-2.5 text-secondary shadow transition-colors hover:bg-primary hover:text-white"
          >
            <Pencil className="size-4" />
          </Link>
        </div>

        {hasCarousel ? (
          <>
            <button
              type="button"
              onClick={() => step(-1)}
              aria-label="Previous image"
              className="absolute top-1/2 left-2 -translate-y-1/2 cursor-pointer rounded-full bg-background/85 p-1.5 text-secondary opacity-0 shadow transition-opacity group-hover:opacity-100 focus-visible:opacity-100"
            >
              <ChevronLeft className="size-4" />
            </button>
            <button
              type="button"
              onClick={() => step(1)}
              aria-label="Next image"
              className="absolute top-1/2 right-2 -translate-y-1/2 cursor-pointer rounded-full bg-background/85 p-1.5 text-secondary opacity-0 shadow transition-opacity group-hover:opacity-100 focus-visible:opacity-100"
            >
              <ChevronRight className="size-4" />
            </button>

            <div className="absolute bottom-2 left-1/2 flex -translate-x-1/2 gap-1.5">
              {images.map((image, dot) => (
                <button
                  key={image.id}
                  type="button"
                  onClick={() => setIndex(dot)}
                  aria-label={`Show image ${dot + 1}`}
                  aria-current={dot === index}
                  className={cn(
                    "size-1.5 cursor-pointer rounded-full transition-colors",
                    dot === index ? "bg-primary" : "bg-background/70",
                  )}
                />
              ))}
            </div>
          </>
        ) : null}
      </div>

      <div className="flex flex-1 flex-col gap-1 p-4">
        <div className="flex items-start justify-between gap-2">
          <h3 className="line-clamp-1 font-bold text-secondary">
            {product.product_name ?? "Untitled product"}
          </h3>
          {product.rating ? (
            <span className="flex shrink-0 items-center gap-1 text-sm font-bold text-primary">
              {product.rating.toFixed(1)}
              <Star className="size-3.5 fill-primary" />
            </span>
          ) : null}
        </div>

        <p className="line-clamp-2 text-sm text-muted-foreground">
          {product.description ??
            [product.category, product.sub_category].filter(Boolean).join(" · ")}
        </p>

        <div className="mt-auto flex items-end justify-between gap-2 pt-3">
          <div>
            {price ? (
              <p className="text-lg font-black text-secondary">{price}</p>
            ) : (
              <p className="text-sm text-muted-foreground">Price not set</p>
            )}
            <p
              className={cn(
                "text-xs",
                stock > 0 ? "text-muted-foreground" : "text-destructive",
              )}
            >
              {stock > 0 ? `${stock} in stock` : "Out of stock"}
            </p>
          </div>

          {offer ? (
            <span className="shrink-0 bg-primary/10 px-2 py-1 text-xs font-bold whitespace-nowrap text-primary">
              {offer}
            </span>
          ) : null}
        </div>
      </div>
    </article>
  );
}
