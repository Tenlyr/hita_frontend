"use client";

import * as React from "react";

/** Floor for the computed height, in px. Matches the consumer's min-h-* fallback. */
const MIN_HEIGHT_PX = 288;

/**
 * Height that fills the rest of the first screen: viewport minus everything
 * above the element (site header, category rail, …).
 *
 * Measured rather than hardcoded, so it stays correct when those sections
 * change height — e.g. a two-line category label on a narrow screen.
 */
export function useFillViewport<T extends HTMLElement>() {
  const ref = React.useRef<T>(null);
  const [height, setHeight] = React.useState<number | undefined>();

  React.useEffect(() => {
    const element = ref.current;
    if (!element) return;

    function measure() {
      const node = ref.current;
      if (!node) return;
      // Measure the gap above the element without counting its own height,
      // otherwise each pass would feed back into the next measurement.
      const offsetFromDocumentTop =
        node.getBoundingClientRect().top + window.scrollY;
      setHeight(
        Math.max(MIN_HEIGHT_PX, window.innerHeight - offsetFromDocumentTop),
      );
    }

    measure();
    window.addEventListener("resize", measure);

    // Sections above can change height after their data loads.
    const observer = new ResizeObserver(measure);
    observer.observe(document.body);

    return () => {
      window.removeEventListener("resize", measure);
      observer.disconnect();
    };
  }, []);

  /** Spread onto the element: both bounds, so the section is exactly this tall. */
  const style: React.CSSProperties = {
    minHeight: height,
    maxHeight: height,
  };

  return { ref, height, style };
}
