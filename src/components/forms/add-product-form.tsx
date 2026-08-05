"use client";

import { ImagePlus, Plus, Trash2, X } from "lucide-react";
import Image from "next/image";
import * as React from "react";
import { toast } from "sonner";

import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { RequiredMark } from "@/components/ui/required-mark";
import { Switch } from "@/components/ui/switch";
import { Textarea } from "@/components/ui/textarea";
import {
  emptyVariant,
  PRODUCT_SECTIONS,
  VARIANT_FIELDS,
} from "@/constants/product";
import { useAddProduct } from "@/hooks/use-add-product";
import { cn } from "@/lib/utils";
import type {
  ProductDraft,
  ProductDraftErrors,
  ProductVariantDraft,
} from "@/types/product.types";

interface ImageDraft {
  key: string;
  file: File;
  previewUrl: string;
}

const FIELD_CLASS = "h-11 rounded-none";
const SECTION_CARD_CLASS = "rounded-none border-border shadow-none";

function initialDraft(variantKey?: string): ProductDraft {
  return {
    product_name: "",
    category: "",
    sub_category: "",
    made_in: "",
    rating: "",
    is_hot_sale: false,
    description: "",
    care_instruction: "",
    usage_instruction: "",
    variants: [emptyVariant(variantKey)],
  };
}

function validate(draft: ProductDraft): ProductDraftErrors {
  const errors: ProductDraftErrors = {};

  if (!draft.product_name.trim()) {
    errors.product_name = "Product name is required.";
  }

  const rating = Number(draft.rating);
  if (draft.rating && (Number.isNaN(rating) || rating < 0 || rating > 5)) {
    errors.rating = "Rating must be between 0 and 5.";
  }

  // Mirrors the backend rule: a product cannot be saved without a variant.
  const usable = draft.variants.filter(
    (variant) => variant.size.trim() || variant.price.trim(),
  );
  if (usable.length === 0) {
    errors.variants = "Add at least one variant with a size or a price.";
  }

  return errors;
}

export function AddProductForm() {
  // useId is stable across server render and hydration, unlike a random uuid.
  const formId = React.useId();
  const [draft, setDraft] = React.useState<ProductDraft>(() =>
    initialDraft(`${formId}-variant-0`),
  );
  const [images, setImages] = React.useState<ImageDraft[]>([]);
  const [errors, setErrors] = React.useState<ProductDraftErrors>({});
  const fileInputRef = React.useRef<HTMLInputElement>(null);
  const { submit, reset, isSubmitting, error, fieldErrors } = useAddProduct();

  // Object URLs must be released or the blobs leak for the page's lifetime.
  React.useEffect(() => {
    return () => {
      images.forEach((image) => URL.revokeObjectURL(image.previewUrl));
    };
  }, [images]);

  function setField<K extends keyof ProductDraft>(
    field: K,
    value: ProductDraft[K],
  ) {
    setDraft((previous) => ({ ...previous, [field]: value }));
    setErrors((previous) => ({ ...previous, [field]: undefined }));
  }

  function setVariantField(
    key: string,
    field: keyof Omit<ProductVariantDraft, "key">,
    value: string,
  ) {
    setDraft((previous) => ({
      ...previous,
      variants: previous.variants.map((variant) =>
        variant.key === key ? { ...variant, [field]: value } : variant,
      ),
    }));
    setErrors((previous) => ({ ...previous, variants: undefined }));
  }

  function addVariant() {
    setDraft((previous) => ({
      ...previous,
      variants: [...previous.variants, emptyVariant()],
    }));
  }

  function removeVariant(key: string) {
    setDraft((previous) => ({
      ...previous,
      // Never drop the last row — the form always needs one to fill in.
      variants:
        previous.variants.length === 1
          ? previous.variants
          : previous.variants.filter((variant) => variant.key !== key),
    }));
  }

  function handleFiles(event: React.ChangeEvent<HTMLInputElement>) {
    const files = Array.from(event.target.files ?? []);
    setImages((previous) => [
      ...previous,
      ...files.map((file) => ({
        key: crypto.randomUUID(),
        file,
        previewUrl: URL.createObjectURL(file),
      })),
    ]);
    // Reset so picking the same file again still fires onChange.
    event.target.value = "";
  }

  function removeImage(key: string) {
    setImages((previous) => {
      previous
        .filter((image) => image.key === key)
        .forEach((image) => URL.revokeObjectURL(image.previewUrl));
      return previous.filter((image) => image.key !== key);
    });
  }

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const nextErrors = validate(draft);
    setErrors(nextErrors);
    if (Object.keys(nextErrors).length > 0) {
      return;
    }

    const product = await submit(
      draft,
      images.map((image) => image.file),
    );
    if (product) {
      handleReset();
      toast.success(`${product.product_name ?? "Product"} was saved`, {
        description: `${product.variants.length} variant(s) and ${product.images.length} image(s) added to the catalogue.`,
      });
    }
  }

  function handleReset() {
    images.forEach((image) => URL.revokeObjectURL(image.previewUrl));
    setImages([]);
    setDraft(initialDraft());
    setErrors({});
    reset();
  }

  return (
    <form onSubmit={handleSubmit} noValidate className="space-y-6">
      {error ? (
        <div
          role="alert"
          className="border border-destructive/30 bg-destructive/10 px-4 py-3 text-sm text-destructive"
        >
          <p>{error}</p>
          {Object.entries(fieldErrors).length > 0 ? (
            <ul className="mt-1 list-inside list-disc">
              {Object.entries(fieldErrors).map(([field, message]) => (
                <li key={field}>
                  {field.replace(/^variants\.\d+\./, "variant ")}: {message}
                </li>
              ))}
            </ul>
          ) : null}
        </div>
      ) : null}

      <Card className={SECTION_CARD_CLASS}>
        <CardHeader>
          <CardTitle className="text-lg text-secondary">
            {PRODUCT_SECTIONS.details.title}
          </CardTitle>
          <CardDescription>
            {PRODUCT_SECTIONS.details.description}
          </CardDescription>
        </CardHeader>
        <CardContent className="grid gap-5 sm:grid-cols-2">
          <div className="space-y-2 sm:col-span-2">
            <Label htmlFor="product_name">
              Product name <RequiredMark />
            </Label>
            <Input
              id="product_name"
              required
              value={draft.product_name}
              onChange={(event) => setField("product_name", event.target.value)}
              placeholder="Ceramic Vase"
              aria-invalid={Boolean(errors.product_name)}
              className={FIELD_CLASS}
            />
            {errors.product_name ? (
              <p className="text-sm text-destructive">{errors.product_name}</p>
            ) : null}
          </div>

          <div className="space-y-2">
            <Label htmlFor="category">Category</Label>
            <Input
              id="category"
              value={draft.category}
              onChange={(event) => setField("category", event.target.value)}
              placeholder="Decor"
              className={FIELD_CLASS}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="sub_category">Sub category</Label>
            <Input
              id="sub_category"
              value={draft.sub_category}
              onChange={(event) => setField("sub_category", event.target.value)}
              placeholder="Vases"
              className={FIELD_CLASS}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="made_in">Made in</Label>
            <Input
              id="made_in"
              value={draft.made_in}
              onChange={(event) => setField("made_in", event.target.value)}
              placeholder="India"
              className={FIELD_CLASS}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="rating">Rating</Label>
            <Input
              id="rating"
              type="number"
              min={0}
              max={5}
              step={0.1}
              value={draft.rating}
              onChange={(event) => setField("rating", event.target.value)}
              placeholder="4.5"
              aria-invalid={Boolean(errors.rating)}
              className={FIELD_CLASS}
            />
            {errors.rating ? (
              <p className="text-sm text-destructive">{errors.rating}</p>
            ) : null}
          </div>

          <div className="flex items-center justify-between border border-border px-4 py-3 sm:col-span-2">
            <div>
              <Label htmlFor="is_hot_sale" className="text-secondary">
                Hot sale
              </Label>
              <p className="text-sm text-muted-foreground">
                Highlight this product in hot-sale collections.
              </p>
            </div>
            <Switch
              id="is_hot_sale"
              checked={draft.is_hot_sale}
              onCheckedChange={(checked) => setField("is_hot_sale", checked)}
            />
          </div>
        </CardContent>
      </Card>

      <Card className={SECTION_CARD_CLASS}>
        <CardHeader>
          <CardTitle className="text-lg text-secondary">
            {PRODUCT_SECTIONS.content.title}
          </CardTitle>
          <CardDescription>
            {PRODUCT_SECTIONS.content.description}
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-5">
          <div className="space-y-2">
            <Label htmlFor="description">Description</Label>
            <Textarea
              id="description"
              rows={4}
              value={draft.description}
              onChange={(event) => setField("description", event.target.value)}
              placeholder="A hand-glazed stoneware vase finished in matte ivory…"
              className="rounded-none"
            />
          </div>
          <div className="grid gap-5 sm:grid-cols-2">
            <div className="space-y-2">
              <Label htmlFor="care_instruction">Care instructions</Label>
              <Textarea
                id="care_instruction"
                rows={3}
                value={draft.care_instruction}
                onChange={(event) =>
                  setField("care_instruction", event.target.value)
                }
                placeholder="Wipe with a dry cloth. Avoid harsh detergents."
                className="rounded-none"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="usage_instruction">Usage instructions</Label>
              <Textarea
                id="usage_instruction"
                rows={3}
                value={draft.usage_instruction}
                onChange={(event) =>
                  setField("usage_instruction", event.target.value)
                }
                placeholder="Suitable for dried arrangements. Not watertight."
                className="rounded-none"
              />
            </div>
          </div>
        </CardContent>
      </Card>

      <Card className={SECTION_CARD_CLASS}>
        <CardHeader>
          <CardTitle className="text-lg text-secondary">
            {PRODUCT_SECTIONS.media.title}
          </CardTitle>
          <CardDescription>{PRODUCT_SECTIONS.media.description}</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex flex-wrap gap-4">
            {images.map((image, index) => (
              <div
                key={image.key}
                className="group relative size-28 border border-border"
              >
                <Image
                  src={image.previewUrl}
                  alt=""
                  fill
                  unoptimized
                  className="object-cover"
                />
                {index === 0 ? (
                  <span className="absolute top-0 left-0 bg-primary px-1.5 py-0.5 text-[10px] font-bold text-white">
                    THUMBNAIL
                  </span>
                ) : null}
                <button
                  type="button"
                  onClick={() => removeImage(image.key)}
                  aria-label="Remove image"
                  className="absolute -top-2 -right-2 cursor-pointer rounded-full bg-secondary p-1 text-white opacity-0 transition-opacity group-hover:opacity-100 focus-visible:opacity-100"
                >
                  <X className="size-3.5" />
                </button>
              </div>
            ))}

            <button
              type="button"
              onClick={() => fileInputRef.current?.click()}
              className="flex size-28 cursor-pointer flex-col items-center justify-center gap-1 border border-dashed border-border text-muted-foreground transition-colors hover:border-primary hover:text-primary"
            >
              <ImagePlus className="size-6" />
              <span className="text-xs font-medium">Add image</span>
            </button>

            <input
              ref={fileInputRef}
              type="file"
              accept="image/*"
              multiple
              onChange={handleFiles}
              className="hidden"
            />
          </div>
        </CardContent>
      </Card>

      <Card className={SECTION_CARD_CLASS}>
        <CardHeader>
          <CardTitle className="text-lg text-secondary">
            {PRODUCT_SECTIONS.variants.title}
          </CardTitle>
          <CardDescription>
            {PRODUCT_SECTIONS.variants.description}
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          {draft.variants.map((variant, index) => (
            <div key={variant.key} className="border border-border p-4">
              <div className="mb-3 flex items-center justify-between">
                <p className="text-sm font-bold text-secondary">
                  Variant {index + 1}
                </p>
                <button
                  type="button"
                  onClick={() => removeVariant(variant.key)}
                  disabled={draft.variants.length === 1}
                  aria-label={`Remove variant ${index + 1}`}
                  className="cursor-pointer text-muted-foreground transition-colors hover:text-destructive disabled:cursor-not-allowed disabled:opacity-40"
                >
                  <Trash2 className="size-4" />
                </button>
              </div>

              <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
                {VARIANT_FIELDS.map((field) => (
                  <div key={field.name} className="space-y-2">
                    <Label htmlFor={`${variant.key}-${field.name}`}>
                      {field.label}
                    </Label>
                    <Input
                      id={`${variant.key}-${field.name}`}
                      type={field.type}
                      inputMode={field.type === "number" ? "decimal" : undefined}
                      value={variant[field.name]}
                      onChange={(event) =>
                        setVariantField(
                          variant.key,
                          field.name,
                          event.target.value,
                        )
                      }
                      placeholder={field.placeholder}
                      className={FIELD_CLASS}
                    />
                  </div>
                ))}
              </div>
            </div>
          ))}

          {errors.variants ? (
            <p className="text-sm text-destructive">{errors.variants}</p>
          ) : null}

          <Button
            type="button"
            variant="outline"
            onClick={addVariant}
            className={cn(FIELD_CLASS, "cursor-pointer gap-2")}
          >
            <Plus className="size-4" />
            Add another variant
          </Button>
        </CardContent>
      </Card>

      <div className="flex flex-col-reverse gap-3 border-t border-border pt-6 sm:flex-row sm:justify-end">
        <Button
          type="button"
          variant="outline"
          onClick={handleReset}
          disabled={isSubmitting}
          className={cn(FIELD_CLASS, "cursor-pointer px-8")}
        >
          Reset
        </Button>
        <Button
          type="submit"
          disabled={isSubmitting}
          className={cn(
            FIELD_CLASS,
            "relative isolate cursor-pointer overflow-hidden border-sidebar bg-transparent px-10 text-white transition-colors duration-300 hover:bg-transparent hover:text-sidebar before:absolute before:inset-0 before:-z-10 before:bg-sidebar before:transition-transform before:duration-300 before:ease-out hover:before:-translate-x-full",
          )}
        >
          {isSubmitting ? "Saving…" : "Save Product"}
        </Button>
      </div>
    </form>
  );
}
