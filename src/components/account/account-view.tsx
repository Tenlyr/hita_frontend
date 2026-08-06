"use client";

import { Heart, LogOut, MapPin, UserRound } from "lucide-react";
import { useRouter } from "next/navigation";
import * as React from "react";
import { toast } from "sonner";

import { AddressPanel } from "@/components/account/address-panel";
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

type Tab = "addresses" | "wishlist";

const TABS = [
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
  const [tab, setTab] = React.useState<Tab>("addresses");

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

      {/* Both panels share a min height so switching tabs doesn't jump the
          page under the cursor. */}
      {tab === "addresses" ? (
        <section className="min-h-[420px]">
          <AddressPanel user={user} />
        </section>
      ) : (
        <section className="min-h-[420px]">
          <h2 className="mb-6 text-xl font-black text-secondary">Wishlist</h2>
          <WishlistPanel />
        </section>
      )}

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
