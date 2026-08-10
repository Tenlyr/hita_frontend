import { AboutBenefits } from "@/components/about/about-benefits";
import { AboutIntro } from "@/components/about/about-intro";
import { PageBanner } from "@/components/layout/page-banner";
import { APP_ROUTES } from "@/constants/routes";

export const metadata = {
  title: "About Us — Hitadecor",
  description:
    "Heritage inspired, timeless aesthetics — handcrafted home decor where tradition meets elegance.",
};

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
