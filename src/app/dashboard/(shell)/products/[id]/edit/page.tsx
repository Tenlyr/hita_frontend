"use client";

import Link from "next/link";
import { useParams } from "next/navigation";

import { ProductForm } from "@/components/forms/product-form";
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from "@/components/ui/breadcrumb";
import { RequiredMark } from "@/components/ui/required-mark";
import { APP_ROUTES } from "@/constants/routes";
import { useProduct } from "@/hooks/use-product";

export default function EditProductPage() {
  const params = useParams<{ id: string }>();
  const id = Number(params.id);
  const { product, isLoading, error } = useProduct(
    Number.isNaN(id) ? null : id,
  );

  const title = isLoading
    ? "Loading…"
    : (product?.product_name ?? "Product not found");

  return (
    <div className="w-full space-y-6">
      <Breadcrumb>
        <BreadcrumbList>
          <BreadcrumbItem>
            <BreadcrumbLink render={<Link href={APP_ROUTES.APP.DASHBOARD} />}>
              Dashboard
            </BreadcrumbLink>
          </BreadcrumbItem>
          <BreadcrumbSeparator />
          <BreadcrumbItem>
            <BreadcrumbLink render={<Link href={APP_ROUTES.APP.INVENTORY} />}>
              Inventory
            </BreadcrumbLink>
          </BreadcrumbItem>
          <BreadcrumbSeparator />
          {product ? (
            <>
              <BreadcrumbItem>
                <BreadcrumbLink
                  render={
                    <Link href={`${APP_ROUTES.APP.PRODUCTS}/${product.id}`} />
                  }
                >
                  {title}
                </BreadcrumbLink>
              </BreadcrumbItem>
              <BreadcrumbSeparator />
            </>
          ) : null}
          <BreadcrumbItem>
            <BreadcrumbPage>Edit</BreadcrumbPage>
          </BreadcrumbItem>
        </BreadcrumbList>
      </Breadcrumb>

      <header>
        <h1 className="text-2xl font-black text-secondary sm:text-3xl">
          Edit Product
        </h1>
        <p className="mt-1 text-sm text-muted-foreground">
          Update this listing. Fields marked <RequiredMark /> are required.
        </p>
      </header>

      {error ? (
        <p
          role="alert"
          className="border border-destructive/30 bg-destructive/10 px-4 py-3 text-sm text-destructive"
        >
          {error}
        </p>
      ) : null}

      {isLoading ? (
        <div className="space-y-4">
          <div className="h-40 animate-pulse bg-muted" />
          <div className="h-64 animate-pulse bg-muted" />
        </div>
      ) : product ? (
        // key: remount with fresh state if the product id changes.
        <ProductForm key={product.id} product={product} />
      ) : null}
    </div>
  );
}
