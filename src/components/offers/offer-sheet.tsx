"use client";

import * as React from "react";
import { toast } from "sonner";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { NativeSelect } from "@/components/ui/native-select";
import { RequiredMark } from "@/components/ui/required-mark";
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet";
import { Switch } from "@/components/ui/switch";
import { getApiErrorMessage } from "@/lib/api-error";
import { cn } from "@/lib/utils";
import { offerService } from "@/services/offer.service";
import { productService } from "@/services/product.service";
import type { Product } from "@/types/product.types";
import type { Offer, OfferTarget, OfferType } from "@/types/admin.offer.types";

const FIELD_CLASS = "h-11 rounded-none";

const TARGETS: { value: OfferTarget; label: string; hint: string }[] = [
  {
    value: "product",
    label: "A product",
    hint: "Every variant of one product.",
  },
  {
    value: "variant",
    label: "A single variant",
    hint: "One size only. Overrides a product or category offer.",
  },
  {
    value: "category",
    label: "A category",
    hint: "Every product in it, unless something narrower applies.",
  },
];

interface Draft {
  title: string;
  type: OfferType;
  value: string;
  target: OfferTarget;
  productId: string;
  variantId: string;
  category: string;
  isActive: boolean;
}

function draftFrom(offer: Offer | null | undefined): Draft {
  return {
    title: offer?.title ?? "",
    type: offer?.discount_type ?? "percent",
    value: offer ? String(Number(offer.discount_value)) : "",
    target: offer?.target_type ?? "product",
    productId: offer?.product_id ? String(offer.product_id) : "",
    variantId: offer?.variant_id ? String(offer.variant_id) : "",
    category: offer?.category ?? "",
    isActive: offer?.is_active ?? true,
  };
}

interface OfferSheetProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  /** Absent for a new offer. */
  offer?: Offer | null;
  onSaved: () => void;
}

export function OfferSheet({
  open,
  onOpenChange,
  offer,
  onSaved,
}: OfferSheetProps) {
  const [draft, setDraft] = React.useState<Draft>(() => draftFrom(offer));
  const [errors, setErrors] = React.useState<Record<string, string>>({});
  const [isSaving, setIsSaving] = React.useState(false);

  const [products, setProducts] = React.useState<Product[]>([]);
  const [categories, setCategories] = React.useState<string[]>([]);

  // Targets are picked from what exists, so an offer cannot point at nothing.
  React.useEffect(() => {
    if (!open) return;
    let cancelled = false;

    async function load() {
      try {
        const [list, options] = await Promise.all([
          productService.list({ page_size: 200 }),
          productService.categoryOptions(),
        ]);
        if (cancelled) return;
        setProducts(list.results);
        setCategories(options.categories);
      } catch {
        // The pickers stay empty; the sheet still saves once something is
        // chosen, and the error surfaces on submit rather than on open.
      }
    }

    void load();
    return () => {
      cancelled = true;
    };
  }, [open]);

  function set<K extends keyof Draft>(field: K, value: Draft[K]) {
    setDraft((current) => ({ ...current, [field]: value }));
    setErrors({});
  }

  const selectedProduct = products.find(
    (product) => String(product.id) === draft.productId,
  );
  // For a variant offer the product select only narrows the variant list —
  // it is not what gets saved.
  const variantsOf = selectedProduct?.variants ?? [];
  const targetHint = TARGETS.find((item) => item.value === draft.target)?.hint;

  async function handleSubmit(event: React.FormEvent) {
    event.preventDefault();
    setIsSaving(true);

    try {
      const payload = {
        title: draft.title,
        discount_type: draft.type,
        discount_value: Number(draft.value) || 0,
        target_type: draft.target,
        product_id:
          draft.target === "product" ? Number(draft.productId) || null : null,
        variant_id:
          draft.target === "variant" ? Number(draft.variantId) || null : null,
        category: draft.target === "category" ? draft.category : "",
        is_active: draft.isActive,
      };
      const saved = offer
        ? await offerService.update(offer.id, payload)
        : await offerService.create(payload);
      toast.success(`${saved.title} saved.`);
      onOpenChange(false);
      onSaved();
    } catch (err) {
      const fields = (err as { response?: { data?: { data?: unknown } } })
        ?.response?.data?.data;
      if (fields && typeof fields === "object") {
        setErrors(fields as Record<string, string>);
      }
      toast.error(getApiErrorMessage(err, "Could not save that offer."));
    } finally {
      setIsSaving(false);
    }
  }

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent side="right" className="w-full sm:max-w-md">
        <SheetHeader className="border-b border-border">
          <SheetTitle className="text-xl font-bold text-secondary">
            {offer ? "Edit offer" : "New offer"}
          </SheetTitle>
          <SheetDescription>
            Applied at checkout on its own — shoppers do not type anything.
          </SheetDescription>
        </SheetHeader>

        <form onSubmit={handleSubmit} className="flex flex-1 flex-col">
          <div className="flex-1 space-y-5 overflow-y-auto px-4 py-5">
            <div className="space-y-1.5">
              <Label htmlFor="offer-title" className="text-secondary">
                Offer title
                <RequiredMark />
              </Label>
              <Input
                id="offer-title"
                value={draft.title}
                onChange={(event) => set("title", event.target.value)}
                placeholder="Festive Season Sale"
                className={cn(
                  FIELD_CLASS,
                  errors.title && "border-destructive",
                )}
              />
              {errors.title ? (
                <p className="text-xs text-destructive">{errors.title}</p>
              ) : null}
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1.5">
                <Label htmlFor="offer-type" className="text-secondary">
                  Offer type
                </Label>
                <NativeSelect
                  id="offer-type"
                  value={draft.type}
                  onChange={(event) =>
                    set("type", event.target.value as OfferType)
                  }
                  className="h-11! w-full"
                >
                  <option value="percent">Percentage</option>
                  <option value="flat">Flat amount</option>
                </NativeSelect>
              </div>

              <div className="space-y-1.5">
                <Label htmlFor="offer-value" className="text-secondary">
                  {draft.type === "percent" ? "Percentage" : "Amount"}
                  <RequiredMark />
                </Label>
                <div className="flex">
                  <span className="flex h-11 w-10 shrink-0 items-center justify-center border border-r-0 border-border bg-muted text-sm font-semibold text-secondary">
                    {draft.type === "percent" ? "%" : "₹"}
                  </span>
                  <Input
                    id="offer-value"
                    type="number"
                    min={0}
                    max={draft.type === "percent" ? 100 : undefined}
                    step="0.01"
                    value={draft.value}
                    onChange={(event) => set("value", event.target.value)}
                    placeholder={draft.type === "percent" ? "15" : "500"}
                    className={cn(
                      FIELD_CLASS,
                      errors.discount_value && "border-destructive",
                    )}
                  />
                </div>
              </div>
            </div>
            {errors.discount_value ? (
              <p className="-mt-3 text-xs text-destructive">
                {errors.discount_value}
              </p>
            ) : null}

            <div className="space-y-1.5">
              <Label htmlFor="offer-target" className="text-secondary">
                Applies to
              </Label>
              <NativeSelect
                id="offer-target"
                value={draft.target}
                onChange={(event) =>
                  set("target", event.target.value as OfferTarget)
                }
                className="h-11! w-full"
              >
                {TARGETS.map((item) => (
                  <option key={item.value} value={item.value}>
                    {item.label}
                  </option>
                ))}
              </NativeSelect>
              <p className="text-xs text-muted-foreground">{targetHint}</p>
            </div>

            {draft.target === "category" ? (
              <div className="space-y-1.5">
                <Label htmlFor="offer-category" className="text-secondary">
                  Category
                  <RequiredMark />
                </Label>
                <NativeSelect
                  id="offer-category"
                  value={draft.category}
                  onChange={(event) => set("category", event.target.value)}
                  className={cn(
                    "h-11! w-full",
                    errors.category && "border-destructive",
                  )}
                >
                  <option value="">Choose a category</option>
                  {categories.map((name) => (
                    <option key={name} value={name}>
                      {name}
                    </option>
                  ))}
                </NativeSelect>
                {errors.category ? (
                  <p className="text-xs text-destructive">{errors.category}</p>
                ) : null}
              </div>
            ) : (
              <>
                <div className="space-y-1.5">
                  <Label htmlFor="offer-product" className="text-secondary">
                    Product
                    {draft.target === "product" ? <RequiredMark /> : null}
                  </Label>
                  <NativeSelect
                    id="offer-product"
                    value={draft.productId}
                    onChange={(event) => {
                      // Changing product invalidates whichever variant was
                      // picked from the previous one.
                      setDraft((current) => ({
                        ...current,
                        productId: event.target.value,
                        variantId: "",
                      }));
                      setErrors({});
                    }}
                    className={cn(
                      "h-11! w-full",
                      errors.product_id && "border-destructive",
                    )}
                  >
                    <option value="">Choose a product</option>
                    {products.map((product) => (
                      <option key={product.id} value={product.id}>
                        {product.product_name}
                      </option>
                    ))}
                  </NativeSelect>
                  {errors.product_id ? (
                    <p className="text-xs text-destructive">
                      {errors.product_id}
                    </p>
                  ) : null}
                </div>

                {draft.target === "variant" ? (
                  <div className="space-y-1.5">
                    <Label htmlFor="offer-variant" className="text-secondary">
                      Variant
                      <RequiredMark />
                    </Label>
                    <NativeSelect
                      id="offer-variant"
                      value={draft.variantId}
                      disabled={!draft.productId}
                      onChange={(event) => set("variantId", event.target.value)}
                      className={cn(
                        "h-11! w-full",
                        errors.variant_id && "border-destructive",
                      )}
                    >
                      <option value="">
                        {draft.productId
                          ? "Choose a variant"
                          : "Pick a product first"}
                      </option>
                      {variantsOf.map((variant) => (
                        <option key={variant.id} value={variant.id}>
                          {variant.size || `Variant ${variant.id}`}
                          {variant.price ? ` — ₹${variant.price}` : ""}
                        </option>
                      ))}
                    </NativeSelect>
                    {errors.variant_id ? (
                      <p className="text-xs text-destructive">
                        {errors.variant_id}
                      </p>
                    ) : null}
                  </div>
                ) : null}
              </>
            )}

            <div className="flex items-center justify-between border border-border p-4">
              <div className="space-y-0.5">
                <p className="text-sm font-semibold text-secondary">Active</p>
                <p className="text-xs text-muted-foreground">
                  Inactive offers are kept, not applied — so a sale can be run
                  again.
                </p>
              </div>
              <Switch
                checked={draft.isActive}
                onCheckedChange={(checked) => set("isActive", checked)}
              />
            </div>
          </div>

          <div className="flex items-center justify-end gap-3 border-t border-border px-4 py-4">
            <Button
              type="button"
              variant="outline"
              onClick={() => onOpenChange(false)}
              className="cursor-pointer rounded-none"
            >
              Cancel
            </Button>
            <Button
              type="submit"
              disabled={isSaving}
              className="cursor-pointer rounded-none bg-sidebar text-sidebar-foreground hover:bg-sidebar/90"
            >
              {isSaving ? "Saving…" : offer ? "Save changes" : "Create offer"}
            </Button>
          </div>
        </form>
      </SheetContent>
    </Sheet>
  );
}
