"use client";

import * as React from "react";

import { invoiceService } from "@/services/invoice.service";
import type { InvoiceInput } from "@/types/admin.invoice.types";

const DEBOUNCE_MS = 400;

/**
 * A live blob URL for the draft's PDF.
 *
 * The preview is the real renderer output rather than an HTML lookalike, so
 * what you see while typing is exactly what downloads. That costs a round
 * trip, hence the debounce.
 *
 * An empty draft still renders — the header, logo, FROM block and notes are
 * worth seeing before the first line is typed.
 */
export function useInvoicePreview(payload: InvoiceInput, number = "") {
  const [url, setUrl] = React.useState<string | null>(null);
  const [isRendering, setIsRendering] = React.useState(false);

  // Serialising is what makes the effect fire on content, not on identity —
  // `payload` is a fresh object on every keystroke of every other field.
  const key = JSON.stringify(payload);

  // Two blobs stay alive at a time. The pane keeps showing the previous page
  // until the new one has painted, and revoking a URL still on screen blanks
  // the frame to the viewer's own dark background.
  const urlsRef = React.useRef<string[]>([]);

  React.useEffect(() => {
    const controller = new AbortController();
    const draft = JSON.parse(key) as InvoiceInput;

    const timer = setTimeout(async () => {
      setIsRendering(true);
      try {
        const blob = await invoiceService.preview(
          draft,
          number,
          controller.signal,
        );
        const next = URL.createObjectURL(blob);
        urlsRef.current.push(next);
        while (urlsRef.current.length > 2) {
          URL.revokeObjectURL(urlsRef.current.shift()!);
        }
        setUrl(next);
      } catch {
        // Keep the last good render rather than flashing an error state —
        // the next keystroke retries anyway.
      } finally {
        if (!controller.signal.aborted) setIsRendering(false);
      }
    }, DEBOUNCE_MS);

    return () => {
      clearTimeout(timer);
      // Aborting is what keeps the renders ordered: a slow reply for an older
      // draft can never overwrite a newer one.
      controller.abort();
    };
  }, [key, number]);

  React.useEffect(() => {
    const urls = urlsRef.current;
    return () => {
      urls.forEach(URL.revokeObjectURL);
    };
  }, []);

  return { url, isRendering };
}
