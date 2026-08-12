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
import { couponService } from "@/services/coupon.service";
import type { Coupon, CouponType } from "@/types/admin.coupon.types";

const FIELD_CLASS = "h-11 rounded-none";

interface Draft {
  code: string;
  type: CouponType;
  value: string;
  minOrder: string;
  isActive: boolean;
}

function draftFrom(coupon: Coupon | null | undefined): Draft {
  return {
    code: coupon?.code ?? "",
    type: coupon?.discount_type ?? "percent",
    value: coupon ? String(Number(coupon.discount_value)) : "",
    minOrder:
      coupon && Number(coupon.min_order_amount) > 0
        ? String(Number(coupon.min_order_amount))
        : "",
    isActive: coupon?.is_active ?? true,
  };
}

interface CouponSheetProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  coupon?: Coupon | null;
  onSaved: () => void;
}

export function CouponSheet({
  open,
  onOpenChange,
  coupon,
  onSaved,
}: CouponSheetProps) {
  const [draft, setDraft] = React.useState<Draft>(() => draftFrom(coupon));
  const [errors, setErrors] = React.useState<Record<string, string>>({});
  const [isSaving, setIsSaving] = React.useState(false);

  function set<K extends keyof Draft>(field: K, value: Draft[K]) {
    setDraft((current) => ({ ...current, [field]: value }));
    setErrors({});
  }

  async function handleSubmit(event: React.FormEvent) {
    event.preventDefault();
    setIsSaving(true);
    try {
      const payload = {
        code: draft.code,
        discount_type: draft.type,
        discount_value: Number(draft.value) || 0,
        min_order_amount: Number(draft.minOrder) || 0,
        is_active: draft.isActive,
      };
      const saved = coupon
        ? await couponService.update(coupon.id, payload)
        : await couponService.create(payload);
      toast.success(`${saved.code} saved.`);
      onOpenChange(false);
      onSaved();
    } catch (err) {
      const fields = (err as { response?: { data?: { data?: unknown } } })
        ?.response?.data?.data;
      if (fields && typeof fields === "object") {
        setErrors(fields as Record<string, string>);
      }
      toast.error(getApiErrorMessage(err, "Could not save that coupon."));
    } finally {
      setIsSaving(false);
    }
  }

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent side="right" className="w-full sm:max-w-md">
        <SheetHeader className="border-b border-border">
          <SheetTitle className="text-xl font-bold text-secondary">
            {coupon ? "Edit coupon" : "New coupon"}
          </SheetTitle>
          <SheetDescription>
            Shoppers type this code at checkout to take it off their total.
          </SheetDescription>
        </SheetHeader>

        <form onSubmit={handleSubmit} className="flex flex-1 flex-col">
          <div className="flex-1 space-y-5 overflow-y-auto px-4 py-5">
            <div className="space-y-1.5">
              <Label htmlFor="coupon-code" className="text-secondary">
                Coupon code
                <RequiredMark />
              </Label>
              <Input
                id="coupon-code"
                value={draft.code}
                // Uppercased as it is typed, because that is how it is stored
                // and how it will be printed.
                onChange={(event) =>
                  set("code", event.target.value.toUpperCase())
                }
                placeholder="FESTIVE10"
                className={cn(
                  FIELD_CLASS,
                  "font-mono tracking-wider",
                  errors.code && "border-destructive",
                )}
              />
              {errors.code ? (
                <p className="text-xs text-destructive">{errors.code}</p>
              ) : null}
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1.5">
                <Label htmlFor="coupon-type" className="text-secondary">
                  Discount type
                </Label>
                <NativeSelect
                  id="coupon-type"
                  value={draft.type}
                  onChange={(event) =>
                    set("type", event.target.value as CouponType)
                  }
                  className="h-11!"
                >
                  <option value="percent">Percentage</option>
                  <option value="flat">Flat amount</option>
                </NativeSelect>
              </div>

              <div className="space-y-1.5">
                <Label htmlFor="coupon-value" className="text-secondary">
                  {draft.type === "percent" ? "Percentage" : "Amount"}
                  <RequiredMark />
                </Label>
                <div className="flex">
                  <span className="flex h-11 w-10 shrink-0 items-center justify-center border border-r-0 border-border bg-muted text-sm font-semibold text-secondary">
                    {draft.type === "percent" ? "%" : "₹"}
                  </span>
                  <Input
                    id="coupon-value"
                    type="number"
                    min={0}
                    max={draft.type === "percent" ? 100 : undefined}
                    step="0.01"
                    value={draft.value}
                    onChange={(event) => set("value", event.target.value)}
                    placeholder={draft.type === "percent" ? "10" : "500"}
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
              <Label htmlFor="coupon-min" className="text-secondary">
                Minimum order value
                {draft.type === "flat" ? <RequiredMark /> : null}
              </Label>
              <div className="flex">
                <span className="flex h-11 w-10 shrink-0 items-center justify-center border border-r-0 border-border bg-muted text-sm font-semibold text-secondary">
                  ₹
                </span>
                <Input
                  id="coupon-min"
                  type="number"
                  min={0}
                  step="0.01"
                  value={draft.minOrder}
                  onChange={(event) => set("minOrder", event.target.value)}
                  placeholder="0"
                  className={cn(
                    FIELD_CLASS,
                    errors.min_order_amount && "border-destructive",
                  )}
                />
              </div>
              <p className="text-xs text-muted-foreground">
                {draft.type === "flat"
                  ? "Needed for a flat coupon — ₹500 off a ₹400 cart is a giveaway, so the minimum must be at least the amount coming off."
                  : "Optional for a percentage coupon. Leave blank for no minimum."}
              </p>
              {errors.min_order_amount ? (
                <p className="text-xs text-destructive">
                  {errors.min_order_amount}
                </p>
              ) : null}
            </div>

            <div className="flex items-center justify-between border border-border p-4">
              <div className="space-y-0.5">
                <p className="text-sm font-semibold text-secondary">Active</p>
                <p className="text-xs text-muted-foreground">
                  An inactive code is refused at checkout, but kept.
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
              {isSaving ? "Saving…" : coupon ? "Save changes" : "Create coupon"}
            </Button>
          </div>
        </form>
      </SheetContent>
    </Sheet>
  );
}
