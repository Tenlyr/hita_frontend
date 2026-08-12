"use client";

import { ImageOff, MapPin } from "lucide-react";
import Image from "next/image";
import { useRouter } from "next/navigation";
import * as React from "react";
import { toast } from "sonner";

import { AddressList } from "@/components/address/address-list";
import {
  OrderFailedDialog,
  type FailureKind,
} from "@/components/checkout/order-failed-dialog";
import { OrderPlacedDialog } from "@/components/checkout/order-placed-dialog";
import { SweepButton } from "@/components/ui/sweep-button";
import { APP_ROUTES } from "@/constants/routes";
import { useAddresses } from "@/hooks/use-addresses";
import { useCart } from "@/hooks/use-cart";
import { useCheckout, type CheckoutFailure } from "@/hooks/use-checkout";
import { useCustomerSession } from "@/hooks/use-customer-session";
import { formatPrice } from "@/lib/product";
import { cn } from "@/lib/utils";
import { useAuthDialogStore } from "@/store/auth-dialog.store";
import type { Order } from "@/types/customer.order.types";

export function CheckoutView() {
  const router = useRouter();
  const {
    user,
    isLoading: isSessionLoading,
    isAuthenticated,
  } = useCustomerSession();
  const openAuthDialog = useAuthDialogStore((state) => state.open);
  const { items, count, isHydrated } = useCart();
  const {
    addresses,
    isLoading: areAddressesLoading,
    isSaving,
    create,
    update,
    remove,
  } = useAddresses();

  const [placed, setPlaced] = React.useState<Order | null>(null);
  const [failure, setFailure] = React.useState<CheckoutFailure | null>(null);
  const { pay, isPaying } = useCheckout({
    onPlaced: setPlaced,
    onFailed: setFailure,
  });
  const [selectedId, setSelectedId] = React.useState<number | null>(null);

  // The default is the selection until the shopper says otherwise. Deriving
  // it beats an effect, which would fight a manual choice on every reload.
  const selected =
    addresses.find((address) => address.id === selectedId) ??
    addresses.find((address) => address.is_default) ??
    addresses[0] ??
    null;

  const subtotal = items
    .reduce((total, line) => total + Number(line.line_total), 0)
    .toFixed(2);

  function handlePlaceOrder() {
    if (!selected) {
      toast.error("Add a delivery address to continue.");
      return;
    }
    void pay(selected.id);
  }

  if (isSessionLoading || !isHydrated) {
    return (
      <div className="grid gap-10 lg:grid-cols-[minmax(0,3fr)_minmax(0,2fr)]">
        <div className="h-72 animate-pulse bg-muted" />
        <div className="h-72 animate-pulse bg-muted" />
      </div>
    );
  }

  if (!isAuthenticated) {
    return (
      <div className="flex flex-col items-center gap-4 py-20 text-center">
        <span className="flex size-16 items-center justify-center rounded-full bg-primary/10">
          <MapPin className="size-7 text-primary" />
        </span>
        <p className="text-xl font-black text-secondary">
          Sign in to check out
        </p>
        <p className="max-w-sm leading-relaxed text-muted-foreground">
          An order needs an account to attach to. Sign in with your mobile
          number — your cart is waiting for you.
        </p>
        <SweepButton
          label="Sign in"
          color="sidebar"
          variant="filled"
          onClick={openAuthDialog}
          className="mt-2"
        />
      </div>
    );
  }

  if (items.length === 0 && !placed) {
    return (
      <div className="flex flex-col items-center gap-4 py-20 text-center">
        <span className="flex size-16 items-center justify-center rounded-full bg-primary/10">
          <MapPin className="size-7 text-primary" />
        </span>
        <p className="text-xl font-black text-secondary">
          There&apos;s nothing to check out
        </p>
        <p className="max-w-sm leading-relaxed text-muted-foreground">
          Add something you love to your cart and come back.
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
    <div className="grid items-start gap-10 lg:grid-cols-[minmax(0,3fr)_minmax(0,2fr)]">
      <AddressList
        addresses={addresses}
        isLoading={areAddressesLoading}
        isSaving={isSaving}
        onCreate={create}
        onUpdate={update}
        onRemove={remove}
        selectedId={selected?.id ?? null}
        onSelect={setSelectedId}
        // The account phone is the sensible starting point, but it stays
        // editable — parcels get sent to relatives and offices.
        defaults={{
          full_name: user?.name ?? "",
          phone_number: user?.phone_number ?? "",
        }}
        heading="Delivery address"
        emptyHint="Add where you'd like this order delivered. You can save as many as you need and pick one each time."
      />

      <section className="bg-muted/60 p-6 sm:p-8 lg:sticky lg:top-28">
        <h2 className="text-xl font-black text-secondary">Order summary</h2>

        <ul className="mt-5 space-y-4">
          {items.map((line) => (
            <li key={line.variant_id} className="flex items-center gap-3">
              <div className="relative size-14 shrink-0 overflow-hidden bg-background">
                {line.image ? (
                  <Image
                    src={line.image}
                    alt={line.product_name ?? "Product"}
                    fill
                    unoptimized
                    sizes="56px"
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
                  {line.product_name ?? "Untitled product"}
                </p>
                <p className="text-xs text-muted-foreground">
                  {line.size ? `${line.size} · ` : ""}Qty {line.quantity}
                </p>
              </div>
              <span className="text-sm font-medium text-secondary">
                {formatPrice(line.line_total)}
              </span>
            </li>
          ))}
        </ul>

        <dl className="mt-6 space-y-2 border-t border-border pt-5 text-sm">
          <div className="flex justify-between">
            <dt className="text-muted-foreground">
              Subtotal ({count} item{count === 1 ? "" : "s"})
            </dt>
            <dd className="text-secondary">{formatPrice(subtotal)}</dd>
          </div>
          <div className="flex justify-between">
            <dt className="text-muted-foreground">Shipping</dt>
            <dd className="font-bold text-primary">Free delivery</dd>
          </div>
        </dl>

        <div className="mt-4 flex items-baseline justify-between border-t border-border pt-4">
          <span className="text-base font-bold text-secondary">Total</span>
          <span className="text-xl font-medium text-primary">
            {formatPrice(subtotal)}
          </span>
        </div>

        <div className="mt-6 flex flex-col gap-2">
          <SweepButton
            label={isPaying ? "Opening payment…" : "Place Order"}
            color="sidebar"
            variant="filled"
            className={cn(
              "w-full",
              (!selected || isPaying) && "pointer-events-none opacity-50",
            )}
            onClick={handlePlaceOrder}
          />
          <SweepButton
            label="Back to Shop"
            color="secondary"
            variant="bordered"
            className="w-full"
            onClick={() => router.push(APP_ROUTES.SHOP.PRODUCTS)}
          />
        </div>

        {!selected ? (
          <p className="mt-3 text-center text-xs text-muted-foreground">
            Choose a delivery address to place your order.
          </p>
        ) : null}
      </section>

      {failure ? (
        <OrderFailedDialog
          kind={failure.kind as FailureKind}
          orderNumber={failure.orderNumber}
          reason={failure.reason}
          open
          onRetry={() => {
            setFailure(null);
            if (selected) void pay(selected.id);
          }}
          // The cart survives a failure, so closing leaves them on checkout
          // rather than pushing them away from a retry.
          onClose={() => setFailure(null)}
        />
      ) : null}

      {placed ? (
        <OrderPlacedDialog
          order={placed}
          open
          // Checkout is empty behind it now, so closing leaves rather than
          // dropping them on a "nothing to check out" page.
          onClose={() => {
            setPlaced(null);
            router.push(APP_ROUTES.SHOP.PRODUCTS);
          }}
        />
      ) : null}
    </div>
  );
}
