/**
 * The same arithmetic the server does, for the form's live totals.
 *
 * Deliberately mirrors invoice/calculations.py — the panel has to agree with
 * the PDF, and waiting for a round trip to show a subtotal while someone
 * types is worse than duplicating six lines.
 */

import type { DiscountType } from "@/types/admin.invoice.types";

function round2(value: number): number {
  return Math.round((value + Number.EPSILON) * 100) / 100;
}

export interface DraftItem {
  unit_price: number;
  quantity: number;
}

export function lineFigures(
  unitPrice: number,
  quantity: number,
  gstPercent: number,
) {
  const unit = Number(unitPrice) || 0;
  const gst = Number(gstPercent) || 0;

  // Prices are quoted GST-inclusive, so the ex-GST price is backed out.
  const normal = round2(unit / (1 + gst / 100));
  const tax = round2(normal * (gst / 2 / 100));

  return {
    normalPrice: normal,
    cgst: tax,
    sgst: tax,
    lineTotal: round2(unit * (Number(quantity) || 0)),
  };
}

/**
 * A percentage of the total, or a flat amount off it — capped at the total
 * either way, so a discount larger than the invoice cannot print a negative
 * sub total.
 */
export function discountFigure(
  total: number,
  discountType: DiscountType,
  value: number,
): number {
  const amount = Number(value) || 0;
  if (amount <= 0) return 0;
  const figure = discountType === "flat" ? amount : (total * amount) / 100;
  return round2(Math.min(figure, total));
}

export function invoiceTotals(
  items: DraftItem[],
  gstPercent: number,
  discountType: DiscountType,
  discountValue: number,
) {
  const total = round2(
    items.reduce(
      (sum, item) =>
        sum + lineFigures(item.unit_price, item.quantity, gstPercent).lineTotal,
      0,
    ),
  );
  const discount = discountFigure(total, discountType, discountValue);

  return { total, discount, subTotal: round2(total - discount) };
}
