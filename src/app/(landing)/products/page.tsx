import { PageBanner } from "@/components/layout/page-banner";
import { ProductGrid } from "@/components/product/product-grid";
import { APP_ROUTES } from "@/constants/routes";

export const metadata = {
  title: "Our Products — Hitadecor",
};

export default function ProductsPage() {
  return (
    <>
      <PageBanner
        title="Our Products"
        crumbs={[
          { label: "Home", href: APP_ROUTES.SHOP.HOME },
          { label: "Products" },
        ]}
      />
      <ProductGrid />
    </>
  );
}
