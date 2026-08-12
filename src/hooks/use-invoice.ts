"use client";

import * as React from "react";
import { toast } from "sonner";

import { getApiErrorMessage } from "@/lib/api-error";
import { saveBlob } from "@/lib/download";
import { orderService } from "@/services/order.service";

/** Downloads an order's invoice PDF, tracking which one is in flight. */
export function useInvoice() {
  const [downloadingId, setDownloadingId] = React.useState<number | null>(null);

  const download = React.useCallback(
    async (orderId: number, orderNumber: string) => {
      setDownloadingId(orderId);
      try {
        const blob = await orderService.invoice(orderId);
        saveBlob(blob, `invoice-${orderNumber}.pdf`);
      } catch (error) {
        toast.error(
          getApiErrorMessage(error, "Could not download the invoice."),
        );
      } finally {
        setDownloadingId(null);
      }
    },
    [],
  );

  return { download, downloadingId };
}
