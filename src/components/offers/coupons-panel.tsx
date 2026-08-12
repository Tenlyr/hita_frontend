"use client";

import { Pencil, Plus, Search, TicketPercent, Trash2 } from "lucide-react";
import * as React from "react";

import { CouponSheet } from "@/components/offers/coupon-sheet";
import { Button } from "@/components/ui/button";
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
import { Input } from "@/components/ui/input";
import { NativeSelect } from "@/components/ui/native-select";
import { Switch } from "@/components/ui/switch";
import { formatPrice } from "@/lib/product";
import { useCoupons } from "@/hooks/use-coupons";
import { cn } from "@/lib/utils";
import type { Coupon } from "@/types/admin.coupon.types";

export function CouponsPanel() {
  const {
    coupons,
    count,
    activeCount,
    page,
    totalPages,
    hasNext,
    hasPrevious,
    isLoading,
    error,
    search,
    setSearch,
    status,
    setStatus,
    setPage,
    busyId,
    toggle,
    remove,
    refresh,
  } = useCoupons();

  const [sheetOpen, setSheetOpen] = React.useState(false);
  const [editing, setEditing] = React.useState<Coupon | null>(null);
  const [pendingDelete, setPendingDelete] = React.useState<Coupon | null>(null);
  // Bumped on every open so the sheet remounts with a fresh draft. Keying on
  // the coupon id instead would carry abandoned edits back into a reopen, and
  // resetting in an effect is the cascading-render pattern this project avoids.
  const [sheetKey, setSheetKey] = React.useState(0);

  function openNew() {
    setEditing(null);
    setSheetKey((n) => n + 1);
    setSheetOpen(true);
  }

  function openEdit(coupon: Coupon) {
    setEditing(coupon);
    setSheetKey((n) => n + 1);
    setSheetOpen(true);
  }

  return (
    <div className="space-y-4 p-6">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
        <div className="relative flex-1">
          <Search className="absolute top-1/2 left-3 size-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            value={search}
            onChange={(event) => setSearch(event.target.value)}
            placeholder="Search coupons"
            aria-label="Search coupons"
            className="h-10 rounded-none pl-9"
          />
        </div>

        <NativeSelect
          value={status}
          onChange={(event) => setStatus(event.target.value as typeof status)}
          aria-label="Filter by status"
          wrapperClassName="w-full sm:w-40"
        >
          <option value="">All statuses</option>
          <option value="active">Active</option>
          <option value="inactive">Inactive</option>
        </NativeSelect>

        <Button
          type="button"
          onClick={openNew}
          className="h-10 shrink-0 cursor-pointer gap-2 rounded-none bg-sidebar text-sidebar-foreground hover:bg-sidebar/90"
        >
          <Plus className="size-4" />
          New coupon
        </Button>
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
        <div className="space-y-3">
          {[0, 1, 2].map((row) => (
            <div key={row} className="h-16 animate-pulse bg-muted" />
          ))}
        </div>
      ) : coupons.length === 0 ? (
        <div className="flex flex-col items-center justify-center gap-3 py-16 text-center">
          <TicketPercent className="size-8 text-muted-foreground" />
          <p className="text-base font-semibold text-secondary">
            {search || status ? "Nothing matches that" : "No coupons yet"}
          </p>
          <p className="max-w-md text-sm text-muted-foreground">
            {search || status
              ? "Try a different search, or clear the status filter."
              : "Automatic price reductions applied at checkout without the shopper typing anything."}
          </p>
        </div>
      ) : (
        <ul className="divide-y divide-border border border-border">
          {coupons.map((coupon) => (
            <li
              key={coupon.id}
              className="flex flex-wrap items-center gap-x-4 gap-y-3 px-4 py-3"
            >
              <div className="min-w-0 flex-1">
                <p className="truncate font-mono font-semibold tracking-wider text-secondary">
                  {coupon.code}
                </p>
                <p className="truncate text-sm text-muted-foreground">
                  <span className="font-semibold text-primary">
                    {coupon.label}
                  </span>
                  {Number(coupon.min_order_amount) > 0
                    ? ` · min ${formatPrice(coupon.min_order_amount)}`
                    : ""}
                </p>
              </div>

              <span
                className={cn(
                  "px-2 py-0.5 text-xs font-bold tracking-wide uppercase",
                  coupon.is_active
                    ? "bg-primary/10 text-primary"
                    : "bg-muted text-muted-foreground",
                )}
              >
                {coupon.is_active ? "Active" : "Inactive"}
              </span>

              <Switch
                checked={coupon.is_active}
                disabled={busyId === coupon.id}
                onCheckedChange={() => void toggle(coupon)}
                aria-label={`${coupon.is_active ? "Deactivate" : "Activate"} ${coupon.code}`}
              />

              <div className="flex items-center gap-1">
                <button
                  type="button"
                  onClick={() => openEdit(coupon)}
                  aria-label={`Edit ${coupon.code}`}
                  className="cursor-pointer p-2 text-muted-foreground transition-colors hover:text-primary"
                >
                  <Pencil className="size-4" />
                </button>
                <button
                  type="button"
                  onClick={() => setPendingDelete(coupon)}
                  aria-label={`Delete ${coupon.code}`}
                  className="cursor-pointer p-2 text-muted-foreground transition-colors hover:text-destructive"
                >
                  <Trash2 className="size-4" />
                </button>
              </div>
            </li>
          ))}
        </ul>
      )}

      {count > 0 ? (
        <div className="flex flex-wrap items-center justify-between gap-3 text-sm text-muted-foreground">
          <p>
            {count} coupon{count === 1 ? "" : "s"} · {activeCount} active
          </p>
          {totalPages > 1 ? (
            <div className="flex items-center gap-2">
              <Button
                type="button"
                variant="outline"
                disabled={!hasPrevious}
                onClick={() => setPage(page - 1)}
                className="h-9 cursor-pointer rounded-none"
              >
                Previous
              </Button>
              <span>
                Page {page} of {totalPages}
              </span>
              <Button
                type="button"
                variant="outline"
                disabled={!hasNext}
                onClick={() => setPage(page + 1)}
                className="h-9 cursor-pointer rounded-none"
              >
                Next
              </Button>
            </div>
          ) : null}
        </div>
      ) : null}

      <CouponSheet
        key={sheetKey}
        open={sheetOpen}
        onOpenChange={setSheetOpen}
        coupon={editing}
        onSaved={refresh}
      />

      <AlertDialog
        open={pendingDelete !== null}
        onOpenChange={(open) => !open && setPendingDelete(null)}
      >
        <AlertDialogContent className="rounded-none">
          <AlertDialogHeader>
            <AlertDialogTitle>Delete this coupon?</AlertDialogTitle>
            <AlertDialogDescription>
              {pendingDelete
                ? `${pendingDelete.code} will be removed. To stop it working instead, turn it inactive — the code is kept.`
                : null}
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel className="cursor-pointer rounded-none">
              Cancel
            </AlertDialogCancel>
            <AlertDialogAction
              onClick={() => {
                if (pendingDelete) void remove(pendingDelete);
                setPendingDelete(null);
              }}
              className="cursor-pointer rounded-none bg-destructive text-white hover:bg-destructive/90"
            >
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
