"use client";

import type { Product } from "@/types/product.types";
import { Heart, ImageOff, ShoppingCart } from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import * as React from "react";

import { StarRating } from "@/components/product/star-rating";
import { VariantPickerDialog } from "@/components/product/variant-picker-dialog";
import { LineUnderline } from "@/components/ui/line-underline";
import { firstAvailableVariant } from "@/lib/product";
import { cn } from "@/lib/utils";
import { useCart } from "@/hooks/use-cart";
import { useWishlist } from "@/hooks/use-wishlist";

function rupees(value: number): string {
  return `₹ ${value.toLocaleString("en-IN", { minimumFractionDigits: 2 })}`;
}

/**
 * Cheapest variant — the "from" price shoppers expect to see.
 *
 * Compared on what is actually payable, so a discounted variant can become
 * the cheapest. The listed price rides along to be struck through.
 */
function lowestPrice(product: Product): {
  price: string | null;
  wasPrice: string | null;
} {
  let best: { payable: number; listed: number } | null = null;

  for (const variant of product.variants) {
    const listed = Number(variant.price);
    if (Number.isNaN(listed) || listed <= 0) continue;
    const offered = Number(variant.offer_price);
    const payable =
      variant.offer_price && !Number.isNaN(offered) ? offered : listed;
    if (!best || payable < best.payable) best = { payable, listed };
  }

  if (!best) return { price: null, wasPrice: null };
  return {
    price: rupees(best.payable),
    wasPrice: best.payable !== best.listed ? rupees(best.listed) : null,
  };
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
  const { price, wasPrice } = lowestPrice(product);

  const { isWishlisted: isSaved, toggle } = useWishlist();
  const { add } = useCart();
  const [pickerOpen, setPickerOpen] = React.useState(false);

  // `isWishlisted` lets a parent drive the heart; otherwise the shared
  // wishlist store does, so every heart for a product stays in step.
  const wishlisted = isWishlisted ?? isSaved(product.id);

  function toggleWishlist() {
    if (onWishlist) {
      onWishlist(product, !wishlisted);
      return;
    }
    void toggle(product.id, product.product_name);
  }

  /**
   * One variant is unambiguous, so add it straight away. Two or more and the
   * card has no way to know which size, price or stock the shopper meant —
   * that needs the picker.
   */
  function handleAddToCart() {
    if (onAddToCart) {
      onAddToCart(product);
      return;
    }
    if (product.variants.length > 1) {
      setPickerOpen(true);
      return;
    }
    const variant = firstAvailableVariant(product.variants);
    if (!variant) return;
    void add(product, variant);
  }

  return (
    <article className={cn("group/card flex flex-col", className)}>
      <div className="relative aspect-square overflow-hidden bg-muted">
        <Link
          href={href ?? `/products/${product.id}`}
          // `relative`: the image below uses `fill`, which positions itself
          // against its parent — a static parent makes Next.js warn.
          className="relative block size-full"
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

        {/* A hover affordance, so it never appears on a touch screen. Small
            screens get their own button down in the price row instead, where
            it does not cover the photo. */}
        <button
          type="button"
          onClick={handleAddToCart}
          className="absolute inset-x-0 bottom-0 z-10 hidden cursor-pointer items-center justify-center gap-2 bg-sidebar py-3 text-sm font-medium text-sidebar-foreground transition-transform duration-300 ease-out md:flex md:translate-y-full md:group-hover/card:translate-y-0"
        >
          <ShoppingCart className="size-4" />
          Add to Cart
        </button>
      </div>

      <div className="flex flex-1 flex-col gap-3 pt-4">
        <div className="flex items-center gap-3">
          {price ? (
            <p className="flex flex-wrap items-baseline gap-x-2">
              <span className="text-lg font-medium text-secondary sm:text-xl">
                {price}
              </span>
              {wasPrice ? (
                <span className="text-sm text-muted-foreground line-through">
                  {wasPrice}
                </span>
              ) : null}
            </p>
          ) : null}

          {/* `ml-auto` rather than `justify-between`, so it still sits right
              on a product with no price to show. */}
          <button
            type="button"
            onClick={handleAddToCart}
            aria-label={`Add ${product.product_name} to cart`}
            className="ml-auto shrink-0 cursor-pointer rounded-full bg-sidebar p-2 text-sidebar-foreground transition-transform hover:scale-110 md:hidden"
          >
            <ShoppingCart className="size-3.5" />
          </button>
        </div>

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

      <VariantPickerDialog
        product={product}
        open={pickerOpen}
        onOpenChange={setPickerOpen}
        onConfirm={(variant, quantity) => void add(product, variant, quantity)}
      />
    </article>
  );
}
