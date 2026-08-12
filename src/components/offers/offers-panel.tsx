"use client";

import { BadgePercent, Pencil, Plus, Search, Trash2 } from "lucide-react";
import * as React from "react";

import { OfferSheet } from "@/components/offers/offer-sheet";
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
import { useOffers } from "@/hooks/use-offers";
import { cn } from "@/lib/utils";
import type { Offer } from "@/types/admin.offer.types";

export function OffersPanel() {
  const {
    offers,
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
  } = useOffers();

  const [sheetOpen, setSheetOpen] = React.useState(false);
  const [editing, setEditing] = React.useState<Offer | null>(null);
  const [pendingDelete, setPendingDelete] = React.useState<Offer | null>(null);
  // Bumped on every open so the sheet remounts with a fresh draft. Keying on
  // the offer id instead would carry abandoned edits back into a reopen, and
  // resetting in an effect is the cascading-render pattern this project avoids.
  const [sheetKey, setSheetKey] = React.useState(0);

  function openNew() {
    setEditing(null);
    setSheetKey((n) => n + 1);
    setSheetOpen(true);
  }

  function openEdit(offer: Offer) {
    setEditing(offer);
    setSheetKey((n) => n + 1);
    setSheetOpen(true);
  }

  return (
    <div className="space-y-4 p-6">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
        <div className="relative flex-1 sm:min-w-64">
          <Search className="absolute top-1/2 left-3 size-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            value={search}
            onChange={(event) => setSearch(event.target.value)}
            placeholder="Search offers"
            aria-label="Search offers"
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
          New offer
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
      ) : offers.length === 0 ? (
        <div className="flex flex-col items-center justify-center gap-3 py-16 text-center">
          <BadgePercent className="size-8 text-muted-foreground" />
          <p className="text-base font-semibold text-secondary">
            {search || status ? "Nothing matches that" : "No offers yet"}
          </p>
          <p className="max-w-md text-sm text-muted-foreground">
            {search || status
              ? "Try a different search, or clear the status filter."
              : "Automatic price reductions applied at checkout without the shopper typing anything."}
          </p>
        </div>
      ) : (
        <ul className="divide-y divide-border border border-border">
          {offers.map((offer) => (
            <li
              key={offer.id}
              className="flex flex-wrap items-center gap-x-4 gap-y-3 px-4 py-3"
            >
              <div className="min-w-0 flex-1">
                <p className="truncate font-semibold text-secondary">
                  {offer.title}
                </p>
                <p className="truncate text-sm text-muted-foreground">
                  <span className="font-semibold text-primary">
                    {offer.label}
                  </span>
                  {" on "}
                  {offer.target_label}
                </p>
              </div>

              <span
                className={cn(
                  "px-2 py-0.5 text-xs font-bold tracking-wide uppercase",
                  offer.is_active
                    ? "bg-primary/10 text-primary"
                    : "bg-muted text-muted-foreground",
                )}
              >
                {offer.is_active ? "Active" : "Inactive"}
              </span>

              <Switch
                checked={offer.is_active}
                disabled={busyId === offer.id}
                onCheckedChange={() => void toggle(offer)}
                aria-label={`${offer.is_active ? "Deactivate" : "Activate"} ${offer.title}`}
              />

              <div className="flex items-center gap-1">
                <button
                  type="button"
                  onClick={() => openEdit(offer)}
                  aria-label={`Edit ${offer.title}`}
                  className="cursor-pointer p-2 text-muted-foreground transition-colors hover:text-primary"
                >
                  <Pencil className="size-4" />
                </button>
                <button
                  type="button"
                  onClick={() => setPendingDelete(offer)}
                  aria-label={`Delete ${offer.title}`}
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
            {count} offer{count === 1 ? "" : "s"} · {activeCount} active
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

      <OfferSheet
        key={sheetKey}
        open={sheetOpen}
        onOpenChange={setSheetOpen}
        offer={editing}
        onSaved={refresh}
      />

      <AlertDialog
        open={pendingDelete !== null}
        onOpenChange={(open) => !open && setPendingDelete(null)}
      >
        <AlertDialogContent className="rounded-none">
          <AlertDialogHeader>
            <AlertDialogTitle>Delete this offer?</AlertDialogTitle>
            <AlertDialogDescription>
              {pendingDelete
                ? `${pendingDelete.title} will be removed. To pause it instead, turn it inactive — it can be run again later.`
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
