"use client";

import { Download, ImageOff, Package } from "lucide-react";
import Image from "next/image";
import * as React from "react";

import { Button } from "@/components/ui/button";
import { SweepButton } from "@/components/ui/sweep-button";
import { APP_ROUTES } from "@/constants/routes";
import { useInvoice } from "@/hooks/use-invoice";
import { formatPrice } from "@/lib/product";
import { cn } from "@/lib/utils";
import { orderService } from "@/services/order.service";
import type { Order, PaymentStatus } from "@/types/customer.order.types";

const STATUS_STYLE: Record<PaymentStatus, { label: string; tone: string }> = {
  paid: { label: "Confirmed", tone: "bg-primary/15 text-primary" },
  created: {
    label: "Awaiting payment",
    tone: "bg-muted text-muted-foreground",
  },
  failed: {
    label: "Payment failed",
    tone: "bg-destructive/10 text-destructive",
  },
};

function formatWhen(value: string | null): string {
  if (!value) return "—";
  return new Date(value).toLocaleDateString("en-IN", {
    day: "numeric",
    month: "short",
    year: "numeric",
  });
}

function OrderCard({ order }: { order: Order }) {
  const { download, downloadingId } = useInvoice();
  const status = STATUS_STYLE[order.payment_status];

  return (
    <article className="border border-border">
      <div className="flex flex-wrap items-center justify-between gap-3 border-b border-border bg-muted/40 px-4 py-3">
        <div>
          <p className="text-sm font-bold tracking-wide text-secondary">
            {order.order_number}
          </p>
          <p className="text-xs text-muted-foreground">
            {formatWhen(order.created_at)} · {order.item_count} item
            {order.item_count === 1 ? "" : "s"}
          </p>
        </div>

        <span
          className={cn(
            "px-2 py-1 text-[10px] font-bold tracking-wide uppercase",
            status.tone,
          )}
        >
          {status.label}
        </span>
      </div>

      <ul className="divide-y divide-border px-4">
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
                {item.size ? `${item.size} · ` : ""}Qty {item.quantity}
              </p>
            </div>

            <span className="text-sm text-secondary">
              {formatPrice(item.line_total)}
            </span>
          </li>
        ))}
      </ul>

      <div className="flex flex-wrap items-center justify-between gap-3 border-t border-border px-4 py-3">
        <p className="text-sm">
          <span className="text-muted-foreground">Total </span>
          <span className="font-bold text-primary">
            {formatPrice(order.total)}
          </span>
        </p>

        {/* Only a paid order has an invoice — the server refuses otherwise. */}
        {order.payment_status === "paid" ? (
          <Button
            type="button"
            variant="outline"
            onClick={() => void download(order.id, order.order_number)}
            disabled={downloadingId === order.id}
            className="h-9 cursor-pointer gap-2 rounded-none text-xs"
          >
            <Download className="size-3.5" />
            {downloadingId === order.id ? "Preparing…" : "Invoice"}
          </Button>
        ) : null}
      </div>
    </article>
  );
}

export function OrdersPanel() {
  const [orders, setOrders] = React.useState<Order[]>([]);
  const [isLoading, setIsLoading] = React.useState(true);

  React.useEffect(() => {
    let cancelled = false;

    async function load() {
      try {
        const result = await orderService.list();
        if (!cancelled) setOrders(result.results);
      } catch {
        if (!cancelled) setOrders([]);
      } finally {
        if (!cancelled) setIsLoading(false);
      }
    }

    void load();
    return () => {
      cancelled = true;
    };
  }, []);

  if (isLoading) {
    return (
      <div className="space-y-4">
        <div className="h-40 animate-pulse bg-muted" />
        <div className="h-40 animate-pulse bg-muted" />
      </div>
    );
  }

  if (orders.length === 0) {
    return (
      <div className="flex flex-col items-center gap-4 py-16 text-center">
        <span className="flex size-16 items-center justify-center rounded-full bg-primary/10">
          <Package className="size-7 text-primary" />
        </span>
        <p className="text-lg font-black text-secondary">No orders yet</p>
        <p className="max-w-sm leading-relaxed text-muted-foreground">
          Once you place an order it will appear here, with its invoice.
        </p>
        <SweepButton
          label="Browse Products"
          href={APP_ROUTES.SHOP.PRODUCTS}
          color="sidebar"
          variant="filled"
          className="mt-2"
        />
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {orders.map((order) => (
        <OrderCard key={order.id} order={order} />
      ))}
    </div>
  );
}
