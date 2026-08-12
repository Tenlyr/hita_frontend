"use client";

import { CheckCircle2, Download, Package } from "lucide-react";
import Link from "next/link";

import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { APP_ROUTES } from "@/constants/routes";
import { josefinSans } from "@/lib/fonts";
import { useInvoice } from "@/hooks/use-invoice";
import { formatPrice } from "@/lib/product";
import { cn } from "@/lib/utils";
import type { Order } from "@/types/customer.order.types";

interface OrderPlacedDialogProps {
  order: Order;
  open: boolean;
  /** Closing leaves checkout — the cart behind it is empty by now. */
  onClose: () => void;
}

export function OrderPlacedDialog({
  order,
  open,
  onClose,
}: OrderPlacedDialogProps) {
  const { download, downloadingId } = useInvoice();
  const isDownloading = downloadingId === order.id;

  return (
    <Dialog
      open={open}
      onOpenChange={(next) => !next && onClose()}
      // A stray click on the backdrop should not dismiss a payment
      // confirmation — this is the one screen carrying the order number.
      disablePointerDismissal
    >
      <DialogContent
        // Portalled into <body>, so the storefront typeface is set here.
        className={cn(
          josefinSans.variable,
          "font-sans rounded-none text-center sm:max-w-md",
        )}
        showCloseButton={false}
      >
        <DialogHeader className="items-center">
          <span className="flex size-16 items-center justify-center rounded-full bg-primary/10">
            <CheckCircle2 className="size-8 text-primary" />
          </span>

          <DialogTitle className="mt-4 text-2xl font-black text-secondary">
            Your order is placed successfully
          </DialogTitle>

          <DialogDescription className="leading-relaxed">
            Thank you — we&apos;re packing it now, and we&apos;ll be in touch
            with delivery details.
          </DialogDescription>
        </DialogHeader>

        <dl className="mt-2 space-y-2 border-y border-border py-4 text-sm">
          <div className="flex items-center justify-between gap-3">
            <dt className="text-muted-foreground">Order number</dt>
            <dd className="font-bold tracking-wide text-secondary">
              {order.order_number}
            </dd>
          </div>
          <div className="flex items-center justify-between gap-3">
            <dt className="text-muted-foreground">
              {order.item_count} item{order.item_count === 1 ? "" : "s"}
            </dt>
            <dd className="font-medium text-primary">
              {formatPrice(order.total)}
            </dd>
          </div>
          {order.razorpay_payment_id ? (
            <div className="flex items-center justify-between gap-3">
              <dt className="text-muted-foreground">Payment</dt>
              {/* The reference a customer quotes to their bank or to us. */}
              <dd className="font-mono text-xs text-secondary">
                {order.razorpay_payment_id}
              </dd>
            </div>
          ) : null}
        </dl>

        <div className="mt-2 space-y-2">
          <Button
            type="button"
            onClick={() => void download(order.id, order.order_number)}
            disabled={isDownloading}
            className="h-11 w-full cursor-pointer gap-2 rounded-none bg-sidebar text-sidebar-foreground hover:bg-sidebar/90"
          >
            <Download className="size-4" />
            {isDownloading ? "Preparing…" : "Download invoice"}
          </Button>

          <Button
            type="button"
            variant="outline"
            // Renders an <a>, so Base UI's native-button assertion is off.
            nativeButton={false}
            render={<Link href={APP_ROUTES.SHOP.ACCOUNT} />}
            onClick={onClose}
            className="h-11 w-full cursor-pointer gap-2 rounded-none"
          >
            <Package className="size-4" />
            View orders
          </Button>

          <button
            type="button"
            onClick={onClose}
            className="w-full cursor-pointer py-2 text-sm font-bold text-secondary underline-offset-4 transition-colors hover:text-primary hover:underline"
          >
            Continue shopping
          </button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
