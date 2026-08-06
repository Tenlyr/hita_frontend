"use client";

import { Minus, Plus } from "lucide-react";
import * as React from "react";
import { toast } from "sonner";

import { StarRating } from "@/components/product/star-rating";
import { SweepButton } from "@/components/ui/sweep-button";
import { cn } from "@/lib/utils";
import type { Product, ProductVariant } from "@/types/product.types";

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

const SHARE_ICONS = {
  facebook: (
    <path d="M14 9h-2.5v-1.6c0-.6.4-.8.7-.8H14V4.2L12 4.2c-2.3 0-2.8 1.7-2.8 2.8V9H8v2.6h1.2V20h2.9v-8.4H14L14 9z" />
  ),
  instagram: (
    <path d="M12 7.4a4.6 4.6 0 1 0 0 9.2 4.6 4.6 0 0 0 0-9.2Zm0 7.6a3 3 0 1 1 0-6 3 3 0 0 1 0 6Zm5.8-7.8a1.07 1.07 0 1 1-2.14 0 1.07 1.07 0 0 1 2.14 0ZM20.8 8.5c-.07-1.4-.39-2.65-1.42-3.68-1.03-1.03-2.27-1.35-3.68-1.42-1.45-.08-5.8-.08-7.25 0-1.4.07-2.64.39-3.67 1.42C3.75 5.85 3.43 7.09 3.36 8.5c-.08 1.45-.08 5.8 0 7.25.07 1.4.39 2.65 1.42 3.68 1.03 1.03 2.27 1.35 3.67 1.42 1.45.08 5.8.08 7.25 0 1.41-.07 2.65-.39 3.68-1.42 1.03-1.03 1.35-2.27 1.42-3.68.08-1.45.08-5.79 0-7.24Zm-1.9 8.8a3.04 3.04 0 0 1-1.71 1.71c-1.18.47-4 .36-5.3.36s-4.12.1-5.3-.36a3.04 3.04 0 0 1-1.71-1.71c-.47-1.18-.36-4-.36-5.3s-.1-4.12.36-5.3A3.04 3.04 0 0 1 6.7 4.99c1.18-.47 4-.36 5.3-.36s4.12-.1 5.3.36a3.04 3.04 0 0 1 1.71 1.71c.47 1.18.36 4 .36 5.3s.11 4.12-.36 5.3Z" />
  ),
  whatsapp: (
    <path d="M17.5 14.4c-.3-.15-1.75-.86-2.02-.96-.27-.1-.47-.15-.67.15-.2.3-.77.96-.94 1.16-.17.2-.35.22-.65.07-.3-.15-1.25-.46-2.39-1.47-.88-.79-1.48-1.76-1.65-2.06-.17-.3-.02-.46.13-.61.13-.13.3-.35.45-.52.15-.17.2-.3.3-.5.1-.2.05-.37-.02-.52-.07-.15-.67-1.61-.92-2.2-.24-.58-.48-.5-.67-.51h-.57c-.2 0-.52.07-.79.37-.27.3-1.04 1.01-1.04 2.47s1.06 2.86 1.21 3.06c.15.2 2.1 3.2 5.08 4.49.71.3 1.26.49 1.69.63.71.22 1.36.19 1.87.12.57-.09 1.75-.72 2-1.41.25-.7.25-1.29.17-1.41-.07-.13-.27-.2-.57-.35ZM12.05 21.5h-.01a9.4 9.4 0 0 1-4.79-1.31l-.34-.2-3.56.93.95-3.47-.22-.36a9.38 9.38 0 0 1-1.44-5.01c0-5.18 4.22-9.4 9.42-9.4a9.36 9.36 0 0 1 9.4 9.41c0 5.18-4.22 9.4-9.41 9.4Zm8-17.4A11.32 11.32 0 0 0 12.05.8C5.82.8.77 5.85.77 12.06c0 1.99.52 3.93 1.51 5.64L.68 23.2l5.63-1.48a11.3 11.3 0 0 0 5.74 1.47h.01c6.23 0 11.28-5.05 11.28-11.26a11.2 11.2 0 0 0-3.3-7.96Z" />
  ),
} as const;

function ShareButton({
  network,
  href,
}: {
  network: keyof typeof SHARE_ICONS;
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
      <svg viewBox="0 0 24 24" fill="currentColor" className="size-5">
        {SHARE_ICONS[network]}
      </svg>
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
    typeof window === "undefined" ? "" : encodeURIComponent(window.location.href);

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
