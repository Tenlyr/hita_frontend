"use client";

import * as React from "react";

import { productService } from "@/services/product.service";

/** Categories already in use, so the same one isn't typed three ways. */
export function useCategoryOptions() {
  const [categories, setCategories] = React.useState<string[]>([]);
  const [subCategories, setSubCategories] = React.useState<string[]>([]);

  React.useEffect(() => {
    let cancelled = false;

    async function load() {
      try {
        const options = await productService.categoryOptions();
        if (cancelled) return;
        setCategories(options.categories);
        setSubCategories(options.sub_categories);
      } catch {
        // Non-critical: the fields still accept free text without suggestions.
      }
    }

    void load();
    return () => {
      cancelled = true;
    };
  }, []);

  /** Re-fetch after a save, so a newly introduced category shows up. */
  const reload = React.useCallback(async () => {
    try {
      const options = await productService.categoryOptions();
      setCategories(options.categories);
      setSubCategories(options.sub_categories);
    } catch {
      // Ignored for the same reason as above.
    }
  }, []);

  /** Keep a just-typed value selectable without waiting for a refetch. */
  const remember = React.useCallback(
    (kind: "category" | "sub_category", value: string) => {
      const trimmed = value.trim();
      if (!trimmed) return;
      const setter = kind === "category" ? setCategories : setSubCategories;
      setter((current) =>
        current.some((item) => item.toLowerCase() === trimmed.toLowerCase())
          ? current
          : [...current, trimmed].sort((a, b) => a.localeCompare(b)),
      );
    },
    [],
  );

  return { categories, subCategories, remember, reload };
}
