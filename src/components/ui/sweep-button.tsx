"use client";

import Link from "next/link";
import * as React from "react";

import { cn } from "@/lib/utils";

type SweepColor = "primary" | "secondary" | "sidebar";
type SweepVariant = "bordered" | "filled";

const COLORS: Record<
  SweepColor,
  { border: string; text: string; fill: string }
> = {
  primary: {
    border: "border-primary",
    text: "text-primary",
    fill: "bg-primary",
  },
  secondary: {
    border: "border-secondary",
    text: "text-secondary",
    fill: "bg-secondary",
  },
  sidebar: {
    border: "border-sidebar",
    text: "text-sidebar",
    fill: "bg-sidebar",
  },
};

/**
 * `bordered` — outlined at rest. On hover the label drops away and the filled
 * panel (white text baked in) unclips left -> right.
 *
 * `filled` — the same motion in reverse: the panel clips away right -> left
 * and the outlined label rises back in from the bottom.
 */
const MOTION: Record<SweepVariant, { label: string; panel: string }> = {
  bordered: {
    label: "ease-in group-hover/sweep:translate-y-full",
    panel:
      "[clip-path:inset(0_100%_0_0)] group-hover/sweep:[clip-path:inset(0_0_0_0)]",
  },
  filled: {
    label: "ease-out translate-y-full group-hover/sweep:translate-y-0",
    panel:
      "[clip-path:inset(0_0_0_0)] group-hover/sweep:[clip-path:inset(0_100%_0_0)]",
  },
};

interface SweepButtonProps {
  /** Plain text — it is rendered twice, once per layer. */
  label: string;
  href?: string;
  /** Leaves the site: renders a plain anchor with target="_blank". */
  external?: boolean;
  onClick?: () => void;
  color?: SweepColor;
  variant?: SweepVariant;
  type?: "button" | "submit";
  className?: string;
  style?: React.CSSProperties;
  /** Padding on the label layers. Override with em units to scale with the
      font size — the slide canvas does, so buttons stay proportional. */
  contentClassName?: string;
}

export function SweepButton({
  label,
  href,
  external = false,
  onClick,
  color = "secondary",
  variant = "bordered",
  type = "button",
  className,
  style,
  contentClassName = "px-10 py-3",
}: SweepButtonProps) {
  const palette = COLORS[color];
  const motion = MOTION[variant];

  const content = (
    <>
      <span
        className={cn(
          "block transition-transform duration-200",
          contentClassName,
          palette.text,
          motion.label,
        )}
      >
        {label}
      </span>

      {/* Duplicate label, hidden from assistive tech — it exists only so the
          white text is revealed by the clip rather than recoloured in place. */}
      <span
        aria-hidden
        className={cn(
          "absolute inset-0 flex items-center justify-center text-white transition-[clip-path] duration-300 ease-out",
          contentClassName,
          palette.fill,
          motion.panel,
        )}
      >
        {label}
      </span>
    </>
  );

  const shared = cn(
    "group/sweep relative inline-block cursor-pointer overflow-hidden border text-center text-base font-semibold sm:text-lg",
    palette.border,
    className,
  );

  if (href && external) {
    // next/link would prefetch and client-navigate an off-site URL, so an
    // outbound CTA gets a plain anchor.
    return (
      <a
        href={href}
        target="_blank"
        rel="noopener noreferrer"
        onClick={onClick}
        style={style}
        className={shared}
      >
        {content}
      </a>
    );
  }

  if (href) {
    // onClick still fires here — callers use it to close a dialog or sheet
    // as they navigate.
    return (
      <Link href={href} onClick={onClick} style={style} className={shared}>
        {content}
      </Link>
    );
  }

  return (
    <button type={type} onClick={onClick} style={style} className={shared}>
      {content}
    </button>
  );
}
