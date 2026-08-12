"use client";

import { AlertTriangle, RotateCcw, XCircle } from "lucide-react";
import Link from "next/link";

import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { APP_ROUTES } from "@/constants/routes";
import { josefinSans } from "@/lib/fonts";
import { cn } from "@/lib/utils";

/**
 * Two very different failures.
 *
 * `failed` is the ordinary one — the gateway declined and no money moved.
 * `unconfirmed` is the frightening one: Razorpay took the payment but we could
 * not verify it, so the customer may well have been charged. Telling them the
 * same thing in both cases would either alarm them needlessly or leave them
 * out of pocket without knowing who to ask.
 */
export type FailureKind = "failed" | "unconfirmed";

interface OrderFailedDialogProps {
  kind: FailureKind;
  orderNumber: string;
  reason?: string;
  open: boolean;
  onRetry: () => void;
  onClose: () => void;
}

export function OrderFailedDialog({
  kind,
  orderNumber,
  reason,
  open,
  onRetry,
  onClose,
}: OrderFailedDialogProps) {
  const isUnconfirmed = kind === "unconfirmed";
  const Icon = isUnconfirmed ? AlertTriangle : XCircle;

  return (
    <Dialog
      open={open}
      onOpenChange={(next) => !next && onClose()}
      // Same reasoning as the success dialog: this is the only place the order
      // number appears, so a stray backdrop click must not close it.
      disablePointerDismissal
    >
      <DialogContent
        className={cn(
          josefinSans.variable,
          "font-sans rounded-none text-center sm:max-w-md",
        )}
        showCloseButton={false}
      >
        <DialogHeader className="items-center">
          <span
            className={cn(
              "flex size-16 items-center justify-center rounded-full",
              isUnconfirmed ? "bg-primary/10" : "bg-destructive/10",
            )}
          >
            <Icon
              className={cn(
                "size-8",
                isUnconfirmed ? "text-primary" : "text-destructive",
              )}
            />
          </span>

          <DialogTitle className="mt-4 text-2xl font-black text-secondary">
            {isUnconfirmed
              ? "We couldn't confirm your payment"
              : "Payment failed"}
          </DialogTitle>

          <DialogDescription className="leading-relaxed">
            {isUnconfirmed
              ? "The payment went through but we couldn't verify it. Don't pay again — quote the order number below and we'll sort it out straight away."
              : "Nothing has been charged, and your cart is exactly as you left it."}
          </DialogDescription>
        </DialogHeader>

        <dl className="mt-2 space-y-2 border-y border-border py-4 text-sm">
          <div className="flex items-center justify-between gap-3">
            <dt className="text-muted-foreground">Order number</dt>
            <dd className="font-bold tracking-wide text-secondary">
              {orderNumber}
            </dd>
          </div>
          {reason ? (
            <div className="flex items-start justify-between gap-3 text-left">
              <dt className="shrink-0 text-muted-foreground">Reason</dt>
              <dd className="text-right text-secondary">{reason}</dd>
            </div>
          ) : null}
        </dl>

        <div className="mt-2 space-y-2">
          {isUnconfirmed ? (
            <Button
              type="button"
              // Renders an <a>, so Base UI's native-button assertion is off.
              nativeButton={false}
              render={<Link href={APP_ROUTES.SHOP.CONTACT} />}
              onClick={onClose}
              className="h-11 w-full cursor-pointer rounded-none bg-sidebar text-sidebar-foreground hover:bg-sidebar/90"
            >
              Contact us
            </Button>
          ) : (
            <Button
              type="button"
              onClick={onRetry}
              className="h-11 w-full cursor-pointer gap-2 rounded-none bg-sidebar text-sidebar-foreground hover:bg-sidebar/90"
            >
              <RotateCcw className="size-4" />
              Try again
            </Button>
          )}

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
