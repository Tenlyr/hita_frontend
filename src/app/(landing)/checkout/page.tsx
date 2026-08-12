import type { Metadata } from "next";

import { pageMetadata } from "@/lib/metadata";
import { CheckoutView } from "@/components/checkout/checkout-view";
import { PageBanner } from "@/components/layout/page-banner";
import { APP_ROUTES } from "@/constants/routes";

export const metadata: Metadata = pageMetadata({
  title: "Checkout",
  description: "Complete your Hitadecor order.",
  path: "/checkout",
  noIndex: true,
});

export default function CheckoutPage() {
  return (
    <>
      <PageBanner
        title="Checkout"
        crumbs={[
          { label: "Home", href: APP_ROUTES.SHOP.HOME },
          { label: "Checkout" },
        ]}
      />

      <div className="mx-auto w-full max-w-7xl px-4 py-12 sm:px-6 sm:py-16">
        <CheckoutView />
      </div>
    </>
  );
}
