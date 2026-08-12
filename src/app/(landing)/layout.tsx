import { CustomerAuthDialog } from "@/components/auth/customer-auth-dialog";
import { CartSheet } from "@/components/cart/cart-sheet";
import { SiteFooter } from "@/components/layout/site-footer";
import { SiteHeader } from "@/components/layout/site-header";
import { Toaster } from "@/components/ui/sonner";
import { josefinSans } from "@/lib/fonts";

export default function LandingLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <div
      className={`${josefinSans.variable} font-sans flex min-h-screen flex-col`}
    >
      <SiteHeader />
      {children}
      <SiteFooter />
      {/* One shared instance each, opened from anywhere via their stores. */}
      <CustomerAuthDialog />
      <CartSheet />

      {/* Bottom-right keeps it clear of the sticky header. Sonner defaults to
          4s, which is long for confirmations the shopper has already watched
          happen — the heart filling, the cart badge moving. */}
      <Toaster
        position="bottom-right"
        duration={2500}
        className={`${josefinSans.variable} font-sans`}
      />
    </div>
  );
}
