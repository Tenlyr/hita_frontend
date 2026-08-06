import Link from "next/link";

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
import { ADD_PRODUCT_PAGE } from "@/constants/product";
import { APP_ROUTES } from "@/constants/routes";

export const metadata = {
  title: `${ADD_PRODUCT_PAGE.title} — Hitadecor Admin`,
};

export default function AddProductPage() {
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
          <BreadcrumbItem>
            <BreadcrumbPage>{ADD_PRODUCT_PAGE.title}</BreadcrumbPage>
          </BreadcrumbItem>
        </BreadcrumbList>
      </Breadcrumb>

      <header>
        <h1 className="text-2xl font-black text-secondary sm:text-3xl">
          {ADD_PRODUCT_PAGE.title}
        </h1>
        <p className="mt-1 text-sm text-muted-foreground">
          {ADD_PRODUCT_PAGE.description} Fields marked <RequiredMark /> are
          required.
        </p>
      </header>

      <ProductForm />
    </div>
  );
}
