import { ImageOff } from "lucide-react";
import Image from "next/image";
import Link from "next/link";

import { API_BASE_URL } from "@/constants/config";
import { APP_ROUTES } from "@/constants/routes";
import type { Category } from "@/types/customer.product.types";

/** Long enough to stay off the API on every visit, short enough that a new
    category shows up without a redeploy. */
const REVALIDATE_SECONDS = 60;

async function loadCategories(): Promise<Category[]> {
  try {
    const response = await fetch(`${API_BASE_URL}/categories`, {
      next: { revalidate: REVALIDATE_SECONDS },
      headers: { "ngrok-skip-browser-warning": "true" },
    });
    if (!response.ok) return [];
    const body = await response.json();
    return body?.data ?? [];
  } catch {
    // Storefront decoration — a failed fetch just hides the rail.
    return [];
  }
}

/**
 * Fetched on the server, rendered as plain markup.
 *
 * No skeleton and no entrance animation: the categories are in the initial
 * HTML, so there is nothing to stand in for and nothing to animate into
 * place. That also means no client JavaScript for this rail at all.
 */
export async function CategoryRail() {
  const categories = await loadCategories();
  if (categories.length === 0) return null;

  return (
    <section aria-label="Shop by category" className="w-full">
      {/* Padding tracks the site header's container so the first circle lines
          up with the logo. No scroll snapping: `snap-mandatory` pins the first
          item to the snapport edge, which eats that left padding. */}
      {/* No bottom padding: the hover underline sits flush with the section's
          lower edge instead of floating above a gap. */}
      <div className="no-scrollbar overflow-x-auto scroll-smooth px-4 pt-4 sm:px-6">
        {/* w-max + mx-auto centres a short list, but leaves the first item
            reachable once it overflows — justify-center would clip it. */}
        <div className="mx-auto flex w-max gap-3 sm:gap-4">
          {categories.map((category) => (
            <Link
              key={category.name}
              href={`${APP_ROUTES.SHOP.PRODUCTS}?category=${encodeURIComponent(category.name)}`}
              className="group/tile flex w-16 shrink-0 flex-col items-center gap-1.5 text-center sm:w-20"
            >
              <span className="relative size-14 overflow-hidden rounded-full border border-border bg-muted transition-transform duration-200 hover:scale-105 sm:size-16">
                {category.image ? (
                  <Image
                    src={category.image}
                    alt=""
                    fill
                    unoptimized
                    sizes="96px"
                    className="object-cover"
                  />
                ) : (
                  <span className="flex h-full items-center justify-center text-muted-foreground">
                    <ImageOff className="size-6" />
                  </span>
                )}
              </span>
              <span className="text-xs leading-tight font-medium text-secondary">
                {category.name}
              </span>

              {/* Underline grows from the centre on hover. mt-auto pins it to
                  the bottom so tiles with two-line labels still align. */}
              <span
                aria-hidden
                className="mt-auto h-0.5 w-full scale-x-0 bg-sidebar transition-transform duration-200 ease-out group-hover/tile:scale-x-100"
              />
            </Link>
          ))}
        </div>
      </div>
    </section>
  );
}
