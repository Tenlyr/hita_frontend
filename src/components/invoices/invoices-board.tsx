"use client";

import {
  Download,
  Printer,
  FileText,
  Pencil,
  Plus,
  Search,
  Trash2,
  X,
} from "lucide-react";
import Link from "next/link";
import * as React from "react";

import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { NativeSelect } from "@/components/ui/native-select";
import { APP_ROUTES } from "@/constants/routes";
import { useInvoices } from "@/hooks/use-invoices";
import { formatPrice } from "@/lib/product";
import { PAGE_SIZES } from "@/types/admin.order.types";
import type { Invoice } from "@/types/admin.invoice.types";

function formatWhen(value: string): string {
  if (!value) return "—";
  return new Date(value).toLocaleDateString("en-IN", {
    day: "numeric",
    month: "short",
    year: "numeric",
  });
}

export function InvoicesBoard() {
  const {
    invoices,
    count,
    page,
    totalPages,
    hasNext,
    hasPrevious,
    isLoading,
    error,
    search,
    setSearch,
    dateFrom,
    dateTo,
    setRange,
    pageSize,
    setPageSize,
    setPage,
    downloadingId,
    download,
    printInvoice,
    remove,
  } = useInvoices();

  const [deleting, setDeleting] = React.useState<Invoice | null>(null);

  async function confirmDelete() {
    if (!deleting) return;
    await remove(deleting);
    setDeleting(null);
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1 className="text-2xl font-black text-secondary sm:text-3xl">
            Invoices
          </h1>
          <p className="mt-1 text-sm text-muted-foreground">
            Composed by hand for bulk and event orders.
          </p>
        </div>

        <Button
          // Renders an <a>, so Base UI's native-button assertion is off.
          nativeButton={false}
          render={<Link href={`${APP_ROUTES.APP.INVOICES}/new`} />}
          className="cursor-pointer gap-2 rounded-none bg-sidebar text-sidebar-foreground hover:bg-sidebar/90"
        >
          <Plus className="size-4" />
          New invoice
        </Button>
      </div>

      {error ? (
        <p
          role="alert"
          className="border border-destructive/30 bg-destructive/10 px-4 py-3 text-sm text-destructive"
        >
          {error}
        </p>
      ) : null}

      {/* Filters, table and pagination are one panel: they are one tool. */}
      <div className="border border-border bg-background">
        <div className="flex flex-col gap-3 border-b border-border p-4 sm:flex-row sm:items-center">
          <div className="relative flex-1">
            <Search className="absolute top-1/2 left-3 size-4 -translate-y-1/2 text-muted-foreground" />
            <Input
              value={search}
              onChange={(event) => setSearch(event.target.value)}
              placeholder="Search number, customer or GSTIN"
              className="h-10 rounded-none bg-background pl-9"
            />
            {search ? (
              <button
                type="button"
                onClick={() => setSearch("")}
                aria-label="Clear search"
                className="absolute top-1/2 right-2 -translate-y-1/2 cursor-pointer p-1 text-muted-foreground transition-colors hover:text-secondary"
              >
                <X className="size-4" />
              </button>
            ) : null}
          </div>

          <div className="flex items-center gap-2">
            <Input
              type="date"
              value={dateFrom}
              max={dateTo || undefined}
              onChange={(event) => setRange(event.target.value, dateTo)}
              aria-label="From date"
              className="h-10 w-40 rounded-none bg-background"
            />
            <span className="text-sm text-muted-foreground">to</span>
            <Input
              type="date"
              value={dateTo}
              min={dateFrom || undefined}
              onChange={(event) => setRange(dateFrom, event.target.value)}
              aria-label="To date"
              className="h-10 w-40 rounded-none bg-background"
            />
          </div>

          <div className="flex items-center gap-2">
            <label
              htmlFor="invoice-page-size"
              className="text-sm whitespace-nowrap text-muted-foreground"
            >
              Rows
            </label>
            <NativeSelect
              id="invoice-page-size"
              value={pageSize}
              onChange={(event) => setPageSize(Number(event.target.value))}
              wrapperClassName="w-24"
            >
              {PAGE_SIZES.map((size) => (
                <option key={size} value={size}>
                  {size}
                </option>
              ))}
            </NativeSelect>
          </div>
        </div>

        {/* Scrolls sideways rather than squeezing seven columns onto a phone. */}
        <div className="overflow-x-auto">
          <table className="w-full min-w-[52rem] border-collapse text-sm">
            <thead>
              <tr className="border-b border-border bg-muted/50 text-left">
                <th className="p-3 font-bold text-secondary">Invoice</th>
                <th className="p-3 font-bold text-secondary">Customer</th>
                <th className="p-3 font-bold text-secondary">Date</th>
                <th className="p-3 text-right font-bold text-secondary">
                  Items
                </th>
                <th className="p-3 text-right font-bold text-secondary">GST</th>
                <th className="p-3 text-right font-bold text-secondary">
                  Total
                </th>
                <th className="p-3 text-right font-bold text-secondary">
                  <span className="sr-only">Actions</span>
                </th>
              </tr>
            </thead>

            <tbody>
              {isLoading ? (
                Array.from({ length: 4 }).map((_, index) => (
                  <tr key={index} className="border-b border-border">
                    <td colSpan={7} className="p-3">
                      <div className="h-6 animate-pulse rounded bg-muted" />
                    </td>
                  </tr>
                ))
              ) : invoices.length === 0 ? (
                <tr>
                  <td colSpan={7}>
                    <div className="flex flex-col items-center gap-3 px-6 py-16 text-center">
                      <span className="flex size-12 items-center justify-center rounded-full bg-primary/10">
                        <FileText className="size-5 text-primary" />
                      </span>
                      <p className="font-bold text-secondary">
                        {search || dateFrom || dateTo
                          ? "Nothing matches those filters"
                          : "No invoices yet"}
                      </p>
                    </div>
                  </td>
                </tr>
              ) : (
                invoices.map((invoice) => (
                  <tr
                    key={invoice.id}
                    className="border-b border-border bg-background last:border-b-0 hover:bg-muted/40"
                  >
                    <td className="p-3 font-medium whitespace-nowrap text-secondary">
                      {invoice.invoice_number}
                    </td>
                    <td className="max-w-56 truncate p-3 text-secondary">
                      {invoice.to_name}
                      {invoice.to_gstin ? (
                        <span className="block text-xs text-muted-foreground">
                          {invoice.to_gstin}
                        </span>
                      ) : null}
                    </td>
                    <td className="p-3 whitespace-nowrap text-muted-foreground">
                      {formatWhen(invoice.invoice_date)}
                    </td>
                    <td className="p-3 text-right text-secondary tabular-nums">
                      {invoice.item_count}
                    </td>
                    <td className="p-3 text-right text-muted-foreground tabular-nums">
                      {Number(invoice.gst_percent)}%
                    </td>
                    <td className="p-3 text-right font-medium text-secondary tabular-nums">
                      {formatPrice(invoice.sub_total)}
                    </td>
                    <td className="p-3">
                      <div className="flex items-center justify-end gap-1">
                        <button
                          type="button"
                          onClick={() => void printInvoice(invoice)}
                          disabled={downloadingId === invoice.id}
                          aria-label={`Print ${invoice.invoice_number}`}
                          title="Print"
                          className="cursor-pointer p-2 text-muted-foreground transition-colors hover:text-primary disabled:opacity-40"
                        >
                          <Printer className="size-4" />
                        </button>
                        <button
                          type="button"
                          onClick={() => void download(invoice)}
                          disabled={downloadingId === invoice.id}
                          aria-label={`Download ${invoice.invoice_number}`}
                          className="cursor-pointer p-2 text-muted-foreground transition-colors hover:text-primary disabled:opacity-40"
                        >
                          <Download className="size-4" />
                        </button>
                        <Link
                          href={`${APP_ROUTES.APP.INVOICES}/${invoice.id}/edit`}
                          aria-label={`Edit ${invoice.invoice_number}`}
                          className="cursor-pointer p-2 text-muted-foreground transition-colors hover:text-primary"
                        >
                          <Pencil className="size-4" />
                        </Link>
                        <button
                          type="button"
                          onClick={() => setDeleting(invoice)}
                          aria-label={`Delete ${invoice.invoice_number}`}
                          className="cursor-pointer p-2 text-muted-foreground transition-colors hover:text-destructive"
                        >
                          <Trash2 className="size-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        {count > 0 ? (
          <div className="flex flex-wrap items-center justify-between gap-3 border-t border-border p-3">
            <p className="text-xs text-muted-foreground tabular-nums">
              Showing {(page - 1) * pageSize + 1}–
              {Math.min(page * pageSize, count)} of {count}
            </p>
            <div className="flex items-center gap-2">
              <Button
                type="button"
                variant="outline"
                disabled={!hasPrevious}
                onClick={() => setPage(page - 1)}
                className="h-8 cursor-pointer rounded-none text-xs"
              >
                Previous
              </Button>
              <span className="text-xs text-muted-foreground tabular-nums">
                {page} / {totalPages}
              </span>
              <Button
                type="button"
                variant="outline"
                disabled={!hasNext}
                onClick={() => setPage(page + 1)}
                className="h-8 cursor-pointer rounded-none text-xs"
              >
                Next
              </Button>
            </div>
          </div>
        ) : null}
      </div>

      <AlertDialog
        open={deleting !== null}
        onOpenChange={(open) => !open && setDeleting(null)}
      >
        <AlertDialogContent className="rounded-none">
          <AlertDialogHeader>
            <AlertDialogTitle>Delete this invoice?</AlertDialogTitle>
            <AlertDialogDescription>
              {deleting
                ? `${deleting.invoice_number} for ${deleting.to_name} will be removed for good.`
                : null}
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel className="cursor-pointer rounded-none">
              Cancel
            </AlertDialogCancel>
            <AlertDialogAction
              onClick={confirmDelete}
              className="cursor-pointer rounded-none bg-destructive text-white hover:bg-destructive/90"
            >
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
