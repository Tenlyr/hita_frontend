import type { Metadata } from "next";

import { pageMetadata } from "@/lib/metadata";
import { AboutBenefits } from "@/components/about/about-benefits";
import { AboutIntro } from "@/components/about/about-intro";
import { PageBanner } from "@/components/layout/page-banner";
import { APP_ROUTES } from "@/constants/routes";

export const metadata: Metadata = pageMetadata({
  title: "About Us",
  description:
    "Heritage inspired, timeless aesthetics — handcrafted home decor from Coimbatore, where tradition meets elegance.",
  path: "/about",
});

export default function AboutPage() {
  return (
    <>
      <PageBanner
        title="About Us"
        crumbs={[
          { label: "Home", href: APP_ROUTES.SHOP.HOME },
          { label: "About" },
        ]}
      />

      <AboutIntro />
      <AboutBenefits />
    </>
  );
}
