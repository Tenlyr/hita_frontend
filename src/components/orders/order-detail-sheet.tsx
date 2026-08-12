"use client";

import { Download, ImageOff, MapPin, Phone, User } from "lucide-react";
import Image from "next/image";
import * as React from "react";

import {
  OrderStatusBadge,
  PaymentStatusBadge,
} from "@/components/orders/order-status-badge";
import { Button } from "@/components/ui/button";
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet";
import { getApiErrorMessage } from "@/lib/api-error";
import { saveBlob } from "@/lib/download";
import { formatPrice } from "@/lib/product";
import { adminOrderService } from "@/services/order.service";
import type { AdminOrder } from "@/types/admin.order.types";
import { toast } from "sonner";

function formatWhen(value: string | null): string {
  if (!value) return "—";
  return new Date(value).toLocaleString("en-IN", {
    dateStyle: "medium",
    timeStyle: "short",
  });
}

function Row({
  label,
  children,
}: {
  label: string;
  children: React.ReactNode;
}) {
  return (
    <div className="flex justify-between gap-4 py-1.5 text-sm">
      <span className="text-muted-foreground">{label}</span>
      <span className="text-right text-secondary">{children}</span>
    </div>
  );
}

interface OrderDetailSheetProps {
  orderId: number | null;
  onOpenChange: (open: boolean) => void;
}

export function OrderDetailSheet({
  orderId,
  onOpenChange,
}: OrderDetailSheetProps) {
  const [order, setOrder] = React.useState<AdminOrder | null>(null);
  const [isLoading, setIsLoading] = React.useState(false);
  const [isDownloading, setIsDownloading] = React.useState(false);

  React.useEffect(() => {
    if (orderId === null) return;
    let cancelled = false;

    // Every setState sits inside the async function: called synchronously in
    // the effect body it would trigger a cascading render.
    async function load(id: number) {
      setIsLoading(true);
      try {
        // The list rows carry most of this, but only the detail endpoint
        // returns the customer account behind the order.
        const result = await adminOrderService.detail(id);
        if (!cancelled) setOrder(result);
      } catch {
        if (!cancelled) setOrder(null);
      } finally {
        if (!cancelled) setIsLoading(false);
      }
    }

    void load(orderId);
    return () => {
      cancelled = true;
    };
  }, [orderId]);

  async function downloadInvoice() {
    if (!order) return;
    setIsDownloading(true);
    try {
      const blob = await adminOrderService.invoice(order.id);
      saveBlob(blob, `invoice-${order.order_number}.pdf`);
    } catch (error) {
      toast.error(getApiErrorMessage(error, "Could not download the invoice."));
    } finally {
      setIsDownloading(false);
    }
  }

  return (
    <Sheet open={orderId !== null} onOpenChange={onOpenChange}>
      <SheetContent side="right" className="w-full sm:max-w-lg">
        <SheetHeader className="border-b border-border">
          <SheetTitle className="text-lg font-bold text-secondary">
            {order?.order_number ?? "Order"}
          </SheetTitle>
          <SheetDescription>
            {order ? formatWhen(order.created_at) : "Loading…"}
          </SheetDescription>
        </SheetHeader>

        {isLoading || !order ? (
          <div className="space-y-3 p-6">
            <div className="h-6 w-1/2 animate-pulse rounded bg-muted" />
            <div className="h-24 animate-pulse bg-muted" />
            <div className="h-24 animate-pulse bg-muted" />
          </div>
        ) : (
          <div className="flex-1 space-y-6 overflow-y-auto p-6">
            <div className="flex flex-wrap gap-2">
              <OrderStatusBadge status={order.status} />
              <PaymentStatusBadge status={order.payment_status} />
            </div>

            <section>
              <h3 className="text-xs font-bold tracking-wide text-primary uppercase">
                Items
              </h3>
              <ul className="mt-3 divide-y divide-border border-y border-border">
                {order.items.map((item) => (
                  <li key={item.id} className="flex items-center gap-3 py-3">
                    <div className="relative size-12 shrink-0 overflow-hidden bg-muted">
                      {item.image ? (
                        <Image
                          src={item.image}
                          alt={item.product_name}
                          fill
                          unoptimized
                          sizes="48px"
                          className="object-cover"
                        />
                      ) : (
                        <span className="flex size-full items-center justify-center text-muted-foreground">
                          <ImageOff className="size-4" />
                        </span>
                      )}
                    </div>
                    <div className="min-w-0 flex-1">
                      <p className="line-clamp-1 text-sm text-secondary">
                        {item.product_name}
                      </p>
                      <p className="text-xs text-muted-foreground">
                        {item.size ? `${item.size} · ` : ""}
                        {formatPrice(item.unit_price)} × {item.quantity}
                      </p>
                    </div>
                    <span className="text-sm text-secondary">
                      {formatPrice(item.line_total)}
                    </span>
                  </li>
                ))}
              </ul>

              <div className="mt-3">
                <Row label="Subtotal">{formatPrice(order.subtotal)}</Row>
                <Row label="Shipping">
                  {Number(order.shipping) ? (
                    formatPrice(order.shipping)
                  ) : (
                    <span className="font-bold text-primary">Free</span>
                  )}
                </Row>
                <div className="mt-1 flex items-baseline justify-between border-t border-border pt-2">
                  <span className="text-sm font-bold text-secondary">
                    Total
                  </span>
                  <span className="text-lg font-medium text-primary">
                    {formatPrice(order.total)}
                  </span>
                </div>
              </div>
            </section>

            <section>
              <h3 className="text-xs font-bold tracking-wide text-primary uppercase">
                Deliver to
              </h3>
              <div className="mt-3 space-y-2 text-sm text-secondary">
                <p className="flex items-start gap-2">
                  <User className="mt-0.5 size-4 shrink-0 text-muted-foreground" />
                  {order.address.full_name}
                </p>
                <p className="flex items-start gap-2">
                  <MapPin className="mt-0.5 size-4 shrink-0 text-muted-foreground" />
                  <span>
                    {order.address.address_line1}
                    {order.address.address_line2
                      ? `, ${order.address.address_line2}`
                      : ""}
                    , {order.address.city}, {order.address.state}{" "}
                    {order.address.postal_code}
                  </span>
                </p>
                <p className="flex items-start gap-2">
                  <Phone className="mt-0.5 size-4 shrink-0 text-muted-foreground" />
                  <a
                    href={`tel:${order.address.phone_number}`}
                    className="transition-colors hover:text-primary"
                  >
                    {order.address.phone_number}
                  </a>
                </p>
              </div>
            </section>

            <section>
              <h3 className="text-xs font-bold tracking-wide text-primary uppercase">
                Payment
              </h3>
              <div className="mt-2">
                <Row label="Status">{order.payment_status}</Row>
                {order.razorpay_payment_id ? (
                  <Row label="Payment id">
                    <span className="font-mono text-xs">
                      {order.razorpay_payment_id}
                    </span>
                  </Row>
                ) : null}
                {order.paid_at ? (
                  <Row label="Paid at">{formatWhen(order.paid_at)}</Row>
                ) : null}
                {order.customer?.phone_number ? (
                  <Row label="Account">{order.customer.phone_number}</Row>
                ) : null}
              </div>
            </section>

            {order.payment_status === "paid" ? (
              <Button
                type="button"
                variant="outline"
                onClick={() => void downloadInvoice()}
                disabled={isDownloading}
                className="h-10 w-full cursor-pointer gap-2 rounded-none"
              >
                <Download className="size-4" />
                {isDownloading ? "Preparing…" : "Download invoice"}
              </Button>
            ) : null}
          </div>
        )}
      </SheetContent>
    </Sheet>
  );
}
