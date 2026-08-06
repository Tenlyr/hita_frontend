"use client";

import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import * as React from "react";

gsap.registerPlugin(ScrollTrigger);

/** Children carrying this class are the ones that animate. */
export const REVEAL_ITEM = "gsap-reveal";

interface RevealOptions {
  /** Re-run once async content has rendered. */
  enabled?: boolean;
  /** Skip ScrollTrigger and play immediately — for above-the-fold blocks. */
  immediate?: boolean;
  /**
   * Change to replay the reveal (e.g. a new filter set). Deliberately not the
   * item count: appended pages should slot in without re-animating what the
   * visitor is already looking at.
   */
  replayKey?: string | number;
  stagger?: number;
  y?: number;
}

/**
 * Fades and lifts `.gsap-reveal` children into place.
 *
 * The selector is scoped through `gsap.context` so several sections can use
 * the hook without touching each other's elements, and `revert()` cleans up
 * tweens and triggers — important under React strict mode, where effects run
 * twice.
 */
export function useGsapReveal<T extends HTMLElement>({
  enabled = true,
  immediate = false,
  replayKey,
  stagger = 0.12,
  y = 40,
}: RevealOptions = {}) {
  const ref = React.useRef<T>(null);

  React.useEffect(() => {
    if (!enabled || !ref.current) return;
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;

    const context = gsap.context(() => {
      gsap.from(`.${REVEAL_ITEM}`, {
        y,
        autoAlpha: 0,
        duration: 0.7,
        ease: "power2.out",
        stagger,
        ...(immediate
          ? {}
          : {
              scrollTrigger: {
                trigger: ref.current,
                start: "top 85%",
                once: true,
              },
            }),
      });
    }, ref);

    return () => context.revert();
  }, [enabled, immediate, replayKey, stagger, y]);

  return ref;
}
