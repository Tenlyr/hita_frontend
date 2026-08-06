"use client";

import Image from "next/image";
import * as React from "react";

import { useFillViewport } from "@/hooks/use-fill-viewport";
import { cn } from "@/lib/utils";

interface Slide {
  src: string;
  alt: string;
}

// One slide for now — add more entries as the artwork lands.
const SLIDES: Slide[] = [
  { src: "/images/banner.png", alt: "Handcrafted home decor by Hitadecor" },
];

export function HeroCarousel() {
  const { ref, style } = useFillViewport<HTMLElement>();
  const [index, setIndex] = React.useState(0);

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
      {SLIDES.map((slide, position) => (
        <div
          key={slide.src}
          aria-hidden={position !== index}
          className={cn(
            "absolute inset-0 transition-opacity duration-500",
            position === index
              ? "opacity-100"
              : "pointer-events-none opacity-0",
          )}
        >
          <Image
            src={slide.src}
            alt={slide.alt}
            fill
            // The hero is the largest paint above the fold, so it loads eagerly.
            priority={position === 0}
            sizes="100vw"
            className="object-cover"
          />
        </div>
      ))}

      {/* A single slide has nothing to indicate. */}
      {SLIDES.length > 1 ? (
        <div className="absolute top-1/2 right-4 z-10 flex -translate-y-1/2 flex-col gap-3 sm:right-6">
          {SLIDES.map((slide, dot) => (
            <button
              key={slide.src}
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
