"use client";

import type { Product } from "@/types/product.types";
import {
  ChevronLeft,
  ChevronRight,
  ImageOff,
  Pencil,
  Trash2,
} from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";
import * as React from "react";
import { toast } from "sonner";

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
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from "@/components/ui/breadcrumb";
import { Button } from "@/components/ui/button";
import { APP_ROUTES } from "@/constants/routes";
import { useDeleteProduct } from "@/hooks/use-delete-product";
import { useProduct } from "@/hooks/use-product";
import { cn } from "@/lib/utils";

function formatPrice(value: string | null): string {
  if (!value) return "—";
  const amount = Number(value);
  if (Number.isNaN(amount)) return "—";
  return `₹${amount.toLocaleString("en-IN", { minimumFractionDigits: 2 })}`;
}

function dimensions(variant: Product["variants"][number]): string {
  const parts = [
    variant.length_in_cm && `L ${variant.length_in_cm}`,
    variant.width_in_cm && `W ${variant.width_in_cm}`,
    variant.height_in_cm && `H ${variant.height_in_cm}`,
    variant.diameter_in_cm && `⌀ ${variant.diameter_in_cm}`,
  ].filter(Boolean);
  return parts.length > 0 ? `${parts.join(" · ")} cm` : "—";
}

function Field({ label, value }: { label: string; value: string | null }) {
  if (!value) return null;
  return (
    <div>
      <dt className="text-xs font-bold tracking-wide text-muted-foreground uppercase">
        {label}
      </dt>
      <dd className="mt-1 text-sm whitespace-pre-line text-secondary">
        {value}
      </dd>
    </div>
  );
}

/** Remounted per product via `key`, so the index resets without an effect. */
function Gallery({ product }: { product: Product }) {
  const [index, setIndex] = React.useState(0);
  const images = product.images;

  if (images.length === 0) {
    return (
      <div className="flex aspect-square flex-col items-center justify-center gap-2 border border-border bg-muted text-muted-foreground">
        <ImageOff className="size-8" />
        <span className="text-xs">No image</span>
      </div>
    );
  }

  function step(direction: 1 | -1) {
    setIndex(
      (current) => (current + direction + images.length) % images.length,
    );
  }

  return (
    <div className="space-y-3">
      <div className="relative aspect-square overflow-hidden border border-border bg-muted">
        <Image
          key={images[index].id}
          src={images[index].product_image}
          alt={product.product_name ?? "Product image"}
          fill
          unoptimized
          sizes="(max-width: 768px) 100vw, 40vw"
          className="object-cover"
        />
        {images.length > 1 ? (
          <>
            <button
              type="button"
              onClick={() => step(-1)}
              aria-label="Previous image"
              className="absolute top-1/2 left-2 -translate-y-1/2 cursor-pointer rounded-full bg-background/85 p-1.5 text-secondary shadow"
            >
              <ChevronLeft className="size-4" />
            </button>
            <button
              type="button"
              onClick={() => step(1)}
              aria-label="Next image"
              className="absolute top-1/2 right-2 -translate-y-1/2 cursor-pointer rounded-full bg-background/85 p-1.5 text-secondary shadow"
            >
              <ChevronRight className="size-4" />
            </button>
          </>
        ) : null}
      </div>

      {images.length > 1 ? (
        <div className="flex flex-wrap gap-2">
          {images.map((image, thumb) => (
            <button
              key={image.id}
              type="button"
              onClick={() => setIndex(thumb)}
              aria-label={`Show image ${thumb + 1}`}
              className={cn(
                "relative size-14 cursor-pointer overflow-hidden border transition-colors",
                thumb === index ? "border-primary" : "border-border",
              )}
            >
              <Image
                src={image.product_image}
                alt=""
                fill
                unoptimized
                sizes="56px"
                className="object-cover"
              />
            </button>
          ))}
        </div>
      ) : null}
    </div>
  );
}

export function ProductDetailView({ productId }: { productId: number | null }) {
  const router = useRouter();
  const { product, isLoading, error } = useProduct(productId);
  const { remove, isDeleting } = useDeleteProduct();
  const [confirmOpen, setConfirmOpen] = React.useState(false);

  async function handleDelete() {
    if (!product) return;
    const ok = await remove(product.id);
    setConfirmOpen(false);
    if (ok) {
      toast.success(`${product.product_name ?? "Product"} was deleted`);
      router.push(APP_ROUTES.APP.INVENTORY);
    } else {
      toast.error("Could not delete this product. Please try again.");
    }
  }

  const title = isLoading
    ? "Loading…"
    : (product?.product_name ?? "Product not found");

  return (
    <div className="w-full space-y-6">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
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
              <BreadcrumbPage>{title}</BreadcrumbPage>
            </BreadcrumbItem>
          </BreadcrumbList>
        </Breadcrumb>

        {product ? (
          <div className="flex shrink-0 gap-3 *:flex-1 sm:*:flex-none">
            <Button
              // Renders an <a>, so Base UI's native-button assertion is off.
              nativeButton={false}
              render={
                <Link href={`${APP_ROUTES.APP.PRODUCTS}/${product.id}/edit`} />
              }
              variant="outline"
              className="h-9 cursor-pointer gap-2 rounded-none px-4"
            >
              <Pencil className="size-4" />
              Edit
            </Button>
            <Button
              type="button"
              variant="outline"
              onClick={() => setConfirmOpen(true)}
              disabled={isDeleting}
              className="h-9 cursor-pointer gap-2 rounded-none border-destructive/40 px-4 text-destructive hover:bg-destructive/10 hover:text-destructive"
            >
              <Trash2 className="size-4" />
              Delete
            </Button>
          </div>
        ) : null}
      </div>

      {error ? (
        <p
          role="alert"
          className="border border-destructive/30 bg-destructive/10 px-4 py-3 text-sm text-destructive"
        >
          {error}
        </p>
      ) : null}

      {isLoading ? (
        <div className="grid gap-6 md:grid-cols-[minmax(0,2fr)_minmax(0,3fr)]">
          <div className="aspect-square animate-pulse bg-muted" />
          <div className="space-y-3">
            <div className="h-8 w-2/3 animate-pulse rounded bg-muted" />
            <div className="h-4 w-full animate-pulse rounded bg-muted" />
            <div className="h-32 w-full animate-pulse rounded bg-muted" />
          </div>
        </div>
      ) : product ? (
        <>
          <div className="grid gap-6 md:grid-cols-[minmax(0,2fr)_minmax(0,3fr)]">
            <div className="mx-auto w-full max-w-sm md:mx-0 md:max-w-none">
              <Gallery key={product.id} product={product} />
            </div>

            <div className="min-w-0 space-y-5">
              <div>
                {product.is_hot_sale ? (
                  <span className="mb-2 inline-block bg-primary px-2 py-0.5 text-[10px] font-bold tracking-wide text-white">
                    HOT SALE
                  </span>
                ) : null}
                <h1 className="text-xl font-black break-words text-secondary sm:text-2xl lg:text-3xl">
                  {product.product_name ?? "Untitled product"}
                </h1>
                <p className="mt-1 text-sm text-muted-foreground">
                  {[product.category, product.sub_category]
                    .filter(Boolean)
                    .join(" · ") || "Uncategorised"}
                </p>

                <div className="mt-3 flex flex-wrap items-center gap-3">
                  {product.rating ? (
                    <span className="text-sm font-bold text-primary">
                      {product.rating.toFixed(1)} ★
                    </span>
                  ) : null}
                  {product.made_in ? (
                    <span className="text-sm text-muted-foreground">
                      Made in {product.made_in}
                    </span>
                  ) : null}
                </div>
              </div>

              <dl className="space-y-4">
                <Field label="Description" value={product.description} />
                <Field label="Care" value={product.care_instruction} />
                <Field label="Usage" value={product.usage_instruction} />
              </dl>

              <div>
                <h2 className="mb-2 text-xs font-bold tracking-wide text-muted-foreground uppercase">
                  Variants ({product.variants.length})
                </h2>
                <div className="overflow-x-auto border border-border">
                  <table className="w-full text-sm">
                    <thead className="bg-muted text-left">
                      <tr>
                        <th className="px-3 py-2 font-bold">Size</th>
                        <th className="px-3 py-2 font-bold">Price</th>
                        <th className="px-3 py-2 font-bold">Stock</th>
                        <th className="px-3 py-2 font-bold">Dimensions</th>
                        <th className="px-3 py-2 font-bold">Offer</th>
                      </tr>
                    </thead>
                    <tbody>
                      {product.variants.map((variant) => (
                        <tr key={variant.id} className="border-t border-border">
                          <td className="px-3 py-2">{variant.size ?? "—"}</td>
                          <td className="px-3 py-2 font-medium">
                            {formatPrice(variant.price)}
                          </td>
                          <td
                            className={cn(
                              "px-3 py-2",
                              (variant.quantity_available ?? 0) === 0 &&
                                "text-destructive",
                            )}
                          >
                            {variant.quantity_available ?? 0}
                          </td>
                          <td className="px-3 py-2 whitespace-nowrap text-muted-foreground">
                            {dimensions(variant)}
                          </td>
                          <td className="px-3 py-2 whitespace-nowrap">
                            {variant.offer ? (
                              <span className="inline-block bg-primary/10 px-2 py-0.5 text-xs font-bold whitespace-nowrap text-primary">
                                {variant.offer}
                              </span>
                            ) : (
                              "—"
                            )}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          </div>

          <AlertDialog open={confirmOpen} onOpenChange={setConfirmOpen}>
            <AlertDialogContent className="rounded-none">
              <AlertDialogHeader>
                <AlertDialogTitle>Delete this product?</AlertDialogTitle>
                <AlertDialogDescription>
                  {product.product_name ?? "This product"}, its{" "}
                  {product.variants.length} variant(s) and{" "}
                  {product.images.length} image(s) will be removed permanently.
                  This cannot be undone.
                </AlertDialogDescription>
              </AlertDialogHeader>
              <AlertDialogFooter>
                <AlertDialogCancel className="cursor-pointer rounded-none">
                  Cancel
                </AlertDialogCancel>
                <AlertDialogAction
                  onClick={handleDelete}
                  disabled={isDeleting}
                  className="cursor-pointer rounded-none bg-destructive text-white hover:bg-destructive/90"
                >
                  {isDeleting ? "Deleting…" : "Delete"}
                </AlertDialogAction>
              </AlertDialogFooter>
            </AlertDialogContent>
          </AlertDialog>
        </>
      ) : null}
    </div>
  );
}
