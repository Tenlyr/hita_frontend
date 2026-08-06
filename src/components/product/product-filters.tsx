"use client";

import {
  SORT_LABELS,
  Category,
  ProductQuery,
  ProductSort,
} from "@/types/customer.product.types";
import * as React from "react";

import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { SweepButton } from "@/components/ui/sweep-button";
import { cn } from "@/lib/utils";

/** Base UI Select can't hold "" as a value, so All uses a sentinel. */
const ALL_CATEGORIES = "__all__";

interface ProductFiltersProps {
  categories: Category[];
  /** Currently applied filters, so the button can tell whether anything moved. */
  applied: ProductQuery;
  onApply: (filters: ProductQuery) => void;
}

const TRIGGER_CLASS = [
  "h-12! w-full cursor-pointer bg-background! rounded-none border-secondary px-5 text-base text-secondary sm:h-12! sm:w-64",
  // Base UI marks the trigger with data-popup-open while the list is showing.
  "data-popup-open:border-primary data-popup-open:ring-1 data-popup-open:ring-primary/30",
].join(" ");

/**
 * Popup rows default to `py-1 pl-1.5 text-sm rounded-md`, which reads cramped
 * next to the taller trigger. Squared off and given real vertical rhythm.
 */
const ITEM_CLASS =
  "cursor-pointer rounded-none px-4 py-2 text-base text-secondary data-selected:font-bold";

function Field({
  label,
  children,
}: {
  label: string;
  children: React.ReactNode;
}) {
  return (
    <div className="flex flex-1 items-center gap-3 sm:flex-none">
      <span className="shrink-0 text-sm font-bold text-secondary sm:text-base">
        {label}
      </span>
      {children}
    </div>
  );
}

export function ProductFilters({
  categories,
  applied,
  onApply,
}: ProductFiltersProps) {
  // Draft state: nothing takes effect until Apply Filters is pressed.
  const [category, setCategory] = React.useState(
    applied.category ?? ALL_CATEGORIES,
  );
  const [sort, setSort] = React.useState<ProductSort>(
    applied.sort ?? "popular",
  );
  const [inStock, setInStock] = React.useState(applied.in_stock ?? false);

  const isDirty =
    category !== (applied.category ?? ALL_CATEGORIES) ||
    sort !== (applied.sort ?? "popular") ||
    inStock !== (applied.in_stock ?? false);

  // Base UI shows the raw value in the trigger unless Root gets this map.
  const categoryItems: Record<string, React.ReactNode> = {
    [ALL_CATEGORIES]: "All Categories",
    ...Object.fromEntries(
      categories.map((item) => [
        item.name,
        `${item.name} (${item.product_count})`,
      ]),
    ),
  };

  return (
    <div className="flex flex-col gap-4 border-b border-border pb-6 lg:flex-row lg:items-center lg:justify-center">
      <Field label="Choose Category">
        <Select
          items={categoryItems}
          value={category}
          onValueChange={(value) => setCategory(String(value))}
        >
          <SelectTrigger className={TRIGGER_CLASS}>
            <SelectValue />
          </SelectTrigger>
          {/* alignItemWithTrigger defaults to true, which overlays the
              selected row on top of the trigger; false drops the list below. */}
          <SelectContent
            className="rounded-none"
            align="start"
            alignItemWithTrigger={false}
          >
            <SelectItem value={ALL_CATEGORIES} className={ITEM_CLASS}>
              All Categories
            </SelectItem>
            {categories.map((item) => (
              <SelectItem
                key={item.name}
                value={item.name}
                className={ITEM_CLASS}
              >
                {item.name} ({item.product_count})
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </Field>

      <Field label="Sort By">
        <Select
          items={SORT_LABELS}
          value={sort}
          onValueChange={(value) => setSort(value as ProductSort)}
        >
          <SelectTrigger className={TRIGGER_CLASS}>
            <SelectValue />
          </SelectTrigger>
          {/* alignItemWithTrigger defaults to true, which overlays the
              selected row on top of the trigger; false drops the list below. */}
          <SelectContent
            className="rounded-none"
            align="start"
            alignItemWithTrigger={false}
          >
            {Object.entries(SORT_LABELS).map(([value, label]) => (
              <SelectItem key={value} value={value} className={ITEM_CLASS}>
                {label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </Field>

      <label className="flex cursor-pointer items-center gap-2 text-sm text-secondary sm:text-base">
        <input
          type="checkbox"
          checked={inStock}
          onChange={(event) => setInStock(event.target.checked)}
          className="size-4 cursor-pointer accent-[var(--sidebar)]"
        />
        In stock only
      </label>

      <SweepButton
        label="Apply Filters"
        color="sidebar"
        variant="filled"
        onClick={() =>
          onApply({
            category: category === ALL_CATEGORIES ? undefined : category,
            sort,
            in_stock: inStock || undefined,
          })
        }
        className={cn("shrink-0", !isDirty && "opacity-60")}
      />
    </div>
  );
}
