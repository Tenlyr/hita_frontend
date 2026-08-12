import type { Metadata } from "next";

import { Suspense } from "react";

import { pageMetadata } from "@/lib/metadata";
import { AccountView } from "@/components/account/account-view";
import { PageBanner } from "@/components/layout/page-banner";
import { APP_ROUTES } from "@/constants/routes";

export const metadata: Metadata = pageMetadata({
  title: "My Account",
  description: "Your Hitadecor orders, saved addresses and wishlist.",
  path: "/account",
  noIndex: true,
});

export default function AccountPage() {
  return (
    <>
      <PageBanner
        title="My Account"
        crumbs={[
          { label: "Home", href: APP_ROUTES.SHOP.HOME },
          { label: "Account" },
        ]}
      />

      <div className="mx-auto w-full max-w-7xl px-4 py-12 sm:px-6 sm:py-16">
        {/* AccountView reads `?tab=`, and useSearchParams needs a boundary
            while the shell is prerendered. */}
        <Suspense fallback={<div className="h-96 animate-pulse bg-muted" />}>
          <AccountView />
        </Suspense>
      </div>
    </>
  );
}
