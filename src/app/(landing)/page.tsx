import { CategoryRail } from "@/components/landing/category-rail";
import { HeroCarousel } from "@/components/landing/hero-carousel";
import { NewProducts } from "@/components/landing/new-products";
import { WhyChooseUs } from "@/components/landing/why-choose-us";

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
