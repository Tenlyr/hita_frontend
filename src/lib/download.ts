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
