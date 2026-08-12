/**
 * What a new invoice starts with.
 *
 * These are the standing texts from the Hitadecor invoice — the same wording
 * on every consignment, with the product, quantity and date swapped per order.
 * They are seeded into the form as real, editable content rather than shown as
 * placeholders: a placeholder would look right on screen and then print an
 * empty notes block.
 *
 * Only ever applied to a new invoice. A saved one keeps exactly what was
 * saved, so clearing a note stays cleared.
 */

export const DEFAULT_INVOICE_NOTES = [
  "MATERIAL: MANGO WOOD WITH RESIN INLAY AND METAL ACCENTS. A STUNNING MANGO WOOD TRAY WITH AN ELEGANT GOLDEN HUMMINGBIRD RESIN INLAY AND LUXURIOUS METAL LEAF ACCENTS. PERFECT AS A SERVING TRAY OR DECOR PIECE",
  'WE ARE PLEASED TO CONFIRM THE ACCEPTANCE OF YOUR VALUED ORDER FOR 7 PIECES OF OUR SIGNATURE PRODUCT - THE "GOLDEN PETAL TRAY" FROM HITA HOME DECOR',
  "EACH TRAY WILL BE BUBBLE-WRAPPED IN A WHITE CARTON BOX WITH SAFE PACKAGING TO ENSURE DAMAGE-FREE DELIVERY.",
  "THE CONSIGNMENT WILL BE DELIVERED TO THE ADDRESS OR BEFORE THE SCHEDULED DATE (5 TH AUGUST) THROUGH OUR COURIER PARTNER.",
];

export const DEFAULT_INVOICE_CLOSING_NOTE =
  '"WE SINCERELY THANK YOU FOR CHOOSING HITA TO BE PART OF YOUR SPECIAL EVENT. PLEASE FEEL FREE TO REACH OUT FOR ANY FURTHER ASSISTANCE OR CUSTOMIZATION"';

export const DEFAULT_INVOICE_FOOTER_NOTE =
  "Bank details and invoice will be shared separately for your convenience.";
