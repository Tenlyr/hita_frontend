"use client";

import * as React from "react";

import { getApiErrorMessage } from "@/lib/api-error";
import { carouselService } from "@/services/carousel.service";
import type { CarouselSlide } from "@/types/carousel.types";

/** One slide, for the edit screen. Pass null while the id is unusable. */
export function useCarouselSlide(id: number | null) {
  const [slide, setSlide] = React.useState<CarouselSlide | null>(null);
  const [isLoading, setIsLoading] = React.useState(true);
  const [error, setError] = React.useState<string | null>(null);

  React.useEffect(() => {
    let cancelled = false;

    async function load() {
      if (id === null) {
        if (!cancelled) {
          setError("That slide id isn't valid.");
          setIsLoading(false);
        }
        return;
      }
      try {
        const result = await carouselService.get(id);
        if (!cancelled) setSlide(result);
      } catch (err) {
        if (!cancelled) {
          setError(getApiErrorMessage(err, "Could not load that slide."));
        }
      } finally {
        if (!cancelled) setIsLoading(false);
      }
    }

    void load();
    return () => {
      cancelled = true;
    };
  }, [id]);

  return { slide, isLoading, error };
}
