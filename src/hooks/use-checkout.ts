"use client";

import * as React from "react";
import { toast } from "sonner";

import { getApiErrorMessage } from "@/lib/api-error";
import { loadRazorpay, type RazorpaySuccess } from "@/lib/razorpay";
import { orderService } from "@/services/order.service";
import { useCartStore } from "@/store/cart.store";
import type { Order } from "@/types/customer.order.types";

/** Brand gold, so Checkout does not arrive in Razorpay blue. */
const CHECKOUT_THEME = "#BB976D";

/**
 * Place order -> Razorpay Checkout -> verify.
 *
 * The signature is never checked here: the browser is handed it by Razorpay
 * and passes it straight to the server, which is the only side holding the
 * secret needed to confirm it.
 */
export interface CheckoutFailure {
  orderNumber: string;
  reason?: string;
  /** `unconfirmed` means money may have moved — the caller must say so. */
  kind: "failed" | "unconfirmed";
}

export function useCheckout({
  onPlaced,
  onFailed,
}: {
  /** Handed the settled order — the caller decides what to show. */
  onPlaced: (order: Order) => void;
  onFailed: (failure: CheckoutFailure) => void;
}) {
  const [isPaying, setIsPaying] = React.useState(false);

  const pay = React.useCallback(
    async (addressId: number, couponCode = "") => {
      setIsPaying(true);

      const ready = await loadRazorpay();
      if (!ready) {
        setIsPaying(false);
        toast.error("Could not reach the payment provider.", {
          description: "Check your connection and try again.",
        });
        return;
      }

      let created;
      try {
        created = await orderService.create(addressId, couponCode);
      } catch (error) {
        setIsPaying(false);
        toast.error(getApiErrorMessage(error, "Could not start the payment."));
        return;
      }

      const { order, razorpay } = created;

      const checkout = new window.Razorpay!({
        key: razorpay.key_id,
        order_id: razorpay.order_id,
        amount: razorpay.amount,
        currency: razorpay.currency,
        name: razorpay.name,
        description: razorpay.description,
        prefill: razorpay.prefill,
        notes: { order_number: order.order_number },
        theme: { color: CHECKOUT_THEME },

        handler: async (response: RazorpaySuccess) => {
          try {
            const settled = await orderService.verify(order.id, {
              razorpay_order_id: response.razorpay_order_id,
              razorpay_payment_id: response.razorpay_payment_id,
              razorpay_signature: response.razorpay_signature,
            });
            // The server empties the cart on success, so pull the real state
            // back rather than assuming it.
            await useCartStore.getState().hydrate();
            onPlaced(settled);
          } catch (error) {
            // Money may well have left their account, so this must never look
            // like an ordinary failure.
            onFailed({
              orderNumber: order.order_number,
              reason: getApiErrorMessage(error, "Verification failed."),
              kind: "unconfirmed",
            });
          } finally {
            setIsPaying(false);
          }
        },

        modal: {
          // Closing the sheet is not a failure — the order stays pending and
          // they can try again from the same cart.
          ondismiss: () => setIsPaying(false),
        },
      });

      checkout.on("payment.failed", (payload) => {
        const reason =
          payload.error?.description ?? payload.error?.reason ?? undefined;
        void orderService.markFailed(order.id, reason ?? "unknown");
        setIsPaying(false);
        onFailed({ orderNumber: order.order_number, reason, kind: "failed" });
      });

      checkout.open();
    },
    [onPlaced, onFailed],
  );

  return { pay, isPaying };
}
