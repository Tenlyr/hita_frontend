"use client";

import { Check, Pencil, Trash2 } from "lucide-react";

import { cn } from "@/lib/utils";
import type { Address } from "@/types/customer.address.types";

interface AddressCardProps {
  address: Address;
  /** Pass both to turn the card into a radio option (checkout does). */
  isSelected?: boolean;
  onSelect?: () => void;
  /** Offered instead of selection when the card is not selectable. */
  onSetDefault?: () => void;
  onEdit: () => void;
  onDelete: () => void;
}

export function AddressCard({
  address,
  isSelected = false,
  onSelect,
  onSetDefault,
  onEdit,
  onDelete,
}: AddressCardProps) {
  const isSelectable = Boolean(onSelect);

  return (
    <div
      className={cn(
        "relative border p-4 transition-colors",
        isSelectable && isSelected
          ? "border-primary bg-primary/5"
          : "border-border",
      )}
    >
      {/* The whole card is the radio target — a 16px dot is a poor tap area
          on a phone. The edit and delete buttons sit above it. */}
      {isSelectable ? (
        <button
          type="button"
          onClick={onSelect}
          aria-pressed={isSelected}
          className="absolute inset-0 cursor-pointer"
          aria-label={`Deliver to ${address.full_name}, ${address.city}`}
        />
      ) : null}

      {/* Above the card-wide radio button, or a tap here would just change the
          selection instead of opening the action. */}
      <div className="absolute top-3 right-3 z-10 flex items-center gap-1">
        <button
          type="button"
          onClick={onEdit}
          aria-label={`Edit address for ${address.full_name}`}
          className="cursor-pointer p-1 text-muted-foreground transition-colors hover:text-primary"
        >
          <Pencil className="size-3.5" />
        </button>
        <button
          type="button"
          onClick={onDelete}
          aria-label={`Remove address for ${address.full_name}`}
          className="cursor-pointer p-1 text-muted-foreground transition-colors hover:text-destructive"
        >
          <Trash2 className="size-3.5" />
        </button>
      </div>

      <div
        className={cn(
          "relative flex gap-3",
          isSelectable && "pointer-events-none",
        )}
      >
        {isSelectable ? (
          <span
            className={cn(
              "mt-0.5 flex size-4 shrink-0 items-center justify-center rounded-full border-2",
              isSelected ? "border-primary bg-primary" : "border-border",
            )}
          >
            {isSelected ? <Check className="size-2.5 text-white" /> : null}
          </span>
        ) : null}

        <div className="min-w-0 flex-1 space-y-0.5 pr-14">
          <div className="flex flex-wrap items-center gap-2">
            <p className="text-sm font-bold text-secondary">
              {address.full_name}
            </p>
            {address.is_default ? (
              <span className="bg-primary/15 px-1.5 py-0.5 text-[9px] font-bold tracking-wide text-primary uppercase">
                Default
              </span>
            ) : null}
          </div>
          <p className="text-xs leading-relaxed text-muted-foreground">
            {address.address_line1}
            {address.address_line2 ? `, ${address.address_line2}` : ""}
            <br />
            {address.city}, {address.state} {address.postal_code}
          </p>
          <p className="text-xs text-muted-foreground">
            {address.phone_number}
          </p>
        </div>
      </div>

      {/* Without selection there is no other way to promote an address, so the
          card offers it directly. Nothing else lives down here now, so the row
          disappears entirely when it does not apply. */}
      {!isSelectable && onSetDefault && !address.is_default ? (
        <button
          type="button"
          onClick={onSetDefault}
          className="relative mt-2 cursor-pointer text-xs font-bold text-primary transition-opacity hover:opacity-70"
        >
          Set as default
        </button>
      ) : null}
    </div>
  );
}
