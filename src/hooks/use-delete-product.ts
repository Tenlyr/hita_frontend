"use client";

import * as React from "react";

import { getApiErrorMessage } from "@/lib/api-error";
import { productService } from "@/services/product.service";

export function useDeleteProduct() {
  const [isDeleting, setIsDeleting] = React.useState(false);
  const [error, setError] = React.useState<string | null>(null);

  const remove = React.useCallback(async (id: number) => {
    setIsDeleting(true);
    setError(null);
    try {
      await productService.remove(id);
      return true;
    } catch (err) {
      setError(getApiErrorMessage(err, "Could not delete this product."));
      return false;
    } finally {
      setIsDeleting(false);
    }
  }, []);

  return { remove, isDeleting, error };
}
