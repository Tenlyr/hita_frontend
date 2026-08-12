import { FaqAccordion } from "@/components/faq/faq-accordion";
import { PageBanner } from "@/components/layout/page-banner";
import { APP_ROUTES } from "@/constants/routes";

export const metadata = {
  title: "FAQs — Hitadecor",
  description:
    "Shipping, payment, returns and where to find us — the questions we're asked most.",
};

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
