"use client";

import { Menu, UserRound, X } from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import * as React from "react";

import { SearchDialog } from "@/components/layout/search-dialog";
import { APP_ROUTES } from "@/constants/routes";
import { useCart } from "@/hooks/use-cart";
import { hasCustomerSession } from "@/lib/auth";
import { cn } from "@/lib/utils";
import { useAuthDialogStore } from "@/store/auth-dialog.store";
import { useCartSheetStore } from "@/store/cart-sheet.store";

/** One list for both breakpoints, so the menu and the bar can't drift apart. */
const NAV_LINKS = [
  { label: "Home", href: APP_ROUTES.SHOP.HOME },
  { label: "Products", href: APP_ROUTES.SHOP.PRODUCTS },
  { label: "About Us", href: APP_ROUTES.SHOP.ABOUT },
  { label: "Contact", href: APP_ROUTES.SHOP.CONTACT },
];

export function SiteHeader() {
  const pathname = usePathname();
  const router = useRouter();
  const openCart = useCartSheetStore((state) => state.open);
  const openAuthDialog = useAuthDialogStore((state) => state.open);
  const { count, isHydrated } = useCart();
  const [menuOpen, setMenuOpen] = React.useState(false);
  const [searchOpen, setSearchOpen] = React.useState(false);

  function handleAccount() {
    setMenuOpen(false);
    if (hasCustomerSession()) {
      router.push(APP_ROUTES.SHOP.ACCOUNT);
      return;
    }
    openAuthDialog();
  }

  const linkClass = (href: string) =>
    cn(
      "border-b border-border py-4 text-lg font-semibold transition-colors hover:text-primary",
      pathname === href ? "text-primary" : "text-secondary",
    );

  return (
    <header className="sticky top-0 z-50 border-b border-border bg-background">
      {/* Above the backdrop, so the bar stays lit while the menu is open. */}
      <div className="relative z-10 mx-auto grid max-w-7xl grid-cols-[auto_1fr_auto] items-center gap-4 bg-background px-4 py-4 sm:gap-6 sm:px-6">
        <Link href="/" className="flex items-center">
          <Image
            src="/logo.svg"
            alt="hita"
            width={87}
            height={49}
            priority
            // Trimmed on phones so the logo, icons and menu button fit a
            // 320px viewport without wrapping.
            className="h-9 w-auto sm:h-[49px]"
          />
        </Link>

        <nav className="hidden items-center justify-center gap-8 md:flex">
          {NAV_LINKS.map((link) => {
            const isActive = pathname === link.href;
            return (
              <Link
                key={link.label}
                href={link.href}
                className={cn(
                  "text-lg font-semibold transition-colors hover:text-primary",
                  isActive ? "text-primary" : "text-secondary",
                )}
              >
                {link.label}
              </Link>
            );
          })}
        </nav>

        {/* The icons stay on every breakpoint — cart and account are the two
            things a shopper reaches for most, and burying them behind a menu
            costs a tap each time. Only the links collapse. */}
        <div className="flex items-center gap-4 justify-self-end sm:gap-6 md:gap-8">
          <button
            type="button"
            aria-label="Search"
            onClick={() => setSearchOpen(true)}
            className="cursor-pointer transition-opacity hover:opacity-70"
          >
            <Image
              src="/icons/ic_search.svg"
              alt=""
              width={20}
              height={20}
              className="h-5 w-auto"
            />
          </button>

          <button
            type="button"
            aria-label={count > 0 ? `Cart, ${count} items` : "Cart"}
            onClick={openCart}
            className="relative cursor-pointer transition-opacity hover:opacity-70"
          >
            <Image
              src="/icons/ic_cart.svg"
              alt=""
              width={19}
              height={23}
              className="h-5 w-auto"
            />
            {/* Held back until the persisted cart is read, or the server HTML
                and the first client paint would disagree on the number. */}
            {isHydrated && count > 0 ? (
              <span className="absolute -top-1.5 -right-2 flex size-4 items-center justify-center rounded-full bg-primary text-[10px] font-bold text-white">
                {count > 9 ? "9+" : count}
              </span>
            ) : null}
          </button>

          {/* Signed in goes to the account page; signed out prompts login,
              which beats landing on a page that only says "sign in". */}
          <button
            type="button"
            aria-label="Account"
            onClick={handleAccount}
            className="hidden cursor-pointer text-secondary transition-opacity hover:opacity-70 md:block"
          >
            <UserRound className="size-5" />
          </button>

          {/* Fixed size in both states so opening the menu doesn't nudge the
              icons sideways — only the border and the glyph change. */}
          <button
            type="button"
            aria-label={menuOpen ? "Close menu" : "Open menu"}
            aria-expanded={menuOpen}
            onClick={() => setMenuOpen((open) => !open)}
            className={cn(
              "flex size-10 cursor-pointer items-center justify-center text-secondary transition-colors md:hidden",
              menuOpen ? "border border-primary" : "hover:text-primary",
            )}
          >
            {menuOpen ? <X className="size-6" /> : <Menu className="size-6" />}
          </button>
        </div>
      </div>

      <SearchDialog open={searchOpen} onOpenChange={setSearchOpen} />

      {menuOpen ? (
        <>
          {/* Catches taps outside the panel. Sits below the bar and the panel
              in paint order, so both stay interactive. */}
          <button
            type="button"
            aria-label="Close menu"
            onClick={() => setMenuOpen(false)}
            className="fixed inset-0 cursor-default bg-black/20 md:hidden"
          />

          <nav
            aria-label="Main"
            className="absolute inset-x-0 top-full flex flex-col border-b border-border bg-background px-6 shadow-lg duration-200 animate-in fade-in-0 slide-in-from-top-2 md:hidden"
          >
            {NAV_LINKS.map((link) => (
              <Link
                key={link.label}
                href={link.href}
                onClick={() => setMenuOpen(false)}
                className={linkClass(link.href)}
              >
                {link.label}
              </Link>
            ))}

            {/* Not a link: signed out it opens the login dialog rather than
                landing on a page that only says "sign in". */}
            <button
              type="button"
              onClick={handleAccount}
              className={cn(
                linkClass(APP_ROUTES.SHOP.ACCOUNT),
                "cursor-pointer border-b-0 text-left",
              )}
            >
              Profile
            </button>
          </nav>
        </>
      ) : null}
    </header>
  );
}
