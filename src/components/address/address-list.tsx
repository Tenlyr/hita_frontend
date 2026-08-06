"use client";

import { MapPin, Plus } from "lucide-react";
import * as React from "react";

import { AddressCard } from "@/components/address/address-card";
import { AddressFormDialog } from "@/components/address/address-form-dialog";
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
import { SweepButton } from "@/components/ui/sweep-button";
import { josefinSans } from "@/lib/fonts";
import { cn } from "@/lib/utils";
import type { Address, AddressInput } from "@/types/customer.address.types";

interface AddressListProps {
  addresses: Address[];
  isLoading: boolean;
  isSaving: boolean;
  onCreate: (payload: AddressInput) => Promise<unknown>;
  onUpdate: (id: number, payload: AddressInput) => Promise<unknown>;
  onRemove: (id: number) => Promise<unknown>;
  /** Omit to hide the "Set as default" action (checkout uses selection). */
  onSetDefault?: (id: number) => Promise<unknown>;
  /** Pass both to make the cards selectable. */
  selectedId?: number | null;
  onSelect?: (id: number) => void;
  /** Prefill for a new address — the account name and phone. */
  defaults?: Partial<AddressInput>;
  heading: string;
  emptyHint: string;
}

/**
 * The saved-address list with its add, edit and remove flows. Shared by
 * checkout, where the cards are selectable, and the account page, where they
 * are just managed.
 */
export function AddressList({
  addresses,
  isLoading,
  isSaving,
  onCreate,
  onUpdate,
  onRemove,
  onSetDefault,
  selectedId,
  onSelect,
  defaults,
  heading,
  emptyHint,
}: AddressListProps) {
  const [formOpen, setFormOpen] = React.useState(false);
  const [editing, setEditing] = React.useState<Address | null>(null);
  const [deleting, setDeleting] = React.useState<Address | null>(null);

  function openAdd() {
    setEditing(null);
    setFormOpen(true);
  }

  function openEdit(address: Address) {
    setEditing(address);
    setFormOpen(true);
  }

  async function confirmDelete() {
    if (!deleting) return;
    await onRemove(deleting.id);
    setDeleting(null);
  }

  return (
    <div className="space-y-5">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <h2 className="text-xl font-black text-secondary">{heading}</h2>
        {addresses.length > 0 ? (
          <button
            type="button"
            onClick={openAdd}
            className="flex cursor-pointer items-center gap-2 text-sm font-bold text-primary transition-opacity hover:opacity-70"
          >
            <Plus className="size-4" />
            Add new address
          </button>
        ) : null}
      </div>

      {isLoading ? (
        <div className="space-y-4">
          <div className="h-36 animate-pulse bg-muted" />
          <div className="h-36 animate-pulse bg-muted" />
        </div>
      ) : addresses.length === 0 ? (
        <div className="flex flex-col items-center gap-4 border border-dashed border-border px-6 py-14 text-center">
          <span className="flex size-14 items-center justify-center rounded-full bg-primary/10">
            <MapPin className="size-6 text-primary" />
          </span>
          <p className="text-base font-black text-secondary">
            No saved addresses yet
          </p>
          <p className="max-w-sm text-sm leading-relaxed text-muted-foreground">
            {emptyHint}
          </p>
          <SweepButton
            label="Add address"
            color="sidebar"
            variant="filled"
            onClick={openAdd}
            className="mt-1"
          />
        </div>
      ) : (
        <div className="space-y-4">
          {addresses.map((address) => (
            <AddressCard
              key={address.id}
              address={address}
              isSelected={selectedId === address.id}
              onSelect={onSelect ? () => onSelect(address.id) : undefined}
              onSetDefault={
                onSetDefault ? () => void onSetDefault(address.id) : undefined
              }
              onEdit={() => openEdit(address)}
              onDelete={() => setDeleting(address)}
            />
          ))}
        </div>
      )}

      <AddressFormDialog
        open={formOpen}
        onOpenChange={setFormOpen}
        address={editing}
        defaults={defaults}
        isSaving={isSaving}
        onSubmit={(payload) =>
          editing ? onUpdate(editing.id, payload) : onCreate(payload)
        }
      />

      <AlertDialog
        open={deleting !== null}
        onOpenChange={(open) => !open && setDeleting(null)}
      >
        <AlertDialogContent
          className={cn(josefinSans.variable, "font-sans rounded-none")}
        >
          <AlertDialogHeader>
            <AlertDialogTitle>Remove this address?</AlertDialogTitle>
            <AlertDialogDescription>
              {deleting
                ? `${deleting.full_name}, ${deleting.city} ${deleting.postal_code} will be removed from your saved addresses.`
                : null}
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel className="cursor-pointer rounded-none">
              Cancel
            </AlertDialogCancel>
            <AlertDialogAction
              onClick={confirmDelete}
              disabled={isSaving}
              className="cursor-pointer rounded-none bg-destructive text-white hover:bg-destructive/90"
            >
              {isSaving ? "Removing…" : "Remove"}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
