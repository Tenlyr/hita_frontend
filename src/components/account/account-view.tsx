"use client";

import { Heart, LogOut, MapPin, Package, UserRound } from "lucide-react";
import { useRouter, useSearchParams } from "next/navigation";
import * as React from "react";
import { toast } from "sonner";

import { AddressPanel } from "@/components/account/address-panel";
import { OrdersPanel } from "@/components/account/orders-panel";
import { WishlistPanel } from "@/components/account/wishlist-panel";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { SweepButton } from "@/components/ui/sweep-button";
import { APP_ROUTES } from "@/constants/routes";
import { useCustomerSession } from "@/hooks/use-customer-session";
import { josefinSans } from "@/lib/fonts";
import { cn } from "@/lib/utils";
import { useAuthDialogStore } from "@/store/auth-dialog.store";

type Tab = "orders" | "addresses" | "wishlist";

const TABS = [
  { id: "orders", label: "Orders", icon: Package },
  { id: "addresses", label: "Addresses", icon: MapPin },
  { id: "wishlist", label: "Wishlist", icon: Heart },
] as const satisfies ReadonlyArray<{
  id: Tab;
  label: string;
  icon: typeof MapPin;
}>;

export function AccountView() {
  const router = useRouter();
  const { user, isLoading, isAuthenticated, logout } = useCustomerSession();
  const openAuthDialog = useAuthDialogStore((state) => state.open);
  const [confirmOpen, setConfirmOpen] = React.useState(false);
  const [isLoggingOut, setIsLoggingOut] = React.useState(false);
  // `?tab=` lets the footer link straight to a panel. Orders leads otherwise:
  // it is the reason most people open an account page.
  const searchParams = useSearchParams();
  const requested = searchParams.get("tab");
  const [tab, setTab] = React.useState<Tab>(
    TABS.some((item) => item.id === requested) ? (requested as Tab) : "orders",
  );

  async function handleLogout() {
    setIsLoggingOut(true);
    await logout();
    setIsLoggingOut(false);
    setConfirmOpen(false);
    toast.success("You have been signed out.");
    router.push(APP_ROUTES.SHOP.HOME);
  }

  if (isLoading) {
    return (
      <div className="grid gap-10 lg:grid-cols-[minmax(0,1fr)_minmax(0,3fr)]">
        <div className="h-40 animate-pulse bg-muted" />
        <div className="h-64 animate-pulse bg-muted" />
      </div>
    );
  }

  if (!isAuthenticated) {
    return (
      <div className="flex flex-col items-center gap-4 py-20 text-center">
        <span className="flex size-16 items-center justify-center rounded-full bg-primary/10">
          <UserRound className="size-7 text-primary" />
        </span>
        <p className="text-xl font-black text-secondary">
          You&apos;re not signed in
        </p>
        <p className="max-w-sm leading-relaxed text-muted-foreground">
          Sign in with your mobile number to see your account details.
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

  return (
    <div className="grid gap-10 lg:grid-cols-[minmax(0,1fr)_minmax(0,3fr)]">
      <nav aria-label="Account">
        {TABS.map((item) => (
          <button
            key={item.id}
            type="button"
            onClick={() => setTab(item.id)}
            aria-current={tab === item.id}
            className={cn(
              "flex w-full cursor-pointer items-center gap-3 border-b border-border py-4 text-left text-lg transition-colors",
              tab === item.id
                ? "text-primary"
                : "text-secondary hover:text-primary",
            )}
          >
            <item.icon className="size-5" />
            {item.label}
          </button>
        ))}

        {/* Logout is an action, not a panel, so it sits below the tabs. */}
        <button
          type="button"
          onClick={() => setConfirmOpen(true)}
          className="flex w-full cursor-pointer items-center gap-3 border-b border-border py-4 text-left text-lg text-secondary transition-colors hover:text-primary"
        >
          <LogOut className="size-5" />
          Logout
        </button>
      </nav>

      {/* The panel scrolls inside a bounded box from lg up, so a long orders
          list does not stretch the page and push the nav out of reach. Below
          lg it is left alone — nesting a scroller inside a scrolling page on a
          phone is worse than a long page. */}
      <section className="flex min-h-[300px] flex-col lg:max-h-[calc(100vh-12rem)]">
        {tab === "orders" ? (
          <>
            <h2 className="mb-6 shrink-0 text-xl font-black text-secondary">
              Your orders
            </h2>
            <div className="min-h-0 flex-1 lg:overflow-y-auto lg:pr-2">
              <OrdersPanel />
            </div>
          </>
        ) : tab === "addresses" ? (
          // AddressPanel brings its own heading and Add button.
          <div className="min-h-0 flex-1 lg:overflow-y-auto lg:pr-2">
            <AddressPanel user={user} />
          </div>
        ) : (
          <>
            <h2 className="mb-6 shrink-0 text-xl font-black text-secondary">
              Wishlist
            </h2>
            <div className="min-h-0 flex-1 lg:overflow-y-auto lg:pr-2">
              <WishlistPanel />
            </div>
          </>
        )}
      </section>

      <AlertDialog open={confirmOpen} onOpenChange={setConfirmOpen}>
        <AlertDialogContent
          // Portalled into <body>, so the storefront typeface is set here.
          className={cn(josefinSans.variable, "font-sans rounded-none")}
        >
          <AlertDialogHeader>
            <AlertDialogTitle>Sign out?</AlertDialogTitle>
            <AlertDialogDescription>
              You&apos;ll need your mobile number and an OTP to sign back in.
              Your saved wishlist stays on your account.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel className="cursor-pointer rounded-none">
              Cancel
            </AlertDialogCancel>
            <AlertDialogAction
              onClick={handleLogout}
              disabled={isLoggingOut}
              className="cursor-pointer rounded-none bg-secondary text-white hover:bg-secondary/90"
            >
              {isLoggingOut ? "Signing out…" : "Logout"}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
