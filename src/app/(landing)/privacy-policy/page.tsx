import { LegalDocument } from "@/components/legal/legal-document";
import { PageBanner } from "@/components/layout/page-banner";
import { TERMS_SECTIONS } from "@/constants/legal";
import { APP_ROUTES } from "@/constants/routes";

export const metadata = {
  title: "Privacy Policy — Hitadecor",
  description:
    "How Hitadecor handles your information, orders, deliveries and returns.",
};

export default function PrivacyPolicyPage() {
  return (
    <>
      <PageBanner
        title="Privacy Policy"
        crumbs={[
          { label: "Home", href: APP_ROUTES.SHOP.HOME },
          { label: "Privacy Policy" },
        ]}
      />

      <div className="mx-auto w-full max-w-7xl px-4 py-14 sm:px-6 sm:py-20">
        {/* No intro paragraph here — this page opens straight into the
            clauses, unlike the terms page. */}
        <LegalDocument sections={TERMS_SECTIONS} />
      </div>
    </>
  );
}
