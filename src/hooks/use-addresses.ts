"use client";

import * as React from "react";
import { toast } from "sonner";

import { getApiErrorMessage } from "@/lib/api-error";
import { hasCustomerSession } from "@/lib/auth";
import { addressService } from "@/services/address.service";
import type { Address, AddressInput } from "@/types/customer.address.types";

/** Saved delivery addresses for the signed-in shopper. */
export function useAddresses() {
  const [addresses, setAddresses] = React.useState<Address[]>([]);
  const [isLoading, setIsLoading] = React.useState(true);
  const [isSaving, setIsSaving] = React.useState(false);

  React.useEffect(() => {
    let cancelled = false;

    async function load() {
      // Signed out there is nothing to fetch, and the call would 401 and drag
      // the interceptor through a pointless refresh attempt.
      if (!hasCustomerSession()) {
        if (!cancelled) setIsLoading(false);
        return;
      }
      try {
        const result = await addressService.list();
        if (!cancelled) setAddresses(result.results);
      } catch {
        if (!cancelled) setAddresses([]);
      } finally {
        if (!cancelled) setIsLoading(false);
      }
    }

    void load();
    return () => {
      cancelled = true;
    };
  }, []);

  /** Shared wrapper — every mutation returns the whole list to adopt. */
  const run = React.useCallback(
    async (
      action: () => Promise<{ results: Address[] }>,
      successMessage: string,
      fallbackError: string,
    ) => {
      setIsSaving(true);
      try {
        const result = await action();
        setAddresses(result.results);
        toast.success(successMessage);
        return result.results;
      } catch (error) {
        toast.error(getApiErrorMessage(error, fallbackError));
        return null;
      } finally {
        setIsSaving(false);
      }
    },
    [],
  );

  const create = React.useCallback(
    (payload: AddressInput) =>
      run(
        () => addressService.create(payload),
        "Address saved.",
        "Could not save that address.",
      ),
    [run],
  );

  const update = React.useCallback(
    (id: number, payload: AddressInput) =>
      run(
        () => addressService.update(id, payload),
        "Address updated.",
        "Could not update that address.",
      ),
    [run],
  );

  const setDefault = React.useCallback(
    (id: number) =>
      run(
        () => addressService.setDefault(id),
        "Default address updated.",
        "Could not update the default address.",
      ),
    [run],
  );

  const remove = React.useCallback(
    (id: number) =>
      run(
        () => addressService.remove(id),
        "Address removed.",
        "Could not remove that address.",
      ),
    [run],
  );

  return {
    addresses,
    isLoading,
    isSaving,
    create,
    update,
    setDefault,
    remove,
  };
}
