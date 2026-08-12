import type { Metadata } from "next";

import { pageMetadata } from "@/lib/metadata";
import { LegalDocument } from "@/components/legal/legal-document";
import { PageBanner } from "@/components/layout/page-banner";
import { TERMS_INTRO, TERMS_SECTIONS } from "@/constants/legal";
import { APP_ROUTES } from "@/constants/routes";

export const metadata: Metadata = pageMetadata({
  title: "Terms & Conditions",
  description:
    "The terms that govern use of the Hitadecor website, products and services.",
  path: "/terms",
});

export default function TermsPage() {
  return (
    <>
      <PageBanner
        title="Terms & Conditions"
        crumbs={[
          { label: "Home", href: APP_ROUTES.SHOP.HOME },
          { label: "Terms & Conditions" },
        ]}
      />

      <div className="mx-auto w-full max-w-7xl px-4 py-14 sm:px-6 sm:py-20">
        <LegalDocument intro={TERMS_INTRO} sections={TERMS_SECTIONS} />
      </div>
    </>
  );
}
