import { CustomerAuthDialog } from "@/components/auth/customer-auth-dialog";
import { SiteFooter } from "@/components/layout/site-footer";
import { SiteHeader } from "@/components/layout/site-header";
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
      {/* One shared instance, opened from anywhere via the auth dialog store. */}
      <CustomerAuthDialog />
    </div>
  );
}
