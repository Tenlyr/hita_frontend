"use client";

import type { Product } from "@/types/product.types";
import * as React from "react";

import { getApiErrorMessage } from "@/lib/api-error";
import { productService } from "@/services/product.service";

/** Public product detail by id. Pass null to skip fetching. */
export function useProductDetail(id: number | null) {
  const [product, setProduct] = React.useState<Product | null>(null);
  const [isLoading, setIsLoading] = React.useState(true);
  const [error, setError] = React.useState<string | null>(null);

  React.useEffect(() => {
    if (id === null) return;

    let cancelled = false;

    async function load(productId: number) {
      setIsLoading(true);
      setError(null);
      try {
        const result = await productService.detail(productId);
        if (!cancelled) setProduct(result);
      } catch (err) {
        if (!cancelled) {
          setError(getApiErrorMessage(err, "Could not load this product."));
          setProduct(null);
        }
      } finally {
        if (!cancelled) setIsLoading(false);
      }
    }

    void load(id);
    return () => {
      cancelled = true;
    };
  }, [id]);

  return { product, isLoading, error };
}
