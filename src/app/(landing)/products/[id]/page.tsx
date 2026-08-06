"use client";

import { useParams } from "next/navigation";
import * as React from "react";

import { BreadcrumbBar } from "@/components/layout/breadcrumb-bar";
import { ProductGallery } from "@/components/product/product-gallery";
import { ProductPurchasePanel } from "@/components/product/product-purchase-panel";
import { ProductTabs } from "@/components/product/product-tabs";
import { RelatedProducts } from "@/components/product/related-products";
import { APP_ROUTES } from "@/constants/routes";
import { useProductDetail } from "@/hooks/use-product-detail";
import { REVEAL_ITEM, useGsapReveal } from "@/hooks/use-gsap-reveal";
import { useVariantSelection } from "@/hooks/use-variant-selection";

function DetailSkeleton() {
  return (
    <div className="grid gap-10 lg:grid-cols-2">
      <div className="aspect-square animate-pulse bg-muted" />
      <div className="space-y-4">
        <div className="h-10 w-2/3 animate-pulse rounded bg-muted" />
        <div className="h-8 w-32 animate-pulse rounded bg-muted" />
        <div className="h-12 w-48 animate-pulse rounded bg-muted" />
        <div className="h-32 w-full animate-pulse rounded bg-muted" />
      </div>
    </div>
  );
}

export default function ProductDetailPage() {
  const params = useParams<{ id: string }>();
  const id = Number(params.id);
  const { product, isLoading, error } = useProductDetail(
    Number.isNaN(id) ? null : id,
  );
  const { selected, selectVariant } = useVariantSelection(product);

  // Navigating between products only swaps the [id] segment, so the router
  // keeps the current scroll position — jump back up for the new product.
  React.useEffect(() => {
    window.scrollTo({ top: 0, behavior: "instant" });
  }, [id]);

  // Animations wait for `product`, otherwise they would target the skeleton.
  const heroRef = useGsapReveal<HTMLDivElement>({
    enabled: Boolean(product),
    immediate: true,
    stagger: 0.15,
  });
  const tabsRef = useGsapReveal<HTMLDivElement>({ enabled: Boolean(product) });

  const title = isLoading
    ? "Loading…"
    : (product?.product_name ?? "Product not found");

  return (
    <>
      <BreadcrumbBar
        crumbs={[
          { label: "Home", href: APP_ROUTES.SHOP.HOME },
          { label: "Products", href: APP_ROUTES.SHOP.PRODUCTS },
          { label: title },
        ]}
      />

      <div className="mx-auto w-full max-w-7xl px-4 py-10 sm:px-6 sm:py-14">
        {error ? (
          <p
            role="alert"
            className="border border-destructive/30 bg-destructive/10 px-4 py-3 text-sm text-destructive"
          >
            {error}
          </p>
        ) : isLoading ? (
          <DetailSkeleton />
        ) : product ? (
          <div className="space-y-14">
            {/* Above the fold, so it plays on load rather than on scroll. */}
            <div ref={heroRef} className="grid gap-10 lg:grid-cols-2 lg:gap-14">
              <div className={REVEAL_ITEM}>
                <ProductGallery
                  images={product.images}
                  alt={product.product_name ?? "Product"}
                  productId={product.id}
                />
              </div>
              <div className={REVEAL_ITEM}>
                <ProductPurchasePanel
                  product={product}
                  selected={selected}
                  onSelectVariant={selectVariant}
                />
              </div>
            </div>

            <div ref={tabsRef}>
              <div className={REVEAL_ITEM}>
                <ProductTabs product={product} variant={selected} />
              </div>
            </div>

            {/* key: remount when navigating between products so the list
                refetches instead of showing the previous product's picks. */}
            <RelatedProducts key={product.id} productId={product.id} />
          </div>
        ) : null}
      </div>
    </>
  );
}
