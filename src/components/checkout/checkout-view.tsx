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
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { SweepButton } from "@/components/ui/sweep-button";
import { APP_ROUTES } from "@/constants/routes";
import { useAddresses } from "@/hooks/use-addresses";
import { useCart } from "@/hooks/use-cart";
import { useCheckout, type CheckoutFailure } from "@/hooks/use-checkout";
import { useCustomerSession } from "@/hooks/use-customer-session";
import { getApiErrorMessage } from "@/lib/api-error";
import { formatPrice } from "@/lib/product";
import { cn } from "@/lib/utils";
import { couponService } from "@/services/coupon.service";
import { useAuthDialogStore } from "@/store/auth-dialog.store";
import type { AppliedCoupon } from "@/types/admin.coupon.types";
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

  const [couponCode, setCouponCode] = React.useState("");
  const [coupon, setCoupon] = React.useState<AppliedCoupon | null>(null);
  const [couponError, setCouponError] = React.useState("");
  const [isApplying, setIsApplying] = React.useState(false);

  // Recomputed against the cart as it stands, so editing quantities cannot
  // leave a stale discount on screen.
  const discount = coupon ? Number(coupon.discount) : 0;
  const total = Math.max(0, Number(subtotal) - discount).toFixed(2);

  async function applyCoupon(event: React.FormEvent) {
    event.preventDefault();
    setIsApplying(true);
    setCouponError("");
    try {
      const applied = await couponService.apply(couponCode);
      setCoupon(applied);
      toast.success(`${applied.code} applied — ${applied.label}.`);
    } catch (err) {
      setCoupon(null);
      setCouponError(getApiErrorMessage(err, "That coupon code is not valid."));
    } finally {
      setIsApplying(false);
    }
  }

  function clearCoupon() {
    setCoupon(null);
    setCouponCode("");
    setCouponError("");
  }

  function handlePlaceOrder() {
    if (!selected) {
      toast.error("Add a delivery address to continue.");
      return;
    }
    void pay(selected.id, coupon?.code ?? "");
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
                {line.offer ? (
                  <p className="text-xs font-bold text-primary">
                    {line.offer}
                    {line.original_price ? (
                      <span className="ml-2 font-normal text-muted-foreground line-through">
                        {formatPrice(line.original_price)}
                      </span>
                    ) : null}
                  </p>
                ) : null}
              </div>
              <span className="text-sm font-medium text-secondary">
                {formatPrice(line.line_total)}
              </span>
            </li>
          ))}
        </ul>

        {/* Coupon. Applying only previews the discount — the server works it
            out again when the order is placed. */}
        <div className="mt-6 border-t border-border pt-5">
          {coupon ? (
            <div className="flex items-center justify-between gap-3 border border-primary/30 bg-primary/5 px-3 py-2.5">
              <div className="min-w-0">
                <p className="truncate font-mono text-sm font-bold tracking-wider text-primary">
                  {coupon.code}
                </p>
                <p className="text-xs text-muted-foreground">{coupon.label}</p>
              </div>
              <button
                type="button"
                onClick={clearCoupon}
                className="shrink-0 cursor-pointer text-xs font-semibold text-muted-foreground underline transition-colors hover:text-destructive"
              >
                Remove
              </button>
            </div>
          ) : (
            <form onSubmit={applyCoupon} className="flex gap-2">
              <Input
                value={couponCode}
                onChange={(event) => {
                  setCouponCode(event.target.value.toUpperCase());
                  setCouponError("");
                }}
                placeholder="Coupon code"
                aria-label="Coupon code"
                className="h-11 flex-1 rounded-none font-mono tracking-wider"
              />
              <Button
                type="submit"
                variant="outline"
                disabled={isApplying || !couponCode.trim()}
                className="h-11 shrink-0 cursor-pointer rounded-none"
              >
                {isApplying ? "Checking…" : "Apply"}
              </Button>
            </form>
          )}
          {couponError ? (
            <p className="mt-2 text-xs text-destructive">{couponError}</p>
          ) : null}
        </div>

        <dl className="mt-5 space-y-2 border-t border-border pt-5 text-sm">
          <div className="flex justify-between">
            <dt className="text-muted-foreground">
              Subtotal ({count} item{count === 1 ? "" : "s"})
            </dt>
            <dd className="text-secondary">{formatPrice(subtotal)}</dd>
          </div>
          {discount > 0 ? (
            <div className="flex justify-between">
              <dt className="text-muted-foreground">
                Discount ({coupon?.code})
              </dt>
              <dd className="text-primary">
                −{formatPrice(discount.toFixed(2))}
              </dd>
            </div>
          ) : null}
          <div className="flex justify-between">
            <dt className="text-muted-foreground">Shipping</dt>
            <dd className="font-bold text-primary">Free delivery</dd>
          </div>
        </dl>

        <div className="mt-4 flex items-baseline justify-between border-t border-border pt-4">
          <span className="text-base font-bold text-secondary">Total</span>
          <span className="text-xl font-medium text-primary">
            {formatPrice(total)}
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
