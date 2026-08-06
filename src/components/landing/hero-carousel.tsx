"use client";

import * as React from "react";

import { ResponsiveSlideImage } from "@/components/carousel/slide-image";
import { ResponsiveSlideCanvas } from "@/components/carousel/slide-canvas";
import { useFillViewport } from "@/hooks/use-fill-viewport";
import { carouselService } from "@/services/carousel.service";
import { cn } from "@/lib/utils";
import type { CarouselSlide } from "@/types/carousel.types";

const AUTOPLAY_MS = 6000;

/** Shown until slides exist in the console, so home is never a grey box. */
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

export function HeroCarousel() {
  const { ref, style } = useFillViewport<HTMLElement>();
  const [slides, setSlides] = React.useState<CarouselSlide[]>([FALLBACK]);
  const [index, setIndex] = React.useState(0);

  React.useEffect(() => {
    let cancelled = false;

    async function load() {
      try {
        const result = await carouselService.listPublic();
        if (!cancelled && result.results.length > 0) {
          setSlides(result.results);
          setIndex(0);
        }
      } catch {
        // Keep the fallback banner rather than an empty hero.
      }
    }

    void load();
    return () => {
      cancelled = true;
    };
  }, []);

  React.useEffect(() => {
    if (slides.length < 2) return;
    const timer = window.setInterval(
      () => setIndex((current) => (current + 1) % slides.length),
      AUTOPLAY_MS,
    );
    return () => window.clearInterval(timer);
  }, [slides.length]);

  return (
    <section
      ref={ref}
      aria-roledescription="carousel"
      aria-label="Featured"
      style={style}
      // min-h-72 is the pre-measurement fallback; `style` overrides it once
      // the height is known.
      className="relative min-h-72 w-full overflow-hidden bg-muted"
    >
      {slides.map((slide, position) => (
        <div
          key={slide.id}
          aria-hidden={position !== index}
          className={cn(
            "absolute inset-0 transition-opacity duration-500",
            position === index
              ? "opacity-100"
              : "pointer-events-none opacity-0",
          )}
        >
          <ResponsiveSlideImage
            mobile={slide.image_mobile}
            tablet={slide.image_tablet}
            desktop={slide.image_desktop}
            focus={slide.image_focus}
            alt={slide.title}
            // The hero is the largest paint above the fold.
            priority={position === 0}
          />
          <ResponsiveSlideCanvas
            blocks={slide.blocks}
            overlayOpacity={slide.overlay_opacity}
          />
        </div>
      ))}

      {/* A single slide has nothing to indicate. */}
      {slides.length > 1 ? (
        <div className="absolute top-1/2 right-4 z-10 flex -translate-y-1/2 flex-col gap-3 sm:right-6">
          {slides.map((slide, dot) => (
            <button
              key={slide.id}
              type="button"
              onClick={() => setIndex(dot)}
              aria-label={`Go to slide ${dot + 1}`}
              aria-current={dot === index}
              className={cn(
                "size-2.5 cursor-pointer rounded-full transition-colors",
                dot === index ? "bg-primary" : "bg-secondary",
              )}
            />
          ))}
        </div>
      ) : null}
    </section>
  );
}
