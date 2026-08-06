"use client";

import * as React from "react";

import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { RequiredMark } from "@/components/ui/required-mark";
import { josefinSans } from "@/lib/fonts";
import { cn } from "@/lib/utils";
import type { Address, AddressInput } from "@/types/customer.address.types";

const FIELD_CLASS = "h-11 rounded-none";

type FormState = AddressInput;
type FormErrors = Partial<Record<keyof FormState, string>>;

function emptyForm(defaults: Partial<FormState> = {}): FormState {
  return {
    full_name: "",
    phone_number: "",
    address_line1: "",
    address_line2: "",
    city: "",
    state: "",
    postal_code: "",
    ...defaults,
  };
}

function validate(form: FormState): FormErrors {
  const errors: FormErrors = {};

  if (!form.full_name.trim()) errors.full_name = "Full name is required.";

  const digits = form.phone_number.replace(/\D/g, "");
  if (!form.phone_number.trim()) {
    errors.phone_number = "Phone number is required.";
  } else if (digits.length < 10) {
    errors.phone_number = "Enter a valid phone number.";
  }

  if (!form.address_line1.trim()) {
    errors.address_line1 = "Address line 1 is required.";
  }
  if (!form.city.trim()) errors.city = "City is required.";
  if (!form.state.trim()) errors.state = "State is required.";

  // Mirrors the backend validator, so a typo is caught before the round trip.
  if (!/^\d{6}$/.test(form.postal_code.trim())) {
    errors.postal_code = "Enter a valid 6-digit PIN code.";
  }

  return errors;
}

/* Defined at module scope on purpose. Nested inside the component it would be
   a new component type on every render, so React would remount the input and
   the field would lose focus after each keystroke. */
function Field({
  field,
  label,
  value,
  error,
  onChange,
  required,
  placeholder,
  inputMode,
}: {
  field: keyof FormState;
  label: string;
  value: string;
  error?: string;
  onChange: (value: string) => void;
  required?: boolean;
  placeholder?: string;
  inputMode?: "text" | "tel" | "numeric";
}) {
  const id = `address-${field}`;
  return (
    <div className="space-y-1.5">
      <Label htmlFor={id} className="text-secondary">
        {label}
        {required ? <RequiredMark /> : null}
      </Label>
      <Input
        id={id}
        value={value}
        onChange={(event) => onChange(event.target.value)}
        placeholder={placeholder}
        inputMode={inputMode}
        aria-invalid={Boolean(error)}
        className={cn(FIELD_CLASS, error && "border-destructive")}
      />
      {error ? <p className="text-xs text-destructive">{error}</p> : null}
    </div>
  );
}

interface AddressFormDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  /** Pass an address to edit it; omit to add a new one. */
  address?: Address | null;
  /** Prefilled on a new address, and replaceable — parcels go to other people. */
  defaults?: Partial<FormState>;
  isSaving?: boolean;
  onSubmit: (payload: AddressInput) => Promise<unknown>;
}

export function AddressFormDialog({
  open,
  onOpenChange,
  address,
  defaults,
  isSaving = false,
  onSubmit,
}: AddressFormDialogProps) {
  const [form, setForm] = React.useState<FormState>(() => emptyForm(defaults));
  const [errors, setErrors] = React.useState<FormErrors>({});

  // Reset from props whenever the dialog opens rather than in an effect, so
  // editing one address can never leave another one's values behind.
  const [lastOpen, setLastOpen] = React.useState(open);
  if (open !== lastOpen) {
    setLastOpen(open);
    if (open) {
      setForm(
        address
          ? {
              full_name: address.full_name,
              phone_number: address.phone_number,
              address_line1: address.address_line1,
              address_line2: address.address_line2,
              city: address.city,
              state: address.state,
              postal_code: address.postal_code,
            }
          : emptyForm(defaults),
      );
      setErrors({});
    }
  }

  function set<K extends keyof FormState>(field: K, value: FormState[K]) {
    setForm((current) => ({ ...current, [field]: value }));
    setErrors((current) => ({ ...current, [field]: undefined }));
  }

  async function handleSubmit(event: React.FormEvent) {
    event.preventDefault();
    const found = validate(form);
    if (Object.keys(found).length > 0) {
      setErrors(found);
      return;
    }
    const result = await onSubmit(form);
    if (result) onOpenChange(false);
  }

  /** Wires one field to the form state, so each call site stays one line. */
  function fieldProps(field: keyof FormState) {
    return {
      field,
      value: String(form[field] ?? ""),
      error: errors[field],
      onChange: (value: string) => set(field, value),
    };
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent
        // Portalled into <body>, so the storefront typeface is set here.
        className={cn(
          josefinSans.variable,
          "font-sans max-h-[90vh] overflow-y-auto rounded-none sm:max-w-lg",
        )}
      >
        <DialogHeader>
          <DialogTitle className="text-xl font-black text-secondary">
            {address ? "Edit address" : "Add a delivery address"}
          </DialogTitle>
          <DialogDescription>
            We&apos;ll use this to deliver your order and to reach you about it.
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid gap-4 sm:grid-cols-2">
            <Field {...fieldProps("full_name")} label="Full name" required />
            <Field
              {...fieldProps("phone_number")}
              label="Phone number"
              required
              inputMode="tel"
              placeholder="9876543210"
            />
          </div>

          <Field
            {...fieldProps("address_line1")}
            label="Address line 1"
            required
          />
          <Field
            {...fieldProps("address_line2")}
            label="Address line 2"
            placeholder="Apartment, landmark (optional)"
          />

          <div className="grid gap-4 sm:grid-cols-3">
            <Field {...fieldProps("city")} label="City" required />
            <Field {...fieldProps("state")} label="State" required />
            <Field
              {...fieldProps("postal_code")}
              label="PIN code"
              required
              inputMode="numeric"
              placeholder="600002"
            />
          </div>

          <div className="flex justify-end gap-3 pt-2">
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
              {isSaving ? "Saving…" : address ? "Save changes" : "Save address"}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
