import { OffersBoard } from "@/components/offers/offers-board";

export default function OffersPage() {
  return (
    <div className="w-full space-y-6">
      <header>
        <h1 className="text-2xl font-black text-secondary sm:text-3xl">
          Offers &amp; Coupons
        </h1>
        <p className="mt-1 text-sm text-muted-foreground">
          Automatic offers apply themselves; coupons need a code at checkout.
        </p>
      </header>

      <OffersBoard />
    </div>
  );
}
