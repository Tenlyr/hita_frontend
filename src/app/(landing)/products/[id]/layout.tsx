import type { Metadata } from "next";

import { API_BASE_URL } from "@/constants/config";
import { SITE, absoluteUrl, clampDescription } from "@/constants/seo";
import { pageMetadata } from "@/lib/metadata";
import type { Product } from "@/types/product.types";

/**
 * Metadata for the product page.
 *
 * It lives in a layout rather than the page because the page is a client
 * component — `generateMetadata` only runs on the server, and converting the
 * page would mean rebuilding its gallery, variant selection and cart state.
 * The layout renders nothing of its own; it exists to describe what is below.
 */
async function getProduct(id: string): Promise<Product | null> {
  try {
    const response = await fetch(`${API_BASE_URL}/products/${id}`, {
      // Product copy changes rarely; an hour keeps crawlers off the API
      // without letting a rename go stale for long.
      next: { revalidate: 3600 },
    });
    if (!response.ok) return null;
    const body = await response.json();
    return (body?.data as Product) ?? null;
  } catch {
    // A metadata fetch must never take the page down with it.
    return null;
  }
}

/** Cheapest variant, which is the figure a search result should quote. */
function priceOf(product: Product): number | null {
  const prices = product.variants
    .map((variant) => Number(variant.offer_price ?? variant.price))
    .filter((price) => !Number.isNaN(price) && price > 0);
  return prices.length ? Math.min(...prices) : null;
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ id: string }>;
}): Promise<Metadata> {
  const { id } = await params;
  const product = await getProduct(id);

  if (!product) {
    return pageMetadata({
      title: "Product",
      path: `/products/${id}`,
      // Nothing to describe means nothing worth indexing.
      noIndex: true,
    });
  }

  const name = product.product_name?.trim() || "Product";
  const price = priceOf(product);

  // Built from the product's own copy, falling back to something specific
  // rather than the generic site line — two products must never share a
  // description a crawler can call duplicate content.
  const description = product.description?.trim()
    ? clampDescription(product.description)
    : clampDescription(
        [
          name,
          product.category ? `in ${product.category}` : "",
          "— handcrafted by Hitadecor.",
          price ? `From ₹${price.toLocaleString("en-IN")}.` : "",
          "Free delivery across India.",
        ]
          .filter(Boolean)
          .join(" "),
      );

  const title = product.category ? `${name} — ${product.category}` : name;

  return pageMetadata({
    title,
    description,
    path: `/products/${product.id}`,
    image: product.images[0]?.product_image ?? null,
    type: "article",
  });
}

export default async function ProductLayout({
  children,
  params,
}: {
  children: React.ReactNode;
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const product = await getProduct(id);
  const price = product ? priceOf(product) : null;

  // Product structured data, which is what turns a result into a rich card
  // with a price and availability. Emitted only when there is a real price to
  // state — a Product without an offer is rejected by Google's validator.
  const jsonLd =
    product && price
      ? {
          "@context": "https://schema.org",
          "@type": "Product",
          name: product.product_name,
          description: product.description || undefined,
          image: product.images
            .map((image) => image.product_image)
            .filter(Boolean),
          category: product.category || undefined,
          brand: { "@type": "Brand", name: SITE.name },
          ...(product.rating
            ? {
                aggregateRating: {
                  "@type": "AggregateRating",
                  ratingValue: product.rating,
                  ratingCount: 1,
                },
              }
            : {}),
          offers: {
            "@type": "Offer",
            url: absoluteUrl(`/products/${product.id}`),
            priceCurrency: "INR",
            price: price.toFixed(2),
            availability: product.variants.some(
              (variant) => (variant.quantity_available ?? 0) > 0,
            )
              ? "https://schema.org/InStock"
              : "https://schema.org/OutOfStock",
          },
        }
      : null;

  return (
    <>
      {jsonLd ? (
        <script
          type="application/ld+json"
          // Server-rendered from our own API, and JSON.stringify escapes the
          // values — there is no user-authored HTML in here.
          dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
        />
      ) : null}
      {children}
    </>
  );
}
