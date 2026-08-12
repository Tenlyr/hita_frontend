"use client";

import Link from "next/link";
import { useParams } from "next/navigation";

import { InvoiceForm } from "@/components/invoices/invoice-form";
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from "@/components/ui/breadcrumb";
import { APP_ROUTES } from "@/constants/routes";
import { useInvoiceDetail } from "@/hooks/use-invoice-detail";

export default function EditInvoicePage() {
  const params = useParams<{ id: string }>();
  const id = Number(params.id);
  const { invoice, isLoading, error } = useInvoiceDetail(
    Number.isNaN(id) ? null : id,
  );

  return (
    <div className="w-full space-y-6">
      <Breadcrumb>
        <BreadcrumbList>
          <BreadcrumbItem>
            <BreadcrumbLink render={<Link href={APP_ROUTES.APP.DASHBOARD} />}>
              Dashboard
            </BreadcrumbLink>
          </BreadcrumbItem>
          <BreadcrumbSeparator />
          <BreadcrumbItem>
            <BreadcrumbLink render={<Link href={APP_ROUTES.APP.INVOICES} />}>
              Invoices
            </BreadcrumbLink>
          </BreadcrumbItem>
          <BreadcrumbSeparator />
          <BreadcrumbItem>
            <BreadcrumbPage>
              {isLoading
                ? "Loading…"
                : (invoice?.invoice_number ?? "Invoice not found")}
            </BreadcrumbPage>
          </BreadcrumbItem>
        </BreadcrumbList>
      </Breadcrumb>

      <header>
        <h1 className="text-2xl font-black text-secondary sm:text-3xl">
          Edit Invoice
        </h1>
        <p className="mt-1 text-sm text-muted-foreground">
          The PDF is regenerated from these figures every time it&rsquo;s
          downloaded.
        </p>
      </header>

      {error ? (
        <p
          role="alert"
          className="border border-destructive/30 bg-destructive/10 px-4 py-3 text-sm text-destructive"
        >
          {error}
        </p>
      ) : null}

      {isLoading ? (
        <div className="space-y-4">
          <div className="h-40 animate-pulse bg-muted" />
          <div className="h-64 animate-pulse bg-muted" />
        </div>
      ) : invoice ? (
        // key: remount with fresh state if the invoice id changes.
        <InvoiceForm key={invoice.id} invoice={invoice} />
      ) : null}
    </div>
  );
}
