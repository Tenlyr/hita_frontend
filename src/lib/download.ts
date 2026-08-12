/**
 * Saves a blob under a filename.
 *
 * The object URL is revoked straight after: each one pins the whole blob in
 * memory until it is released, and a few invoices adds up.
 */
export function saveBlob(blob: Blob, filename: string): void {
  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.href = url;
  link.download = filename;
  document.body.appendChild(link);
  link.click();
  link.remove();
  URL.revokeObjectURL(url);
}

/**
 * Opens the browser's print dialog on a PDF blob.
 *
 * Printed from a hidden iframe rather than a new tab: a tab would leave the
 * user somewhere to navigate back from, and popup blockers treat it with more
 * suspicion than a same-page frame. If a browser refuses to print the frame,
 * the tab is the fallback rather than a dead button.
 */
export function printBlob(blob: Blob): void {
  const url = URL.createObjectURL(blob);
  const frame = document.createElement("iframe");
  frame.style.cssText =
    "position:fixed;right:0;bottom:0;width:0;height:0;border:0;";
  frame.src = url;

  frame.onload = () => {
    try {
      frame.contentWindow?.focus();
      frame.contentWindow?.print();
    } catch {
      window.open(url, "_blank", "noopener");
    }
    // Revoked late on purpose: releasing the blob while the print dialog is
    // still open blanks its preview.
    window.setTimeout(() => {
      URL.revokeObjectURL(url);
      frame.remove();
    }, 60_000);
  };

  document.body.appendChild(frame);
}
