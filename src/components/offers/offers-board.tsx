"use client";

import * as React from "react";

import { CouponsPanel } from "@/components/offers/coupons-panel";
import { OffersPanel } from "@/components/offers/offers-panel";
import { cn } from "@/lib/utils";

type TabId = "offers" | "coupons";

const TABS: { id: TabId; label: string }[] = [
  { id: "offers", label: "Offers" },
  { id: "coupons", label: "Coupons" },
];

export function OffersBoard() {
  const [active, setActive] = React.useState<TabId>("offers");

  return (
    <div className="w-full space-y-6">
      <div className="border border-border bg-background">
        <div
          role="tablist"
          aria-label="Offers and coupons"
          className="flex gap-8 border-b border-border px-6"
        >
          {TABS.map((tab) => (
            <button
              key={tab.id}
              type="button"
              role="tab"
              aria-selected={active === tab.id}
              onClick={() => setActive(tab.id)}
              className={cn(
                "relative cursor-pointer py-4 text-sm font-semibold transition-colors",
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

        {active === "offers" ? <OffersPanel /> : <CouponsPanel />}
      </div>
    </div>
  );
}
