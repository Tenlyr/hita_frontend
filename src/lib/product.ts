import type { ProductVariant } from "@/types/product.types";

/** Rupee display for a decimal string off the API. Never used for maths. */
export function formatPrice(value: string | null | undefined): string {
  if (!value) return "—";
  const amount = Number(value);
  if (Number.isNaN(amount)) return "—";
  return `₹${amount.toLocaleString("en-IN", { minimumFractionDigits: 2 })}`;
}

/**
 * A variant with no stock recorded counts as out of stock — the same rule the
 * cart API applies, so a half-filled admin form can't oversell.
 */
export function stockOf(
  variant: Pick<ProductVariant, "quantity_available"> | null | undefined,
): number {
  return variant?.quantity_available ?? 0;
}

/** First variant that can actually be bought, for a sensible default. */
export function firstAvailableVariant(
  variants: ProductVariant[],
): ProductVariant | null {
  return variants.find((variant) => stockOf(variant) > 0) ?? variants[0] ?? null;
}
