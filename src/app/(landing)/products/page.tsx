import type { ProductSort } from "@/types/customer.product.types";
import { PageBanner } from "@/components/layout/page-banner";
import { ProductGrid } from "@/components/product/product-grid";
import { APP_ROUTES } from "@/constants/routes";

export const metadata = {
  title: "Our Products — Hitadecor",
};

const SORTS: ProductSort[] = [
  "latest",
  "popular",
  "price_low",
  "price_high",
  "name",
];

export default async function ProductsPage({
  searchParams,
}: {
  searchParams: Promise<{
    category?: string;
    search?: string;
    sort?: string;
    in_stock?: string;
  }>;
}) {
  const params = await searchParams;
  const category = params.category?.trim() || undefined;
  const search = params.search?.trim() || undefined;
  // Ignore a hand-edited sort value rather than sending it to the API.
  const sort = SORTS.includes(params.sort as ProductSort)
    ? (params.sort as ProductSort)
    : "popular";
  const inStock = params.in_stock === "true";

  return (
    <>
      {/* A search shows what was typed, so the results are obviously a
          response to it rather than an unexplained subset. */}
      <PageBanner
        title={search ? `“${search}”` : (category ?? "Our Products")}
        crumbs={[
          { label: "Home", href: APP_ROUTES.SHOP.HOME },
          category || search
            ? { label: "Products", href: APP_ROUTES.SHOP.PRODUCTS }
            : { label: "Products" },
          ...(search
            ? [{ label: "Search" }]
            : category
              ? [{ label: category }]
              : []),
        ]}
      />
      {/* key: remount when the params change so the grid re-seeds from them. */}
      <ProductGrid
        key={`${category ?? ""}|${search ?? ""}|${sort}|${inStock}`}
        initialFilters={{
          category,
          search,
          sort,
          in_stock: inStock || undefined,
        }}
      />
    </>
  );
}
