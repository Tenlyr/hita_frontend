"use client";

import * as React from "react";

import type { Product, ProductVariant } from "@/types/product.types";

/**
 * Shared variant choice for a product page.
 *
 * The default resolves during render rather than in an effect, so there is no
 * frame where nothing is selected and no setState-in-effect.
 */
export function useVariantSelection(product: Product | null) {
  const [variantId, setVariantId] = React.useState<number | null>(null);

  const variants = product?.variants ?? [];

  // Prefer something buyable — landing on a sold-out size reads as broken.
  const fallback: ProductVariant | undefined =
    variants.find((variant) => (variant.quantity_available ?? 0) > 0) ??
    variants[0];

  const selected =
    variants.find((variant) => variant.id === variantId) ?? fallback ?? null;

  return { selected, selectVariant: setVariantId };
}
