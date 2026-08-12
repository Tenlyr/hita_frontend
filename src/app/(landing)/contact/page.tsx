import type { Metadata } from "next";

import { pageMetadata } from "@/lib/metadata";
import { ContactMap } from "@/components/contact/contact-map";
import { ContactSection } from "@/components/contact/contact-section";
import { PageBanner } from "@/components/layout/page-banner";
import { APP_ROUTES } from "@/constants/routes";

export const metadata: Metadata = pageMetadata({
  title: "Contact Us",
  description:
    "Questions, feedback or partnership enquiries — reach the Hitadecor team in Coimbatore by phone, email or on the map.",
  path: "/contact",
});

export default function ContactPage() {
  return (
    <>
      <PageBanner
        title="Contact Us"
        crumbs={[
          { label: "Home", href: APP_ROUTES.SHOP.HOME },
          { label: "Contact" },
        ]}
      />

      <ContactSection />
      <ContactMap />
    </>
  );
}
