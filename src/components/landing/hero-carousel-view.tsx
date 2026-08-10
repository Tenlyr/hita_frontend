"use client";

import gsap from "gsap";
import * as React from "react";

import { ResponsiveSlideImage } from "@/components/carousel/slide-image";
import { ResponsiveSlideCanvas } from "@/components/carousel/slide-canvas";
import { useFillViewport } from "@/hooks/use-fill-viewport";
import { cn } from "@/lib/utils";
import type { CarouselSlide } from "@/types/carousel.types";

const AUTOPLAY_MS = 6000;

/* On load the first slide settles from slightly enlarged to its resting size —
   a camera easing into place. Opacity is left alone so nothing flashes over
   the server-painted frame. */
const INTRO_SCALE = 1.08;
const INTRO_DURATION = 1.4;

/* Every change after that swipes: the two slides travel together, so the
   motion says "next" rather than "different". */
const SWIPE_DURATION = 0.8;

export function HeroCarouselView({ slides }: { slides: CarouselSlide[] }) {
  const { ref, style } = useFillViewport<HTMLElement>();
  const [index, setIndex] = React.useState(0);

  const slideRefs = React.useRef<Array<HTMLDivElement | null>>([]);
  const shownIndex = React.useRef(0);
  const hasPainted = React.useRef(false);

  React.useEffect(() => {
    const nodes = slideRefs.current;
    const incoming = nodes[index];
    if (!incoming) return;

    const previous = shownIndex.current;
    const outgoing = previous === index ? null : nodes[previous];
    shownIndex.current = index;

    const rest = nodes.filter(
      (node): node is HTMLDivElement =>
        Boolean(node) && node !== incoming && node !== outgoing,
    );
    // Anything not part of this transition is parked, so a fast click that
    // interrupts a tween cannot strand a slide mid-travel.
    gsap.set(rest, { autoAlpha: 0, xPercent: 0, scale: 1 });

    const reduced = window.matchMedia(
      "(prefers-reduced-motion: reduce)",
    ).matches;

    if (reduced) {
      if (outgoing) gsap.set(outgoing, { autoAlpha: 0, xPercent: 0 });
      gsap.set(incoming, { autoAlpha: 1, xPercent: 0, scale: 1 });
      hasPainted.current = true;
      return;
    }

    // First paint: the frame is already on screen, so only the scale moves.
    if (!hasPainted.current) {
      hasPainted.current = true;
      gsap.set(incoming, { autoAlpha: 1, xPercent: 0 });
      gsap.fromTo(
        incoming,
        { scale: INTRO_SCALE },
        { scale: 1, duration: INTRO_DURATION, ease: "power2.out" },
      );
      return;
    }

    if (!outgoing) {
      gsap.set(incoming, { autoAlpha: 1, xPercent: 0, scale: 1 });
      return;
    }

    /* Shortest way round the loop, so the last-to-first wrap keeps travelling
       forward instead of rewinding through every slide. */
    const total = slides.length;
    const forwardSteps = (index - previous + total) % total;
    const backwardSteps = (previous - index + total) % total;
    const forward = forwardSteps <= backwardSteps;

    gsap.to(outgoing, {
      xPercent: forward ? -100 : 100,
      duration: SWIPE_DURATION,
      ease: "power2.inOut",
      overwrite: "auto",
      // Parked only once it is off screen, or it would blink out mid-travel.
      onComplete: () => gsap.set(outgoing, { autoAlpha: 0, xPercent: 0 }),
    });

    gsap.fromTo(
      incoming,
      { xPercent: forward ? 100 : -100, autoAlpha: 1, scale: 1 },
      {
        xPercent: 0,
        duration: SWIPE_DURATION,
        ease: "power2.inOut",
        overwrite: "auto",
      },
    );
  }, [index, slides]);

  React.useEffect(
    () => () => {
      gsap.killTweensOf(slideRefs.current.filter(Boolean) as HTMLDivElement[]);
    },
    [],
  );

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
          ref={(node) => {
            slideRefs.current[position] = node;
          }}
          aria-hidden={position !== index}
          // GSAP owns opacity and transform from the first effect onward.
          // These classes only set the pre-hydration state.
          className={cn(
            "absolute inset-0",
            position === index ? "" : "pointer-events-none opacity-0",
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
