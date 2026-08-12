import type { Metadata } from "next";

import { pageMetadata } from "@/lib/metadata";
import { CategoryRail } from "@/components/landing/category-rail";
import { HeroCarousel } from "@/components/landing/hero-carousel";
import { NewProducts } from "@/components/landing/new-products";
import { WhyChooseUs } from "@/components/landing/why-choose-us";

// The one page whose title is not templated: "Hitadecor · Hitadecor" reads
// badly, so it carries the full brand line itself.
export const metadata: Metadata = {
  ...pageMetadata({
    title: "Hitadecor — Handcrafted Home Decor",
    description:
      "Handcrafted home decor from Coimbatore — mango wood trays, resin inlay, marble coasters and heritage-inspired pieces for a considered home.",
    path: "/",
  }),
  // `absolute` opts out of the root template, which would otherwise append
  // the site name again: "Hitadecor — … · Hitadecor".
  title: { absolute: "Hitadecor — Handcrafted Home Decor" },
};

export default function LandingPage() {
  return (
    <>
      <div className="mx-auto w-full max-w-7xl">
        <CategoryRail />
      </div>

      <HeroCarousel />
      <NewProducts />
      <WhyChooseUs />
    </>
  );
}
