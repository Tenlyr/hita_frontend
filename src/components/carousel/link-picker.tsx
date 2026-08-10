"use client";

import { Check, ImageOff, Search } from "lucide-react";
import * as React from "react";

import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { APP_ROUTES } from "@/constants/routes";
import { useCategoryOptions } from "@/hooks/use-category-options";
import { cn } from "@/lib/utils";
import { productService } from "@/services/product.service";
import type { Product } from "@/types/product.types";

const PRODUCT = "__product__";
const CATEGORY = "__category__";
const CUSTOM = "__custom__";

/** Fixed storefront destinations. Product and category resolve to a second step. */
const DESTINATIONS = [
  { value: APP_ROUTES.SHOP.HOME, label: "Home" },
  { value: APP_ROUTES.SHOP.PRODUCTS, label: "All Products" },
  { value: PRODUCT, label: "A product…" },
  { value: CATEGORY, label: "A category…" },
  { value: APP_ROUTES.SHOP.ABOUT, label: "About Us" },
  { value: APP_ROUTES.SHOP.CONTACT, label: "Contact" },
  { value: CUSTOM, label: "Custom URL…" },
];

/* `h-10` alone loses to SelectTrigger's `data-[size=default]:h-8`, which is an
   attribute selector and therefore more specific. */
const TRIGGER_CLASS = "h-10! w-full rounded-none";
const ITEM_CLASS = "py-2.5 rounded-none";

const productHref = (id: number) => `${APP_ROUTES.SHOP.PRODUCTS}/${id}`;
const categoryHref = (name: string) =>
  `${APP_ROUTES.SHOP.PRODUCTS}?category=${encodeURIComponent(name)}`;

/** Which dropdown row a stored url corresponds to. */
function modeFor(url: string): string {
  if (!url) return CUSTOM;
  const fixed = DESTINATIONS.find(
    (option) =>
      option.value !== PRODUCT &&
      option.value !== CATEGORY &&
      option.value !== CUSTOM &&
      option.value === url,
  );
  if (fixed) return fixed.value;
  if (/^\/products\/\d+$/.test(url)) return PRODUCT;
  if (url.startsWith(`${APP_ROUTES.SHOP.PRODUCTS}?category=`)) return CATEGORY;
  return CUSTOM;
}

function productIdFrom(url: string): number | null {
  const match = url.match(/^\/products\/(\d+)$/);
  return match ? Number(match[1]) : null;
}

function categoryFrom(url: string): string {
  const prefix = `${APP_ROUTES.SHOP.PRODUCTS}?category=`;
  return url.startsWith(prefix)
    ? decodeURIComponent(url.slice(prefix.length))
    : "";
}

/** Searchable list of products, so the id never has to be typed by hand. */
function ProductPicker({
  selectedId,
  onSelect,
}: {
  selectedId: number | null;
  onSelect: (product: Product) => void;
}) {
  const [search, setSearch] = React.useState("");
  const [products, setProducts] = React.useState<Product[]>([]);
  const [isLoading, setIsLoading] = React.useState(true);

  React.useEffect(() => {
    let cancelled = false;
    // Let typing settle before hitting the API on every keystroke.
    const timer = window.setTimeout(async () => {
      try {
        const result = await productService.list({
          search: search.trim(),
          page: 1,
          page_size: 20,
        });
        if (!cancelled) setProducts(result.results);
      } catch {
        if (!cancelled) setProducts([]);
      } finally {
        if (!cancelled) setIsLoading(false);
      }
    }, 250);

    return () => {
      cancelled = true;
      window.clearTimeout(timer);
    };
  }, [search]);

  return (
    <div className="space-y-2">
      <div className="relative">
        <Search className="absolute top-1/2 left-3 size-4 -translate-y-1/2 text-muted-foreground" />
        <Input
          value={search}
          onChange={(event) => setSearch(event.target.value)}
          placeholder="Search products"
          className="h-10 rounded-none pl-9"
        />
      </div>

      <div className="max-h-56 overflow-y-auto border border-border">
        {isLoading ? (
          <p className="px-3 py-6 text-center text-xs text-muted-foreground">
            Loading…
          </p>
        ) : products.length === 0 ? (
          <p className="px-3 py-6 text-center text-xs text-muted-foreground">
            No products match “{search}”.
          </p>
        ) : (
          products.map((product) => {
            const image = product.images[0]?.product_image;
            const isSelected = product.id === selectedId;
            return (
              <button
                key={product.id}
                type="button"
                onClick={() => onSelect(product)}
                className={cn(
                  "flex w-full cursor-pointer items-center gap-2 px-2 py-2 text-left text-xs transition-colors",
                  isSelected
                    ? "bg-sidebar text-sidebar-foreground"
                    : "text-secondary hover:bg-muted",
                )}
              >
                <span className="relative size-8 shrink-0 overflow-hidden bg-muted">
                  {image ? (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img
                      src={image}
                      alt=""
                      className="size-full object-cover"
                    />
                  ) : (
                    <span className="flex size-full items-center justify-center text-muted-foreground">
                      <ImageOff className="size-3" />
                    </span>
                  )}
                </span>
                <span className="min-w-0 flex-1 truncate">
                  {product.product_name ?? `Product ${product.id}`}
                </span>
                {isSelected ? <Check className="size-3.5 shrink-0" /> : null}
              </button>
            );
          })
        )}
      </div>
    </div>
  );
}

interface LinkPickerProps {
  url: string;
  isExternal: boolean;
  onChange: (url: string, isExternal: boolean) => void;
}

/**
 * Where a button sends people.
 *
 * A dropdown of real destinations rather than a text field: hand-typed paths
 * are how a banner ends up pointing at `/prodcts`, and a product link needs an
 * id nobody remembers.
 */
export function LinkPicker({ url, isExternal, onChange }: LinkPickerProps) {
  const { categories } = useCategoryOptions();
  const mode = modeFor(url);

  // The dropdown row is derived from the url, so choosing "A product…" has to
  // be remembered until one is picked — otherwise it snaps back to Custom.
  const [pending, setPending] = React.useState<string | null>(null);
  const active = pending ?? mode;

  function choose(next: string) {
    if (next === PRODUCT || next === CATEGORY) {
      setPending(next);
      return;
    }
    setPending(null);
    onChange(next === CUSTOM ? "" : next, false);
  }

  return (
    <div className="space-y-2">
      <Label className="text-xs font-bold text-secondary uppercase">Link</Label>

      <Select
        items={DESTINATIONS}
        value={active}
        onValueChange={(value) => choose(String(value))}
      >
        <SelectTrigger className={TRIGGER_CLASS}>
          <SelectValue />
        </SelectTrigger>
        {/* alignItemWithTrigger defaults to true, which overlays the selected
            row on top of the trigger; false drops the list below. */}
        <SelectContent
          className="rounded-none"
          align="start"
          alignItemWithTrigger={false}
        >
          {DESTINATIONS.map((option) => (
            <SelectItem
              key={option.value}
              value={option.value}
              className={ITEM_CLASS}
            >
              {option.label}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>

      {active === PRODUCT ? (
        <ProductPicker
          selectedId={productIdFrom(url)}
          onSelect={(product) => {
            setPending(null);
            onChange(productHref(product.id), false);
          }}
        />
      ) : null}

      {active === CATEGORY ? (
        <Select
          items={categories.map((name) => ({ value: name, label: name }))}
          value={categoryFrom(url) || undefined}
          onValueChange={(value) => {
            setPending(null);
            onChange(categoryHref(String(value)), false);
          }}
        >
          <SelectTrigger className={TRIGGER_CLASS}>
            <SelectValue placeholder="Choose a category" />
          </SelectTrigger>
          <SelectContent
            className="rounded-none"
            align="start"
            alignItemWithTrigger={false}
          >
            {categories.map((name) => (
              <SelectItem key={name} value={name} className={ITEM_CLASS}>
                {name}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      ) : null}

      {active === CUSTOM ? (
        <Input
          value={url}
          onChange={(event) => {
            const next = event.target.value;
            // A path stays internal; anything with a scheme opens off-site.
            onChange(next, /^https?:\/\//i.test(next));
          }}
          placeholder="https://example.com"
          className="h-10 rounded-none"
        />
      ) : null}

      <p className="text-xs text-muted-foreground">
        {url
          ? isExternal
            ? `Opens ${url} in a new tab.`
            : `Goes to ${url}`
          : "Nothing chosen yet."}
      </p>
    </div>
  );
}
