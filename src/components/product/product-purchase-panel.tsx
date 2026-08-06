"use client";

import type { Product, ProductVariant } from "@/types/product.types";
import { Minus, Plus } from "lucide-react";
import * as React from "react";
import { toast } from "sonner";

import { StarRating } from "@/components/product/star-rating";
import { BrandIcon, type BrandNetwork } from "@/components/ui/brand-icon";
import { SweepButton } from "@/components/ui/sweep-button";
import { cn } from "@/lib/utils";

function formatPrice(value: string | null): string {
  if (!value) return "—";
  const amount = Number(value);
  if (Number.isNaN(amount)) return "—";
  return `₹${amount.toLocaleString("en-IN", { minimumFractionDigits: 2 })}`;
}

function stockOf(variant: ProductVariant | undefined): number {
  return variant?.quantity_available ?? 0;
}

function Row({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex flex-wrap items-center gap-x-10 gap-y-3">
      {children}
    </div>
  );
}

function Fact({ label, value }: { label: string; value: React.ReactNode }) {
  return (
    <p className="text-base font-bold text-secondary">
      {label}: <span className="font-medium text-primary">{value}</span>
    </p>
  );
}

function ShareButton({
  network,
  href,
}: {
  network: BrandNetwork;
  href: string;
}) {
  return (
    <a
      href={href}
      target="_blank"
      rel="noopener noreferrer"
      aria-label={`Share on ${network}`}
      className="text-secondary transition-colors hover:text-primary"
    >
      <BrandIcon network={network} />
    </a>
  );
}

interface ProductPurchasePanelProps {
  product: Product;
  /** Lifted so the specs table can follow the same choice. */
  selected: ProductVariant | null;
  onSelectVariant: (variantId: number) => void;
}

export function ProductPurchasePanel({
  product,
  selected,
  onSelectVariant,
}: ProductPurchasePanelProps) {
  const [quantity, setQuantity] = React.useState(1);

  const stock = stockOf(selected ?? undefined);
  const maxQuantity = Math.max(1, stock);

  function selectVariant(variant: ProductVariant) {
    onSelectVariant(variant.id);
    // A new variant has its own stock ceiling, so restart the counter.
    setQuantity(1);
  }

  function handleAddToCart() {
    if (!selected) {
      toast.error("Please choose a size first.");
      return;
    }
    if (stock === 0) {
      toast.error("This size is out of stock.");
      return;
    }
    // TODO: push to the cart once cart state exists.
    toast.success(`${product.product_name} added to cart`, {
      description: `${selected.size ?? "Default"} · Qty ${quantity}`,
    });
  }

  const shareUrl =
    typeof window === "undefined"
      ? ""
      : encodeURIComponent(window.location.href);

  return (
    <div className="flex flex-col gap-6">
      <div className="space-y-3">
        <h1 className="text-3xl font-black text-secondary sm:text-4xl">
          {product.product_name ?? "Untitled product"}
        </h1>
        <StarRating value={product.rating} />
        <p className="text-2xl font-medium text-primary">
          {formatPrice(selected?.price ?? null)}
        </p>
      </div>

      {/* Size sits above the cart controls on purpose: price, stock and the
          quantity ceiling all follow the chosen variant, so it has to be
          picked before adding. */}
      {product.variants.length > 0 ? (
        <div className="space-y-2 border-t border-border pt-6">
          <p className="text-base font-bold text-secondary">
            Size:{" "}
            <span className="font-medium text-primary">
              {selected?.size ?? "Default"}
            </span>
          </p>
          <div className="flex flex-wrap gap-2">
            {product.variants.map((variant) => {
              const isSelected = variant.id === selected?.id;
              const isSoldOut = stockOf(variant) === 0;
              return (
                <button
                  key={variant.id}
                  type="button"
                  onClick={() => selectVariant(variant)}
                  disabled={isSoldOut}
                  aria-pressed={isSelected}
                  className={cn(
                    "min-w-12 cursor-pointer border px-4 py-2 text-sm font-medium transition-colors",
                    isSelected
                      ? "border-primary bg-primary text-white"
                      : "border-border text-secondary hover:border-primary",
                    isSoldOut &&
                      "cursor-not-allowed text-muted-foreground line-through opacity-50 hover:border-border",
                  )}
                >
                  {variant.size ?? "Default"}
                </button>
              );
            })}
          </div>
        </div>
      ) : null}

      {/* Stepper and Add to Cart share a row: on mobile the button takes the
          remaining width instead of sitting narrow and off-centre. */}
      <div className="flex items-center gap-3">
        <div className="flex shrink-0 items-center">
          <button
            type="button"
            onClick={() => setQuantity((q) => Math.max(1, q - 1))}
            disabled={quantity <= 1}
            aria-label="Decrease quantity"
            className="flex size-11 cursor-pointer items-center justify-center bg-muted text-secondary transition-colors hover:bg-muted/70 disabled:cursor-not-allowed disabled:opacity-40"
          >
            <Minus className="size-4" />
          </button>
          <span
            aria-live="polite"
            className="w-12 text-center text-base font-medium text-secondary"
          >
            {quantity}
          </span>
          <button
            type="button"
            onClick={() => setQuantity((q) => Math.min(maxQuantity, q + 1))}
            disabled={quantity >= maxQuantity}
            aria-label="Increase quantity"
            className="flex size-11 cursor-pointer items-center justify-center bg-muted text-secondary transition-colors hover:bg-muted/70 disabled:cursor-not-allowed disabled:opacity-40"
          >
            <Plus className="size-4" />
          </button>
        </div>

        <SweepButton
          label={stock === 0 ? "Out of Stock" : "Add to Cart"}
          color="secondary"
          variant="filled"
          onClick={handleAddToCart}
          className={cn(
            "flex-1 sm:flex-none",
            stock === 0 && "pointer-events-none opacity-50",
          )}
        />
      </div>

      <div className="space-y-4 border-t border-border pt-6">
        <Row>
          {product.category ? (
            <Fact label="Category" value={product.category} />
          ) : null}
          {product.sub_category ? (
            <Fact label="Sub Category" value={product.sub_category} />
          ) : null}
        </Row>
        <Row>
          {product.made_in ? (
            <Fact label="Origin" value={product.made_in} />
          ) : null}
          <Fact
            label="Available Quantity"
            value={stock > 0 ? stock : "Out of stock"}
          />
        </Row>
      </div>

      <div className="flex items-center gap-5 border-t border-border pt-6">
        <span className="text-base font-bold text-secondary">Share :</span>
        <ShareButton
          network="facebook"
          href={`https://www.facebook.com/sharer/sharer.php?u=${shareUrl}`}
        />
        <ShareButton network="instagram" href="https://www.instagram.com/" />
        <ShareButton
          network="whatsapp"
          href={`https://wa.me/?text=${shareUrl}`}
        />
      </div>
    </div>
  );
}
