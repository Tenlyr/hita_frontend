import { HeroCarouselView } from "@/components/landing/hero-carousel-view";
import { API_BASE_URL } from "@/constants/config";
import type { CarouselSlide } from "@/types/carousel.types";

/** Shown when no slide is live yet, so home is never a grey box. */
const FALLBACK: CarouselSlide = {
  id: 0,
  title: "Default banner",
  image_desktop: "/images/banner.png",
  image_tablet: "/images/banner.png",
  image_mobile: "/images/banner.png",
  has_tablet_image: false,
  has_mobile_image: false,
  overlay_opacity: 0,
  image_focus: {
    desktop: { x: 50, y: 50 },
    tablet: { x: 50, y: 50 },
    mobile: { x: 50, y: 50 },
  },
  blocks: [],
  is_active: true,
  sort_order: 0,
};

/** Long enough to stay off the API on every visit, short enough that a slide
    published in the console shows up without a redeploy. */
const REVALIDATE_SECONDS = 60;

async function loadSlides(): Promise<CarouselSlide[]> {
  try {
    const response = await fetch(`${API_BASE_URL}/carousel`, {
      next: { revalidate: REVALIDATE_SECONDS },
      headers: { "ngrok-skip-browser-warning": "true" },
    });
    if (!response.ok) return [];
    const body = await response.json();
    return body?.data?.results ?? [];
  } catch {
    // The API being down should cost the banner, not the page.
    return [];
  }
}

/**
 * Fetched on the server on purpose.
 *
 * Loading slides in the browser meant the fallback banner painted first and
 * was then replaced a moment later — a visible swap on every cold load. Doing
 * it here puts the real slides in the initial HTML, so the first frame the
 * visitor sees is already the right one.
 */
export async function HeroCarousel() {
  const slides = await loadSlides();
  return <HeroCarouselView slides={slides.length > 0 ? slides : [FALLBACK]} />;
}
