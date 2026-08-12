import type { Metadata } from "next";

import { pageMetadata } from "@/lib/metadata";
import { FaqAccordion } from "@/components/faq/faq-accordion";
import { PageBanner } from "@/components/layout/page-banner";
import { APP_ROUTES } from "@/constants/routes";

export const metadata: Metadata = pageMetadata({
  title: "FAQs",
  description:
    "Shipping, payment, returns and where to find us — the questions Hitadecor shoppers ask most, answered.",
  path: "/faqs",
});

export default function FaqsPage() {
  return (
    <>
      <PageBanner
        title="Our FAQs"
        crumbs={[
          { label: "Home", href: APP_ROUTES.SHOP.HOME },
          { label: "FAQs" },
        ]}
      />

      <div className="mx-auto w-full max-w-7xl px-4 py-14 sm:px-6 sm:py-20">
        <FaqAccordion />
      </div>
    </>
  );
}
