import { AddProductForm } from "@/components/forms/add-product-form";
import { RequiredMark } from "@/components/ui/required-mark";
import { ADD_PRODUCT_PAGE } from "@/constants/product";

export const metadata = {
  title: `${ADD_PRODUCT_PAGE.title} — Hitadecor Admin`,
};

export default function AddProductPage() {
  return (
    <div className="w-full space-y-6">
      <header>
        <h1 className="text-2xl font-black text-secondary sm:text-3xl">
          {ADD_PRODUCT_PAGE.title}
        </h1>
        <p className="mt-1 text-sm text-muted-foreground">
          {ADD_PRODUCT_PAGE.description} Fields marked <RequiredMark /> are
          required.
        </p>
      </header>

      <AddProductForm />
    </div>
  );
}
