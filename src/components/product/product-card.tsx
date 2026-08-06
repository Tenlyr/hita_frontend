"use client";

import type { Product } from "@/types/product.types";
import { Heart, ImageOff, ShoppingCart } from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import * as React from "react";

import { StarRating } from "@/components/product/star-rating";
import { LineUnderline } from "@/components/ui/line-underline";
import { cn } from "@/lib/utils";
import { useAuthDialogStore } from "@/store/auth-dialog.store";

/** Cheapest variant price — the "from" price shoppers expect to see. */
function lowestPrice(product: Product): string | null {
  const prices = product.variants
    .map((variant) => Number(variant.price))
    .filter((price) => !Number.isNaN(price) && price > 0);
  if (prices.length === 0) return null;
  return `₹ ${Math.min(...prices).toLocaleString("en-IN", {
    minimumFractionDigits: 2,
  })}`;
}

interface ProductCardProps {
  product: Product;
  /** Where the card links to. Defaults to the storefront detail route. */
  href?: string;
  onWishlist?: (product: Product, next: boolean) => void;
  /** Controlled wishlist state. Omit to let the card track it itself. */
  isWishlisted?: boolean;
  onAddToCart?: (product: Product) => void;
  className?: string;
}

export function ProductCard({
  product,
  href,
  onWishlist,
  isWishlisted,
  onAddToCart,
  className,
}: ProductCardProps) {
  const image = product.images[0]?.product_image;
  const price = lowestPrice(product);

  // Uncontrolled until a parent owns wishlist state, so the heart still
  // responds before that exists.
  const [selfWishlisted, setSelfWishlisted] = React.useState(false);
  const wishlisted = isWishlisted ?? selfWishlisted;
  const openAuthDialog = useAuthDialogStore((state) => state.open);

  function toggleWishlist() {
    // Wishlisting needs an account: prompt for sign-in unless the parent has
    // taken over the behaviour.
    if (!onWishlist) {
      openAuthDialog();
      return;
    }
    const next = !wishlisted;
    if (isWishlisted === undefined) setSelfWishlisted(next);
    onWishlist(product, next);
  }

  return (
    <article className={cn("group/card flex flex-col", className)}>
      <div className="relative aspect-square overflow-hidden bg-muted">
        <Link
          href={href ?? `/products/${product.id}`}
          className="block size-full"
        >
          {image ? (
            <Image
              src={image}
              alt={product.product_name ?? "Product"}
              fill
              unoptimized
              sizes="(max-width: 640px) 50vw, (max-width: 1024px) 33vw, 25vw"
              // Zoom the photo, not the card, so the grid never reflows.
              className="object-cover transition-transform duration-500 ease-out group-hover/card:scale-110"
            />
          ) : (
            <span className="flex h-full flex-col items-center justify-center gap-2 text-muted-foreground">
              <ImageOff className="size-8" />
              <span className="text-xs">No image</span>
            </span>
          )}
        </Link>

        <button
          type="button"
          onClick={toggleWishlist}
          aria-label={
            wishlisted
              ? `Remove ${product.product_name} from wishlist`
              : `Add ${product.product_name} to wishlist`
          }
          aria-pressed={wishlisted}
          className="absolute top-3 right-3 z-10 cursor-pointer rounded-full bg-background p-2.5 shadow-md transition-transform hover:scale-110"
        >
          <Heart
            className={cn(
              "size-4 transition-colors",
              wishlisted
                ? "fill-destructive text-destructive"
                : "text-secondary",
            )}
          />
        </button>

        {/* Slides up on hover. Touch screens have no hover, so from md down
            it stays put and is always reachable. */}
        <button
          type="button"
          onClick={() => onAddToCart?.(product)}
          className="absolute inset-x-0 bottom-0 z-10 flex cursor-pointer items-center justify-center gap-2 bg-sidebar py-3 text-sm font-medium text-sidebar-foreground transition-transform duration-300 ease-out md:translate-y-full md:group-hover/card:translate-y-0"
        >
          <ShoppingCart className="size-4" />
          Add to Cart
        </button>
      </div>

      <div className="flex flex-1 flex-col gap-3 pt-4">
        {price ? (
          <p className="text-lg font-medium text-secondary sm:text-xl">
            {price}
          </p>
        ) : null}

        <Link
          href={href ?? `/products/${product.id}`}
          className="text-base text-secondary sm:text-lg"
        >
          <LineUnderline>
            {product.product_name ?? "Untitled product"}
          </LineUnderline>
        </Link>

        <StarRating value={product.rating} />
      </div>
    </article>
  );
}
