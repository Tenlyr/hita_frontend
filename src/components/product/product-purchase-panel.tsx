"use client";

import type { Product, ProductVariant } from "@/types/product.types";
import * as React from "react";
import { toast } from "sonner";

import { QuantityStepper } from "@/components/product/quantity-stepper";
import { StarRating } from "@/components/product/star-rating";
import { VariantChips } from "@/components/product/variant-chips";
import { BrandIcon, type BrandNetwork } from "@/components/ui/brand-icon";
import { SweepButton } from "@/components/ui/sweep-button";
import { useCart } from "@/hooks/use-cart";
import { formatPrice, stockOf } from "@/lib/product";
import { cn } from "@/lib/utils";

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
  const { add } = useCart();

  const stock = stockOf(selected);
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
    void add(product, selected, quantity);
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
        {/* The offered price leads; the listed one is struck through beside
            it, so the reduction is visible on the variant it applies to. */}
        <div className="flex flex-wrap items-baseline gap-x-3 gap-y-1">
          <p className="text-2xl font-medium text-primary">
            {formatPrice(selected?.offer_price ?? selected?.price ?? null)}
          </p>
          {selected?.offer_price ? (
            <p className="text-lg text-muted-foreground line-through">
              {formatPrice(selected.price)}
            </p>
          ) : null}
          {selected?.offer ? (
            <span className="bg-primary/10 px-2 py-1 text-xs font-bold text-primary">
              {selected.offer}
            </span>
          ) : null}
        </div>
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
          <VariantChips
            variants={product.variants}
            selectedId={selected?.id ?? null}
            onSelect={selectVariant}
          />
        </div>
      ) : null}

      {/* Stepper and Add to Cart share a row: on mobile the button takes the
          remaining width instead of sitting narrow and off-centre. */}
      <div className="flex items-center gap-3">
        <QuantityStepper
          value={quantity}
          max={maxQuantity}
          onChange={setQuantity}
          disabled={stock === 0}
        />

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
