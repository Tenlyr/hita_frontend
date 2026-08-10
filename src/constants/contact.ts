/** Business contact details, shown on the contact page and in the map embed. */
export const CONTACT_DETAILS = {
  addressLines: [
    "7, Chinnammal Street,",
    "Saibaba colony, K K Pudur,",
    "Coimbatore - 641038.",
  ],
  email: "info@hitadecor.com",
  phones: ["+91 9778417711", "+91 8110949392"],
} as const;

/** Resolved from the shared Google Maps link. */
export const MAP_PLACE = "HITA - International collections of pottery ware";
export const MAP_COORDS = { lat: 11.0271197, lng: 76.9416899 };
export const MAP_ZOOM = 17;

/**
 * Keyless Google Maps embed.
 *
 * `q` is the place name so the panel with the business card shows, while `ll`
 * pins the centre to the exact coordinates rather than trusting the search.
 */
export const MAP_EMBED_SRC = `https://maps.google.com/maps?q=${encodeURIComponent(
  MAP_PLACE,
)}&ll=${MAP_COORDS.lat},${MAP_COORDS.lng}&z=${MAP_ZOOM}&hl=en&output=embed`;

export const CONTACT_SUBJECTS = [
  "General Enquiry",
  "Order Status",
  "Payment Problem",
  "Return or Refund",
  "Partnership",
  "Something else",
] as const;
