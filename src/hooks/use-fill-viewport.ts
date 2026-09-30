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
  // What the last measurement was taken against. A viewport height change on
  // its own is not in here on purpose — see measure().
  const measuredAgainst = React.useRef<{ width: number; offset: number }>(null);

  React.useEffect(() => {
    const element = ref.current;
    if (!element) return;

    function measure() {
      const node = ref.current;
      if (!node) return;
      // Measure the gap above the element without counting its own height,
      // otherwise each pass would feed back into the next measurement.
      const offset = node.getBoundingClientRect().top + window.scrollY;
      const width = window.innerWidth;

      // Phones hide the address bar as you scroll down and show it again on
      // the way up, which changes window.innerHeight by 60–100px and fires
      // resize mid-scroll. Re-measuring then would re-crop the hero photo, so
      // it reads as a zoom. Nothing about the layout actually changed, so the
      // height is left alone unless the width or what sits above us moved.
      const previous = measuredAgainst.current;
      if (previous && previous.width === width && previous.offset === offset) {
        return;
      }
      measuredAgainst.current = { width, offset };

      setHeight(Math.max(MIN_HEIGHT_PX, window.innerHeight - offset));
    }

    measure();
    window.addEventListener("resize", measure);

    // Sections above can change height after their data loads. This also fires
    // when the address bar moves, which is why the guard lives in measure().
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
