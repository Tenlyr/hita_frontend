"use client";

import * as React from "react";
import { toast } from "sonner";

import { getApiErrorMessage } from "@/lib/api-error";
import { carouselService } from "@/services/carousel.service";
import type { CarouselSlide } from "@/types/carousel.types";

/** The slide list behind the console's carousel screen. */
export function useCarouselSlides() {
  const [slides, setSlides] = React.useState<CarouselSlide[]>([]);
  const [isLoading, setIsLoading] = React.useState(true);
  const [isSaving, setIsSaving] = React.useState(false);

  React.useEffect(() => {
    let cancelled = false;

    async function load() {
      try {
        const result = await carouselService.list();
        if (!cancelled) setSlides(result.results);
      } catch {
        if (!cancelled) setSlides([]);
      } finally {
        if (!cancelled) setIsLoading(false);
      }
    }

    void load();
    return () => {
      cancelled = true;
    };
  }, []);

  /** Swap a slide with its neighbour, then persist the whole order. */
  const move = React.useCallback(
    async (id: number, direction: -1 | 1) => {
      const index = slides.findIndex((slide) => slide.id === id);
      const target = index + direction;
      if (index === -1 || target < 0 || target >= slides.length) return;

      const next = [...slides];
      [next[index], next[target]] = [next[target], next[index]];
      // Paint the swap immediately; the arrows should not wait on the network.
      setSlides(next);

      try {
        const result = await carouselService.reorder(
          next.map((slide) => slide.id),
        );
        setSlides(result.results);
      } catch (error) {
        setSlides(slides);
        toast.error(getApiErrorMessage(error, "Could not reorder the slides."));
      }
    },
    [slides],
  );

  const remove = React.useCallback(async (id: number) => {
    setIsSaving(true);
    try {
      await carouselService.remove(id);
      setSlides((current) => current.filter((slide) => slide.id !== id));
      toast.success("Slide deleted.");
      return true;
    } catch (error) {
      toast.error(getApiErrorMessage(error, "Could not delete that slide."));
      return false;
    } finally {
      setIsSaving(false);
    }
  }, []);

  return { slides, isLoading, isSaving, move, remove };
}
