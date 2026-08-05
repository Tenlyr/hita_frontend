"use client";

import axios from "axios";
import * as React from "react";

import { getApiErrorMessage } from "@/lib/api-error";
import { toProductPayload } from "@/lib/product-payload";
import { productService } from "@/services/product.service";
import type { Product, ProductDraft } from "@/types/product.types";

interface AddProductState {
  isSubmitting: boolean;
  error: string | null;
  fieldErrors: Record<string, string>;
  created: Product | null;
}

const INITIAL: AddProductState = {
  isSubmitting: false,
  error: null,
  fieldErrors: {},
  created: null,
};

export function useAddProduct() {
  const [state, setState] = React.useState<AddProductState>(INITIAL);

  const submit = React.useCallback(
    async (draft: ProductDraft, images: File[]) => {
      setState({ ...INITIAL, isSubmitting: true });
      try {
        const product = await productService.create(
          toProductPayload(draft),
          images,
        );
        setState({ ...INITIAL, created: product });
        return product;
      } catch (error) {
        // A 400 carries {field: message} in `data`; anything else is a message.
        const fieldErrors =
          axios.isAxiosError(error) && error.response?.status === 400
            ? ((error.response.data?.data ?? {}) as Record<string, string>)
            : {};

        setState({
          ...INITIAL,
          error: getApiErrorMessage(error, "Could not save the product."),
          fieldErrors,
        });
        return null;
      }
    },
    [],
  );

  const reset = React.useCallback(() => setState(INITIAL), []);

  return { ...state, submit, reset };
}
