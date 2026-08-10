"use client";

import { ImageOff, ShoppingBag, Trash2 } from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";

import { QuantityStepper } from "@/components/product/quantity-stepper";
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetFooter,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet";
import { SweepButton } from "@/components/ui/sweep-button";
import { APP_ROUTES } from "@/constants/routes";
import { useCart } from "@/hooks/use-cart";
import { useIsMobile } from "@/hooks/use-mobile";
import { hasCustomerSession } from "@/lib/auth";
import { josefinSans } from "@/lib/fonts";
import { formatPrice } from "@/lib/product";
import { cn } from "@/lib/utils";
import { useAuthDialogStore } from "@/store/auth-dialog.store";
import { useCartSheetStore } from "@/store/cart-sheet.store";
import type { CartLine } from "@/types/customer.cart.types";

function CartRow({
  line,
  onQuantityChange,
  onRemove,
  onNavigate,
}: {
  line: CartLine;
  onQuantityChange: (quantity: number) => void;
  onRemove: () => void;
  onNavigate: () => void;
}) {
  return (
    <li className="flex gap-4 border-b border-border py-4 last:border-b-0">
      <Link
        href={APP_ROUTES.SHOP.product(line.product_id)}
        onClick={onNavigate}
        className="relative size-20 shrink-0 overflow-hidden bg-muted"
      >
        {line.image ? (
          <Image
            src={line.image}
            alt={line.product_name ?? "Product"}
            fill
            unoptimized
            sizes="80px"
            className="object-cover"
          />
        ) : (
          <span className="flex size-full items-center justify-center text-muted-foreground">
            <ImageOff className="size-5" />
          </span>
        )}
      </Link>

      <div className="flex min-w-0 flex-1 flex-col gap-2">
        <div className="flex items-start justify-between gap-2">
          <div className="min-w-0">
            <Link
              href={APP_ROUTES.SHOP.product(line.product_id)}
              onClick={onNavigate}
              className="line-clamp-2 text-sm text-secondary transition-colors hover:text-primary"
            >
              {line.product_name ?? "Untitled product"}
            </Link>
            {line.size ? (
              <p className="mt-0.5 text-xs text-muted-foreground">
                Size: {line.size}
              </p>
            ) : null}
          </div>
          <button
            type="button"
            onClick={onRemove}
            aria-label={`Remove ${line.product_name ?? "item"} from cart`}
            className="shrink-0 cursor-pointer p-1 text-muted-foreground transition-colors hover:text-destructive"
          >
            <Trash2 className="size-4" />
          </button>
        </div>

        <div className="flex items-center justify-between gap-2">
          <QuantityStepper
            value={line.quantity}
            max={Math.max(1, line.quantity_available)}
            onChange={onQuantityChange}
            size="sm"
          />
          <span className="text-sm font-medium text-secondary">
            {formatPrice(line.line_total)}
          </span>
        </div>
      </div>
    </li>
  );
}

export function CartSheet() {
  const isOpen = useCartSheetStore((state) => state.isOpen);
  const setOpen = useCartSheetStore((state) => state.setOpen);
  const close = useCartSheetStore((state) => state.close);
  const openAuthDialog = useAuthDialogStore((state) => state.open);
  const router = useRouter();
  const isMobile = useIsMobile();
  const { items, count, updateQuantity, remove } = useCart();

  // Paise arithmetic lives in the store; this only reads the result.
  const subtotal = items
    .reduce((total, line) => total + Number(line.line_total), 0)
    .toFixed(2);

  function handleCheckout() {
    close();
    // A guest cart can't be checked out — an order needs someone to attach it
    // to. Prompting here beats bouncing them off the checkout page.
    if (!hasCustomerSession()) {
      openAuthDialog();
      return;
    }
    router.push(APP_ROUTES.SHOP.CHECKOUT);
  }

  return (
    <Sheet open={isOpen} onOpenChange={setOpen}>
      <SheetContent
        // A thumb reaches the bottom of a phone far more easily than the far
        // edge of a side drawer, so small screens get a bottom sheet.
        side={isMobile ? "bottom" : "right"}
        // Portalled into <body>, so the storefront typeface is applied here
        // explicitly rather than inherited.
        className={cn(
          josefinSans.variable,
          "font-sans",
          isMobile
            ? // `h-auto` on the bottom variant means the list has nothing to
              // scroll inside — the cap is what makes it scroll instead of
              // running off the top of the screen.
              "max-h-[85vh] w-full max-w-none"
            : "w-full sm:max-w-md",
        )}
      >
        <SheetHeader className="border-b border-border">
          <SheetTitle className="text-xl font-black text-secondary">
            Your Cart
          </SheetTitle>
          <SheetDescription>
            {count > 0
              ? `${count} item${count === 1 ? "" : "s"} ready for checkout.`
              : "Items you add will appear here, ready for checkout."}
          </SheetDescription>
        </SheetHeader>

        {items.length === 0 ? (
          <div className="flex flex-1 flex-col items-center justify-center gap-4 px-6 py-16 text-center">
            <span className="flex size-16 items-center justify-center rounded-full bg-primary/10">
              <ShoppingBag className="size-7 text-primary" />
            </span>
            <p className="text-lg font-black text-secondary">
              Your cart is empty
            </p>
            <p className="max-w-xs leading-relaxed text-muted-foreground">
              Browse our handcrafted pieces and add something you love.
            </p>
          </div>
        ) : (
          <ul className="flex-1 overflow-y-auto px-4">
            {items.map((line) => (
              <CartRow
                key={line.variant_id}
                line={line}
                onQuantityChange={(quantity) =>
                  void updateQuantity(line.variant_id, quantity)
                }
                onRemove={() => void remove(line.variant_id)}
                onNavigate={close}
              />
            ))}
          </ul>
        )}

        <SheetFooter className="gap-4 border-t border-border">
          {items.length > 0 ? (
            <>
              <div className="space-y-1">
                <div className="flex items-baseline justify-between">
                  <span className="text-base font-bold text-secondary">
                    Subtotal
                  </span>
                  <span className="text-lg font-medium text-primary">
                    {formatPrice(subtotal)}
                  </span>
                </div>
                <p className="text-xs text-muted-foreground">
                  Free delivery on every order.
                </p>
              </div>

              {/* Checkout leads, Continue Shopping is the way back out — the
                  filled/bordered pair keeps that order obvious at a glance. */}
              <div className="flex flex-col gap-2">
                <SweepButton
                  label="Checkout"
                  color="sidebar"
                  variant="filled"
                  className="w-full"
                  onClick={handleCheckout}
                />
                <SweepButton
                  label="Continue Shopping"
                  color="secondary"
                  variant="bordered"
                  className="w-full"
                  onClick={close}
                />
              </div>
            </>
          ) : (
            <SweepButton
              label="Browse Products"
              href={APP_ROUTES.SHOP.PRODUCTS}
              color="sidebar"
              variant="filled"
              className="w-full"
              onClick={close}
            />
          )}
        </SheetFooter>
      </SheetContent>
    </Sheet>
  );
}
