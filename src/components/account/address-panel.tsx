"use client";

import { AddressList } from "@/components/address/address-list";
import { useAddresses } from "@/hooks/use-addresses";
import type { AuthUser } from "@/types/session.types";

/**
 * Saved addresses on the account page. Unlike checkout the cards aren't
 * selectable — there's no order to attach one to — so they offer "Set as
 * default" instead.
 */
export function AddressPanel({ user }: { user: AuthUser | null }) {
  const { addresses, isLoading, isSaving, create, update, setDefault, remove } =
    useAddresses();

  return (
    <AddressList
      addresses={addresses}
      isLoading={isLoading}
      isSaving={isSaving}
      onCreate={create}
      onUpdate={update}
      onRemove={remove}
      onSetDefault={setDefault}
      // Prefilled from the account, but editable — parcels get sent to
      // relatives and offices.
      defaults={{
        full_name: user?.name ?? "",
        phone_number: user?.phone_number ?? "",
      }}
      heading="Saved addresses"
      emptyHint="Save the places you order to and pick one at checkout instead of typing it out each time."
    />
  );
}
