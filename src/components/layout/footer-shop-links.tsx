"use client";

import { useRouter } from "next/navigation";

import { hasCustomerSession } from "@/lib/auth";
import { useAuthDialogStore } from "@/store/auth-dialog.store";
import { useCartSheetStore } from "@/store/cart-sheet.store";

/**
 * Buttons rather than anchors: there is no cart page — the drawer is the cart
 * — and an <a href> that never navigates lies to the browser and to anyone
 * reading the status bar.
 */

export function CartLink({ className }: { className?: string }) {
  const openCart = useCartSheetStore((state) => state.open);

  // No session check. A guest cart is a real cart, and asking someone to sign
  // in before they can look at what they picked is how a basket gets
  // abandoned.
  return (
    <button type="button" onClick={openCart} className={className}>
      Cart
    </button>
  );
}

export function WishlistLink({ className }: { className?: string }) {
  const router = useRouter();
  const openAuthDialog = useAuthDialogStore((state) => state.open);

  function handleClick() {
    // Unlike the cart, a wishlist only exists against an account — there is
    // nothing to show a signed-out visitor.
    if (!hasCustomerSession()) {
      openAuthDialog();
      return;
    }
    router.push("/account?tab=wishlist");
  }

  return (
    <button type="button" onClick={handleClick} className={className}>
      Wishlist
    </button>
  );
}
