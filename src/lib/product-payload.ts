import type {
  ProductCreatePayload,
  ProductDraft,
  ProductVariantDraft,
  ProductVariantPayload,
} from "@/types/product.types";

/** Blank inputs must go to the API as null, not "" — the columns are nullable. */
function text(value: string): string | null {
  const trimmed = value.trim();
  return trimmed === "" ? null : trimmed;
}

function numeric(value: string): number | null {
  const trimmed = value.trim();
  if (trimmed === "") return null;
  const parsed = Number(trimmed);
  return Number.isNaN(parsed) ? null : parsed;
}

function toVariantPayload(variant: ProductVariantDraft): ProductVariantPayload {
  return {
    size: text(variant.size),
    quantity_available: numeric(variant.quantity_available),
    price: numeric(variant.price),
    length_in_cm: numeric(variant.length_in_cm),
    width_in_cm: numeric(variant.width_in_cm),
    height_in_cm: numeric(variant.height_in_cm),
    diameter_in_cm: numeric(variant.diameter_in_cm),
    offer: text(variant.offer),
  };
}

export function toProductPayload(draft: ProductDraft): ProductCreatePayload {
  return {
    product_name: draft.product_name.trim(),
    category: text(draft.category),
    sub_category: text(draft.sub_category),
    description: text(draft.description),
    made_in: text(draft.made_in),
    rating: numeric(draft.rating),
    is_hot_sale: draft.is_hot_sale,
    care_instruction: text(draft.care_instruction),
    usage_instruction: text(draft.usage_instruction),
    // Rows the user never filled in would create empty variants server-side.
    variants: draft.variants
      .filter((variant) => variant.size.trim() || variant.price.trim())
      .map(toVariantPayload),
  };
}
