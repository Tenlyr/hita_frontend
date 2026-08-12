"use client";

import * as React from "react";

import { getApiErrorMessage } from "@/lib/api-error";
import { invoiceService } from "@/services/invoice.service";
import type { Invoice } from "@/types/admin.invoice.types";

/**
 * One composed invoice, for the edit screen.
 *
 * Named `-detail` because `use-invoice` already belongs to the storefront
 * order receipt download — different document, different endpoint.
 */
export function useInvoiceDetail(id: number | null) {
  const [invoice, setInvoice] = React.useState<Invoice | null>(null);
  const [isLoading, setIsLoading] = React.useState(true);
  const [error, setError] = React.useState<string | null>(null);

  React.useEffect(() => {
    let cancelled = false;

    async function load() {
      if (id === null) {
        if (!cancelled) {
          setError("That invoice id isn't valid.");
          setIsLoading(false);
        }
        return;
      }
      try {
        const result = await invoiceService.detail(id);
        if (!cancelled) setInvoice(result);
      } catch (err) {
        if (!cancelled) {
          setError(getApiErrorMessage(err, "Could not load that invoice."));
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

  return { invoice, isLoading, error };
}
