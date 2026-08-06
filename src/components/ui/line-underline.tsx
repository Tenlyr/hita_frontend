"use client";

import * as React from "react";

import { cn } from "@/lib/utils";

interface LineRect {
  top: number;
  left: number;
  width: number;
}

interface LineUnderlineProps {
  children: React.ReactNode;
  /** Per-line sweep duration; the next line starts when the previous ends. */
  durationMs?: number;
  className?: string;
}

/**
 * Text whose underline sweeps 0 -> 100% one line at a time.
 *
 * CSS alone can't stagger this: `box-decoration-break: clone` gives each
 * wrapped line a rule, but they all share one background-size and animate
 * together. So the line boxes are measured with a Range and a bar is drawn
 * per line, each with its own transition-delay.
 *
 * Reveal is driven by the `group/card` hover state of an ancestor.
 */
export function LineUnderline({
  children,
  durationMs = 250,
  className,
}: LineUnderlineProps) {
  const wrapperRef = React.useRef<HTMLSpanElement>(null);
  const textRef = React.useRef<HTMLSpanElement>(null);
  const [lines, setLines] = React.useState<LineRect[]>([]);

  React.useEffect(() => {
    const textNode = textRef.current;
    if (!textNode) return;

    function measure() {
      const text = textRef.current;
      const wrapper = wrapperRef.current;
      if (!text || !wrapper) return;

      const range = document.createRange();
      range.selectNodeContents(text);
      const wrapperRect = wrapper.getBoundingClientRect();

      // One client rect per line fragment; merge any that share a baseline.
      const byLine = new Map<
        number,
        { left: number; right: number; bottom: number }
      >();
      for (const rect of Array.from(range.getClientRects())) {
        if (rect.width === 0) continue;
        const key = Math.round(rect.top);
        const existing = byLine.get(key);
        byLine.set(
          key,
          existing
            ? {
                left: Math.min(existing.left, rect.left),
                right: Math.max(existing.right, rect.right),
                bottom: Math.max(existing.bottom, rect.bottom),
              }
            : { left: rect.left, right: rect.right, bottom: rect.bottom },
        );
      }

      setLines(
        Array.from(byLine.values()).map((line) => ({
          top: line.bottom - wrapperRect.top,
          left: line.left - wrapperRect.left,
          width: line.right - line.left,
        })),
      );
    }

    // ResizeObserver fires once on observe, so the initial measure happens
    // in its callback rather than synchronously in this effect.
    const observer = new ResizeObserver(measure);
    observer.observe(textNode);
    window.addEventListener("resize", measure);

    return () => {
      observer.disconnect();
      window.removeEventListener("resize", measure);
    };
  }, [children]);

  return (
    <span ref={wrapperRef} className={cn("relative inline-block", className)}>
      <span ref={textRef}>{children}</span>

      {lines.map((line, index) => (
        <span
          key={`${line.top}-${index}`}
          aria-hidden
          style={
            {
              top: line.top + 2,
              left: line.left,
              width: line.width,
              transitionDuration: `${durationMs}ms`,
              // Delays go through custom properties, not `transitionDelay`:
              // an inline value would outrank the group-hover class and the
              // enter timing would never apply.
              "--enter-delay": `${index * durationMs}ms`,
              "--exit-delay": `${(lines.length - 1 - index) * durationMs}ms`,
            } as React.CSSProperties
          }
          // A transition uses the delay of the state it moves *to*: the resting
          // delay runs on the way out (last line first), the hover delay on the
          // way in (first line first).
          className="absolute h-0.5 origin-left scale-x-0 bg-current transition-transform ease-out [transition-delay:var(--exit-delay)] group-hover/card:scale-x-100 group-hover/card:[transition-delay:var(--enter-delay)]"
        />
      ))}
    </span>
  );
}
