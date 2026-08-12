import type { MetadataRoute } from "next";

import { API_BASE_URL } from "@/constants/config";
import { APP_ROUTES } from "@/constants/routes";
import { absoluteUrl } from "@/constants/seo";
import type { Product } from "@/types/product.types";

/** Rebuilt hourly: new products should not wait on a deploy to be listed. */
export const revalidate = 3600;

const STATIC_ROUTES: { path: string; priority: number }[] = [
  { path: APP_ROUTES.SHOP.HOME, priority: 1 },
  { path: APP_ROUTES.SHOP.PRODUCTS, priority: 0.9 },
  { path: APP_ROUTES.SHOP.ABOUT, priority: 0.7 },
  { path: APP_ROUTES.SHOP.CONTACT, priority: 0.7 },
  { path: APP_ROUTES.SHOP.FAQ, priority: 0.5 },
  { path: APP_ROUTES.SHOP.SHIPPING_POLICY, priority: 0.3 },
  { path: APP_ROUTES.SHOP.RETURN_POLICY, priority: 0.3 },
  { path: APP_ROUTES.SHOP.PRIVACY_POLICY, priority: 0.3 },
  { path: APP_ROUTES.SHOP.TERMS, priority: 0.3 },
];

async function getProducts(): Promise<Product[]> {
  try {
    const response = await fetch(`${API_BASE_URL}/products?page_size=500`, {
      next: { revalidate },
    });
    if (!response.ok) return [];
    const body = await response.json();
    return (body?.data?.results as Product[]) ?? [];
  } catch {
    // A sitemap missing its products still beats a 500 at /sitemap.xml.
    return [];
  }
}

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const now = new Date();
  const products = await getProducts();

  return [
    ...STATIC_ROUTES.map(({ path, priority }) => ({
      url: absoluteUrl(path),
      lastModified: now,
      changeFrequency: "weekly" as const,
      priority,
    })),
    ...products.map((product) => ({
      url: absoluteUrl(APP_ROUTES.SHOP.product(product.id)),
      lastModified: product.created_at ? new Date(product.created_at) : now,
      changeFrequency: "weekly" as const,
      priority: 0.8,
    })),
  ];
}
