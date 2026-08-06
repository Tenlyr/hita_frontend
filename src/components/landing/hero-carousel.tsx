"use client";

import * as React from "react";

import { useFillViewport } from "@/hooks/use-fill-viewport";
import { cn } from "@/lib/utils";

// Placeholder slides — swap the contents for real images.
const SLIDES = ["Carousel 1", "Carousel 2", "Carousel 3"];

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
      {SLIDES.map((label, position) => (
        <div
          key={label}
          aria-hidden={position !== index}
          className={cn(
            "absolute inset-0 flex items-center justify-center transition-opacity duration-500",
            position === index
              ? "opacity-100"
              : "pointer-events-none opacity-0",
          )}
        >
          <span className="text-2xl font-black text-secondary sm:text-4xl">
            {label}
          </span>
        </div>
      ))}

      <div className="absolute top-1/2 right-4 z-10 flex -translate-y-1/2 flex-col gap-3 sm:right-6">
        {SLIDES.map((label, dot) => (
          <button
            key={label}
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
    </section>
  );
}
