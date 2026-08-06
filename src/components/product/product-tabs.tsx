"use client";

import { Check, FileText } from "lucide-react";
import Image from "next/image";
import * as React from "react";

import { cn } from "@/lib/utils";
import type { Product, ProductVariant } from "@/types/product.types";

type Tab = "description" | "shipping";

const TABS: { id: Tab; label: string }[] = [
  { id: "description", label: "Description" },
  { id: "shipping", label: "Shipping" },
];

/** Split a free-text field into bullets — authors use commas or new lines. */
function toList(text: string | null): string[] {
  if (!text) return [];
  return text
    .split(/\r?\n|,/)
    .map((item) => item.trim())
    .filter(Boolean);
}

/** Dimensions worth showing: a 0 or missing measurement is noise, not data. */
function dimensionsOf(variant: ProductVariant | null) {
  if (!variant) return [];
  return (
    [
      { label: "Length", value: variant.length_in_cm },
      { label: "Width", value: variant.width_in_cm },
      { label: "Height", value: variant.height_in_cm },
      { label: "Diameter", value: variant.diameter_in_cm },
    ] as const
  )
    .filter(({ value }) => value !== null && Number(value) > 0)
    .map(({ label, value }) => ({ label, value: `${Number(value)} cm` }));
}

const SHIPPING_POINTS = [
  {
    icon: "/icons/ic_shipping.svg",
    title: "Delivery timelines",
    body: "Shipping times vary by location and the delivery option chosen at checkout. Processing usually takes 1–2 working days, and tracking details are shared as soon as your parcel leaves our studio.",
  },
  {
    icon: "/icons/ic_secure_payment.svg",
    title: "Secure payments",
    body: "Pay by credit card, debit card, UPI or netbanking. Every transaction is encrypted, so your details stay protected.",
  },
  {
    icon: "/icons/ic_return.svg",
    title: "Easy returns",
    body: "Every piece is packed by hand. If something arrives damaged, tell us within 48 hours with a photo and we will arrange a replacement or refund.",
  },
  {
    icon: "/icons/ic_support.svg",
    title: "Customer support",
    body: "Our team is here for anything you need — sizing, care advice or order updates. Reach out any time and we will get back to you promptly.",
  },
];

export function ProductTabs({
  product,
  variant,
}: {
  product: Product;
  variant: ProductVariant | null;
}) {
  const [active, setActive] = React.useState<Tab>("description");

  // Trimmed once and reused below, so the "is there anything to show" test and
  // the render checks can never disagree — a whitespace-only description is
  // truthy but renders blank, which left the whole panel empty.
  const description = product.description?.trim() ?? "";
  const care = product.care_instruction?.trim() ?? "";
  const madeIn = product.made_in?.trim() ?? "";
  const dimensions = dimensionsOf(variant);
  const usage = toList(product.usage_instruction);

  const hasBody = Boolean(description || care || usage.length > 0);
  const hasSpecs = dimensions.length > 0 || Boolean(madeIn);
  const hasDetails = hasBody || hasSpecs;

  return (
    <section className="border-t border-border pt-8">
      <div
        role="tablist"
        aria-label="Product information"
        className="flex gap-8 border-b border-border"
      >
        {TABS.map((tab) => (
          <button
            key={tab.id}
            type="button"
            role="tab"
            aria-selected={active === tab.id}
            onClick={() => setActive(tab.id)}
            className={cn(
              "relative cursor-pointer pb-4 text-base font-semibold transition-colors sm:text-lg",
              active === tab.id
                ? "text-primary"
                : "text-secondary hover:text-primary",
            )}
          >
            {tab.label}
            <span
              aria-hidden
              className={cn(
                "absolute -bottom-px left-0 h-0.5 w-full origin-left bg-primary transition-transform duration-300 ease-out",
                active === tab.id ? "scale-x-100" : "scale-x-0",
              )}
            />
          </button>
        ))}
      </div>

      <div role="tabpanel" className="pt-8">
        {active === "description" && !hasDetails ? (
          <div className="flex flex-col items-center gap-4 px-6 py-20 text-center">
            <span className="flex size-14 items-center justify-center rounded-full bg-primary/10">
              <FileText className="size-6 text-primary" />
            </span>
            <p className="text-xl font-black text-secondary">
              Details coming soon
            </p>
            <p className="max-w-sm leading-relaxed text-muted-foreground">
              We&apos;re still writing up this piece. Check the Shipping tab for
              delivery and returns, or reach out — we&apos;ll gladly help.
            </p>
          </div>
        ) : active === "description" ? (
          // Only split into columns when there is body copy to sit beside the
          // specs; otherwise the panel would strand alone on the right.
          <div
            className={cn(
              "grid gap-10",
              hasBody && "lg:grid-cols-[minmax(0,3fr)_minmax(0,2fr)]",
            )}
          >
            {hasBody ? (
              <div className="space-y-6">
              {description ? (
                <p className="leading-relaxed text-secondary/85">{description}</p>
              ) : null}

              {care ? (
                <div className="border-l-2 border-primary bg-primary/5 px-5 py-4">
                  <h3 className="text-sm font-bold tracking-wide text-primary uppercase">
                    Care instructions
                  </h3>
                  <p className="mt-2 leading-relaxed text-secondary/85">
                    {care}
                  </p>
                </div>
              ) : null}

              {usage.length > 0 ? (
                <div>
                  <h3 className="text-sm font-bold tracking-wide text-primary uppercase">
                    Ideal for
                  </h3>
                  <ul className="mt-3 grid gap-2 sm:grid-cols-2">
                    {usage.map((item) => (
                      <li
                        key={item}
                        className="flex items-start gap-2 text-secondary/85"
                      >
                        <Check className="mt-1 size-4 shrink-0 text-primary" />
                        {item}
                      </li>
                    ))}
                  </ul>
                </div>
              ) : null}
              </div>
            ) : null}

            {hasSpecs ? (
              <aside
                className={cn(
                  "h-fit border border-border",
                  !hasBody && "max-w-md",
                )}
              >
                <h3 className="border-b border-border bg-muted px-5 py-3 text-sm font-bold tracking-wide text-secondary uppercase">
                  Specifications
                  {variant?.size ? (
                    <span className="ml-2 font-medium text-muted-foreground normal-case">
                      ({variant.size})
                    </span>
                  ) : null}
                </h3>
                <dl className="divide-y divide-border">
                  {dimensions.map((row) => (
                    <div
                      key={row.label}
                      className="flex items-center justify-between px-5 py-3"
                    >
                      <dt className="text-secondary/70">{row.label}</dt>
                      <dd className="font-medium text-secondary">
                        {row.value}
                      </dd>
                    </div>
                  ))}
                  {madeIn ? (
                    <div className="flex items-center justify-between px-5 py-3">
                      <dt className="text-secondary/70">Origin</dt>
                      <dd className="font-medium text-secondary">
                        {madeIn}
                      </dd>
                    </div>
                  ) : null}
                </dl>
              </aside>
            ) : null}
          </div>
        ) : (
          <div className="grid gap-8 sm:grid-cols-2 lg:grid-cols-4">
            {SHIPPING_POINTS.map((point) => (
              <article key={point.title} className="space-y-3">
                <Image
                  src={point.icon}
                  alt=""
                  width={55}
                  height={44}
                  className="h-10 w-auto"
                />
                <h3 className="text-lg font-bold text-secondary">
                  {point.title}
                </h3>
                <p className="leading-relaxed text-secondary/85">
                  {point.body}
                </p>
              </article>
            ))}
          </div>
        )}
      </div>
    </section>
  );
}
