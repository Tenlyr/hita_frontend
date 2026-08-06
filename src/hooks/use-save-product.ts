"use client";

import axios from "axios";
import * as React from "react";

import { getApiErrorMessage } from "@/lib/api-error";
import { toProductPayload } from "@/lib/product-payload";
import { productService } from "@/services/product.service";
import type { Product, ProductDraft } from "@/types/product.types";

interface SaveProductState {
  isSubmitting: boolean;
  error: string | null;
  fieldErrors: Record<string, string>;
}

const INITIAL: SaveProductState = {
  isSubmitting: false,
  error: null,
  fieldErrors: {},
};

interface SaveArgs {
  draft: ProductDraft;
  images: File[];
  /** Existing images the user removed. Edit mode only. */
  removedImageIds?: number[];
}

/** Creates a product, or updates it when `productId` is given. */
export function useSaveProduct(productId?: number) {
  const [state, setState] = React.useState<SaveProductState>(INITIAL);

  const save = React.useCallback(
    async ({ draft, images, removedImageIds = [] }: SaveArgs) => {
      setState({ ...INITIAL, isSubmitting: true });
      try {
        const payload = toProductPayload(draft);
        const product =
          productId === undefined
            ? await productService.create(payload, images)
            : await productService.update(
                productId,
                { ...payload, removed_image_ids: removedImageIds },
                images,
              );
        setState(INITIAL);
        return product as Product;
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
    [productId],
  );

  const reset = React.useCallback(() => setState(INITIAL), []);

  return { ...state, save, reset };
}
