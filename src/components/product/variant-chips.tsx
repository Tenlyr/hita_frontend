"use client";

import { stockOf } from "@/lib/product";
import { cn } from "@/lib/utils";
import type { ProductVariant } from "@/types/product.types";

interface VariantChipsProps {
  variants: ProductVariant[];
  selectedId: number | null;
  onSelect: (variant: ProductVariant) => void;
  className?: string;
}

/** Size chips, shared by the detail panel and the card's variant picker. */
export function VariantChips({
  variants,
  selectedId,
  onSelect,
  className,
}: VariantChipsProps) {
  return (
    <div className={cn("flex flex-wrap gap-2", className)}>
      {variants.map((variant) => {
        const isSelected = variant.id === selectedId;
        const isSoldOut = stockOf(variant) === 0;
        return (
          <button
            key={variant.id}
            type="button"
            onClick={() => onSelect(variant)}
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
  );
}
