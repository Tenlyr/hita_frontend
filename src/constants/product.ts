import type { ProductVariantDraft } from "@/types/admin.product.types";

export const ADD_PRODUCT_PAGE = {
  title: "Add Product",
  description: "Create a new listing for the Hitadecor catalogue.",
} as const;

export const PRODUCT_SECTIONS = {
  details: {
    title: "Product Details",
    description: "Name, categorisation and where the piece is made.",
  },
  content: {
    title: "Description & Instructions",
    description: "Copy shown on the product page for shoppers.",
  },
  media: {
    title: "Product Images",
    description: "The first image is used as the catalogue thumbnail.",
  },
  variants: {
    title: "Variants",
    description:
      "Price and stock live on the variant. Every product needs at least one.",
  },
} as const;

/** Column labels for the variant editor, in display order. */
export const VARIANT_FIELDS = [
  { name: "size", label: "Size", type: "text", placeholder: "Large" },
  {
    name: "quantity_available",
    label: "Quantity",
    type: "number",
    placeholder: "10",
  },
  { name: "price", label: "Price (₹)", type: "number", placeholder: "2499.00" },
  {
    name: "length_in_cm",
    label: "Length (cm)",
    type: "number",
    placeholder: "20",
  },
  {
    name: "width_in_cm",
    label: "Width (cm)",
    type: "number",
    placeholder: "15",
  },
  {
    name: "height_in_cm",
    label: "Height (cm)",
    type: "number",
    placeholder: "30",
  },
  {
    name: "diameter_in_cm",
    label: "Diameter (cm)",
    type: "number",
    placeholder: "12.5",
  },
] as const satisfies ReadonlyArray<{
  name: keyof Omit<ProductVariantDraft, "key">;
  label: string;
  type: "text" | "number";
  placeholder: string;
}>;

/**
 * `key` must be passed for the row that exists during the first render —
 * a generated id would differ between the server HTML and the client and
 * break hydration. Rows added later are client-only, so the default is safe.
 */
export function emptyVariant(
  key: string = crypto.randomUUID(),
): ProductVariantDraft {
  return {
    key,
    size: "",
    quantity_available: "",
    price: "",
    length_in_cm: "",
    width_in_cm: "",
    height_in_cm: "",
    diameter_in_cm: "",
  };
}
