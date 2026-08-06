"use client";

import { ImageOff } from "lucide-react";
import Image from "next/image";
import * as React from "react";

import { QuantityStepper } from "@/components/product/quantity-stepper";
import { VariantChips } from "@/components/product/variant-chips";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { SweepButton } from "@/components/ui/sweep-button";
import { josefinSans } from "@/lib/fonts";
import { firstAvailableVariant, formatPrice, stockOf } from "@/lib/product";
import { cn } from "@/lib/utils";
import type { Product, ProductVariant } from "@/types/product.types";

interface VariantPickerDialogProps {
  product: Product | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onConfirm: (variant: ProductVariant, quantity: number) => void;
}

/**
 * Shown when a product card's Add to Cart is pressed and the product has more
 * than one variant — the card can't know which size, price or stock applies.
 */
export function VariantPickerDialog({
  product,
  open,
  onOpenChange,
  onConfirm,
}: VariantPickerDialogProps) {
  const [selected, setSelected] = React.useState<ProductVariant | null>(null);
  const [quantity, setQuantity] = React.useState(1);

  // Remounting on the product resets the choice without an effect, so a
  // second product can never open showing the first one's size.
  const variants = product?.variants ?? [];
  const active = selected ?? firstAvailableVariant(variants);
  const stock = stockOf(active);
  const image = product?.images[0]?.product_image;

  function choose(variant: ProductVariant) {
    setSelected(variant);
    // A new variant has its own ceiling, so restart the counter.
    setQuantity(1);
  }

  function handleOpenChange(next: boolean) {
    if (!next) {
      setSelected(null);
      setQuantity(1);
    }
    onOpenChange(next);
  }

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogContent
        // Portalled into <body>, so the storefront typeface is set here.
        className={cn(
          josefinSans.variable,
          "font-sans rounded-none sm:max-w-md",
        )}
      >
        <DialogHeader>
          <DialogTitle className="text-xl font-black text-secondary">
            Choose an option
          </DialogTitle>
          <DialogDescription>
            This piece comes in more than one size — pick one to add it.
          </DialogDescription>
        </DialogHeader>

        {product ? (
          <>
            <div className="flex gap-4">
              <div className="relative size-20 shrink-0 overflow-hidden bg-muted">
                {image ? (
                  <Image
                    src={image}
                    alt={product.product_name ?? "Product"}
                    fill
                    unoptimized
                    sizes="80px"
                    className="object-cover"
                  />
                ) : (
                  <span className="flex size-full items-center justify-center text-muted-foreground">
                    <ImageOff className="size-5" />
                  </span>
                )}
              </div>
              <div className="min-w-0 space-y-1">
                <p className="truncate text-base text-secondary">
                  {product.product_name ?? "Untitled product"}
                </p>
                <p className="text-lg font-medium text-primary">
                  {formatPrice(active?.price)}
                </p>
                <p className="text-xs text-muted-foreground">
                  {stock > 0 ? `${stock} in stock` : "Out of stock"}
                </p>
              </div>
            </div>

            <div className="space-y-2">
              <p className="text-sm font-bold text-secondary">
                Size:{" "}
                <span className="font-medium text-primary">
                  {active?.size ?? "Default"}
                </span>
              </p>
              <VariantChips
                variants={variants}
                selectedId={active?.id ?? null}
                onSelect={choose}
              />
            </div>

            <div className="flex items-center gap-3">
              <QuantityStepper
                value={quantity}
                max={Math.max(1, stock)}
                onChange={setQuantity}
                disabled={stock === 0}
              />
              <SweepButton
                label={stock === 0 ? "Out of Stock" : "Add to Cart"}
                color="sidebar"
                variant="filled"
                className={cn(
                  "flex-1",
                  stock === 0 && "pointer-events-none opacity-50",
                )}
                onClick={() => {
                  if (!active || stock === 0) return;
                  onConfirm(active, quantity);
                  handleOpenChange(false);
                }}
              />
            </div>
          </>
        ) : null}
      </DialogContent>
    </Dialog>
  );
}
