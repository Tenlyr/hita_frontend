"use client";

import { cn } from "@/lib/utils";
import type { Breakpoint, SlideFocus } from "@/types/carousel.types";

/** Matches the Tailwind breakpoints the storefront layout already uses. */
const TABLET_MIN = 640;
const DESKTOP_MIN = 1024;

interface SlideImageProps {
  mobile: string;
  tablet: string;
  desktop: string;
  alt: string;
  /** First slide is the largest above-the-fold paint. */
  priority?: boolean;
  /** Forces one source — the editor's device switcher needs that. */
  force?: "mobile" | "tablet" | "desktop";
  /** CSS object-position, so a crop can be anchored off-centre. */
  objectPosition?: string;
  className?: string;
}

/**
 * A `<picture>` rather than `next/image`.
 *
 * These are art-directed crops, not one image at three sizes: the mobile file
 * is a different composition, so the browser has to choose by viewport, which
 * `next/image` alone cannot express.
 */
export function SlideImage({
  mobile,
  tablet,
  desktop,
  alt,
  priority = false,
  force,
  objectPosition,
  className,
}: SlideImageProps) {
  const imageClass = cn("size-full object-cover", className);
  const style = objectPosition ? { objectPosition } : undefined;

  if (force) {
    const src = { mobile, tablet, desktop }[force];
    // eslint-disable-next-line @next/next/no-img-element
    return <img src={src} alt={alt} className={imageClass} style={style} />;
  }

  return (
    <picture>
      <source media={`(min-width: ${DESKTOP_MIN}px)`} srcSet={desktop} />
      <source media={`(min-width: ${TABLET_MIN}px)`} srcSet={tablet} />
      <img
        src={mobile}
        alt={alt}
        loading={priority ? "eager" : "lazy"}
        fetchPriority={priority ? "high" : "auto"}
        className={imageClass}
        style={style}
      />
    </picture>
  );
}

/* Same cut points as the canvas, so the photo and the layout switch together. */
const VARIANTS: { breakpoint: Breakpoint; visibility: string }[] = [
  { breakpoint: "mobile", visibility: "sm:hidden" },
  { breakpoint: "tablet", visibility: "hidden sm:block lg:hidden" },
  { breakpoint: "desktop", visibility: "hidden lg:block" },
];

function positionOf(focus: SlideFocus | undefined, breakpoint: Breakpoint) {
  const point = focus?.[breakpoint];
  return point ? `${point.x}% ${point.y}%` : "50% 50%";
}

interface ResponsiveSlideImageProps {
  mobile: string;
  tablet: string;
  desktop: string;
  focus?: SlideFocus;
  alt: string;
  priority?: boolean;
}

/**
 * The slide photo with a per-breakpoint focal point.
 *
 * `object-position` cannot vary by media query from an inline style, so when
 * the three focus points differ the image is emitted three times and switched
 * in CSS. When they match — the usual case — one `<picture>` does the job and
 * the browser picks the source itself.
 */
export function ResponsiveSlideImage({
  mobile,
  tablet,
  desktop,
  focus,
  alt,
  priority = false,
}: ResponsiveSlideImageProps) {
  const positions = VARIANTS.map((variant) =>
    positionOf(focus, variant.breakpoint),
  );
  const sameFocus = positions.every((position) => position === positions[0]);

  if (sameFocus) {
    return (
      <SlideImage
        mobile={mobile}
        tablet={tablet}
        desktop={desktop}
        alt={alt}
        priority={priority}
        objectPosition={positions[0]}
        className="absolute inset-0"
      />
    );
  }

  return (
    <>
      {VARIANTS.map((variant, index) => (
        <SlideImage
          key={variant.breakpoint}
          mobile={mobile}
          tablet={tablet}
          desktop={desktop}
          alt={index === 0 ? alt : ""}
          priority={priority && index === 0}
          force={variant.breakpoint}
          objectPosition={positions[index]}
          className={cn("absolute inset-0", variant.visibility)}
        />
      ))}
    </>
  );
}
