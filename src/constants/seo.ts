/**
 * One description of the site, so every page's metadata agrees.
 *
 * `NEXT_PUBLIC_APP_URL` is what makes canonical and Open Graph URLs absolute —
 * a relative og:image is ignored by every crawler, so this must be the real
 * public origin in production, not localhost.
 */

import { APP_CONFIG } from "@/constants/config";

export const SITE = {
  name: "Hitadecor",
  /** Appended to every page title by the root layout's template. */
  tagline: "Handcrafted Home Decor",
  url: APP_CONFIG.appUrl.replace(/\/$/, ""),
  description:
    "Handcrafted home decor from Coimbatore — mango wood trays, resin inlay, marble coasters and heritage-inspired pieces for a considered home.",
  /** Falls back to the logo when a page has no image of its own. */
  ogImage: "/images/banner.png",
  locale: "en_IN",
  twitter: "@hitadecor",
} as const;

export function absoluteUrl(path = "/"): string {
  // Media URLs come back from the API already absolute — and on a different
  // origin — so prefixing them again produced /http://... nonsense that no
  // crawler could fetch.
  if (/^https?:\/\//i.test(path)) return path;
  return `${SITE.url}${path.startsWith("/") ? path : `/${path}`}`;
}

/**
 * Trim prose to something a search result can show whole.
 *
 * Google renders roughly 155–160 characters, so anything longer is cut mid
 * sentence by the crawler rather than by us.
 */
export function clampDescription(text: string, limit = 158): string {
  const clean = text.replace(/\s+/g, " ").trim();
  if (clean.length <= limit) return clean;

  const cut = clean.slice(0, limit);
  const lastSpace = cut.lastIndexOf(" ");
  return `${(lastSpace > 60 ? cut.slice(0, lastSpace) : cut).replace(/[,;:.\-–—]+$/, "")}…`;
}
