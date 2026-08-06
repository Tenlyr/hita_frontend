import { CheckoutView } from "@/components/checkout/checkout-view";
import { PageBanner } from "@/components/layout/page-banner";
import { APP_ROUTES } from "@/constants/routes";

export const metadata = {
  title: "Checkout — Hitadecor",
};

export default function CheckoutPage() {
  return (
    <>
      <PageBanner
        title="Checkout"
        crumbs={[
          { label: "Home", href: APP_ROUTES.SHOP.HOME },
          { label: "Checkout" },
        ]}
      />

      <div className="mx-auto w-full max-w-7xl px-4 py-12 sm:px-6 sm:py-16">
        <CheckoutView />
      </div>
    </>
  );
}
