"use client";

import type { Product } from "@/types/product.types";
import * as React from "react";

import { getApiErrorMessage } from "@/lib/api-error";
import { productService } from "@/services/product.service";

interface ProductState {
  loadedId: number | null;
  product: Product | null;
  isLoading: boolean;
  error: string | null;
}

const EMPTY: ProductState = {
  loadedId: null,
  product: null,
  isLoading: false,
  error: null,
};

/** Loads one product by id. Pass null to skip fetching (e.g. dialog closed). */
export function useProduct(id: number | null) {
  const [state, setState] = React.useState<ProductState>(EMPTY);

  React.useEffect(() => {
    if (id === null) return;

    let cancelled = false;

    async function load(productId: number) {
      setState({ ...EMPTY, loadedId: productId, isLoading: true });
      try {
        const product = await productService.retrieve(productId);
        if (!cancelled) {
          setState({
            loadedId: productId,
            product,
            isLoading: false,
            error: null,
          });
        }
      } catch (err) {
        if (!cancelled) {
          setState({
            loadedId: productId,
            product: null,
            isLoading: false,
            error: getApiErrorMessage(err, "Could not load this product."),
          });
        }
      }
    }

    void load(id);
    return () => {
      cancelled = true;
    };
  }, [id]);

  if (id === null) {
    return { product: null, isLoading: false, error: null };
  }

  // Until state catches up with `id`, report loading rather than the previous
  // product — otherwise opening a second product flashes the first one.
  const isCurrent = state.loadedId === id;
  return {
    product: isCurrent ? state.product : null,
    isLoading: !isCurrent || state.isLoading,
    error: isCurrent ? state.error : null,
  };
}
