"use client";

import * as React from "react";
import { toast } from "sonner";

import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { CONTACT_SUBJECTS } from "@/constants/contact";
import { getApiErrorMessage } from "@/lib/api-error";
import { cn } from "@/lib/utils";
import { contactService } from "@/services/contact.service";

/** Flat grey fields with square corners, matching the rest of the storefront. */
const FIELD_CLASS =
  "h-12 rounded-none border-transparent bg-muted px-4 text-base placeholder:text-muted-foreground/70 focus-visible:border-primary focus-visible:ring-0";

const LABEL_CLASS = "text-base font-black text-secondary";

/* Mirrors the server's limits, so a message that types fine here cannot come
   back rejected. `MESSAGE_MAX` matches contact/schemas.py. */
const NAME_MAX = 150;
const EMAIL_MAX = 254;
const PHONE_DIGITS = 10;
const MESSAGE_MAX = 4000;
/** Counter turns amber once this close to the ceiling. */
const MESSAGE_WARN_AT = MESSAGE_MAX - 200;

/* SelectTrigger sets its height and padding through `data-[size=default]:`
   variants, which outrank plain utilities on specificity — hence the `!`.
   Same workaround as the products filter. */
const SELECT_TRIGGER_CLASS =
  "h-12! w-full cursor-pointer rounded-none border-transparent bg-muted px-4! text-base text-secondary focus-visible:border-primary focus-visible:ring-0";

interface FormState {
  full_name: string;
  email: string;
  phone: string;
  subject: string;
  message: string;
  /** Honeypot. Hidden from people, irresistible to bots. */
  website: string;
}

type FormErrors = Partial<Record<keyof FormState, string>>;

const EMPTY: FormState = {
  full_name: "",
  email: "",
  phone: "",
  subject: CONTACT_SUBJECTS[0],
  message: "",
  website: "",
};

function validate(form: FormState): FormErrors {
  const errors: FormErrors = {};

  if (!form.full_name.trim()) {
    errors.full_name = "Please tell us your name.";
  } else if (form.full_name.trim().length > NAME_MAX) {
    errors.full_name = `Keep your name under ${NAME_MAX} characters.`;
  }

  if (!form.email.trim()) {
    errors.email = "An email address is required.";
  } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(form.email.trim())) {
    errors.email = "That email address doesn't look right.";
  } else if (form.email.trim().length > EMAIL_MAX) {
    errors.email = "That email address is too long.";
  }

  // Optional, but a partial number is worse than none — we would have no way
  // to call back.
  if (form.phone && form.phone.length !== PHONE_DIGITS) {
    errors.phone = `Enter all ${PHONE_DIGITS} digits, or leave it empty.`;
  }

  if (!form.message.trim()) {
    errors.message = "Please write a message.";
  } else if (form.message.length > MESSAGE_MAX) {
    errors.message = `Messages are limited to ${MESSAGE_MAX} characters.`;
  }

  return errors;
}

export function ContactForm() {
  const [form, setForm] = React.useState<FormState>(EMPTY);
  const [errors, setErrors] = React.useState<FormErrors>({});
  const [isSending, setIsSending] = React.useState(false);

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

    setIsSending(true);
    try {
      await contactService.send({
        full_name: form.full_name,
        email: form.email,
        phone_number: form.phone,
        subject: form.subject,
        message: form.message,
        website: form.website,
      });
      // Clear on success, or a second click sends the same message again.
      setForm(EMPTY);
      toast.success("Thanks — we'll be in touch shortly.");
    } catch (error) {
      toast.error(
        getApiErrorMessage(error, "Could not send your message right now."),
      );
    } finally {
      setIsSending(false);
    }
  }

  return (
    <form onSubmit={handleSubmit} className="relative mt-8 space-y-5">
      <div className="grid gap-5 sm:grid-cols-2">
        <div className="space-y-2">
          <Label htmlFor="contact-name" className={LABEL_CLASS}>
            Full Name
          </Label>
          <Input
            id="contact-name"
            maxLength={NAME_MAX}
            value={form.full_name}
            onChange={(event) => set("full_name", event.target.value)}
            placeholder="Enter your full name"
            aria-invalid={Boolean(errors.full_name)}
            className={cn(
              FIELD_CLASS,
              errors.full_name && "border-destructive",
            )}
          />
          {errors.full_name ? (
            <p className="text-xs text-destructive">{errors.full_name}</p>
          ) : null}
        </div>

        <div className="space-y-2">
          <Label htmlFor="contact-email" className={LABEL_CLASS}>
            Email
          </Label>
          <Input
            id="contact-email"
            type="email"
            maxLength={EMAIL_MAX}
            value={form.email}
            onChange={(event) => set("email", event.target.value)}
            placeholder="Enter your email address"
            aria-invalid={Boolean(errors.email)}
            className={cn(FIELD_CLASS, errors.email && "border-destructive")}
          />
          {errors.email ? (
            <p className="text-xs text-destructive">{errors.email}</p>
          ) : null}
        </div>

        <div className="space-y-2">
          <Label htmlFor="contact-phone" className={LABEL_CLASS}>
            Phone No.
          </Label>
          <Input
            id="contact-phone"
            inputMode="numeric"
            autoComplete="tel-national"
            maxLength={PHONE_DIGITS}
            value={form.phone}
            // Stripped as it is typed rather than rejected on submit, so a
            // pasted "+91 98765 43210" becomes usable instead of an error.
            onChange={(event) =>
              set(
                "phone",
                event.target.value.replace(/\D/g, "").slice(0, PHONE_DIGITS),
              )
            }
            placeholder="Type your phone number"
            aria-invalid={Boolean(errors.phone)}
            className={cn(FIELD_CLASS, errors.phone && "border-destructive")}
          />
          {errors.phone ? (
            <p className="text-xs text-destructive">{errors.phone}</p>
          ) : null}
        </div>

        <div className="space-y-2">
          <Label className={LABEL_CLASS}>Subject</Label>
          <Select
            items={CONTACT_SUBJECTS.map((subject) => ({
              value: subject,
              label: subject,
            }))}
            value={form.subject}
            onValueChange={(value) => set("subject", String(value))}
          >
            <SelectTrigger className={SELECT_TRIGGER_CLASS}>
              <SelectValue />
            </SelectTrigger>
            {/* alignItemWithTrigger defaults to true, which overlays the
                selected row on top of the trigger; false drops the list. */}
            <SelectContent
              className="rounded-none"
              align="start"
              alignItemWithTrigger={false}
            >
              {CONTACT_SUBJECTS.map((subject) => (
                <SelectItem
                  key={subject}
                  value={subject}
                  className="rounded-none py-2.5"
                >
                  {subject}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </div>

      <div className="space-y-2">
        <Label htmlFor="contact-message" className={LABEL_CLASS}>
          Your Message
        </Label>
        <Textarea
          id="contact-message"
          rows={6}
          maxLength={MESSAGE_MAX}
          value={form.message}
          onChange={(event) => set("message", event.target.value)}
          placeholder="Type your message"
          aria-invalid={Boolean(errors.message)}
          className={cn(
            "min-h-44 rounded-none border-transparent bg-muted px-4 py-3 text-base placeholder:text-muted-foreground/70 focus-visible:border-primary focus-visible:ring-0",
            errors.message && "border-destructive",
          )}
        />
        <div className="flex items-start justify-between gap-3">
          <p className="text-xs text-destructive">{errors.message ?? ""}</p>
          <p
            aria-live="polite"
            className={cn(
              "shrink-0 text-xs tabular-nums",
              form.message.length >= MESSAGE_WARN_AT
                ? "text-primary"
                : "text-muted-foreground",
            )}
          >
            {form.message.length} / {MESSAGE_MAX}
          </p>
        </div>
      </div>

      {/* Off screen rather than `display: none` — some bots skip hidden
          fields, and a real visitor never tabs into it thanks to tabIndex. */}
      <div aria-hidden className="absolute left-[-9999px] h-0 overflow-hidden">
        <label htmlFor="contact-website">Leave this field empty</label>
        <input
          id="contact-website"
          name="website"
          tabIndex={-1}
          autoComplete="off"
          value={form.website}
          onChange={(event) => set("website", event.target.value)}
        />
      </div>

      <button
        type="submit"
        disabled={isSending}
        className="cursor-pointer bg-secondary px-10 py-4 text-base font-black text-white transition-opacity hover:opacity-90 disabled:cursor-not-allowed disabled:opacity-60"
      >
        {isSending ? "Sending…" : "Submit"}
      </button>
    </form>
  );
}
