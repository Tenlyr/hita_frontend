"use client";

import { Minus, Plus } from "lucide-react";

import { cn } from "@/lib/utils";

interface QuantityStepperProps {
  value: number;
  max: number;
  onChange: (value: number) => void;
  /** `sm` is for cart lines, where the row is already tight. */
  size?: "sm" | "md";
  disabled?: boolean;
  className?: string;
}

export function QuantityStepper({
  value,
  max,
  onChange,
  size = "md",
  disabled = false,
  className,
}: QuantityStepperProps) {
  const button = cn(
    "flex cursor-pointer items-center justify-center bg-muted text-secondary transition-colors hover:bg-muted/70 disabled:cursor-not-allowed disabled:opacity-40",
    size === "sm" ? "size-8" : "size-11",
  );

  return (
    <div className={cn("flex shrink-0 items-center", className)}>
      <button
        type="button"
        onClick={() => onChange(Math.max(1, value - 1))}
        disabled={disabled || value <= 1}
        aria-label="Decrease quantity"
        className={button}
      >
        <Minus className={size === "sm" ? "size-3" : "size-4"} />
      </button>
      <span
        aria-live="polite"
        className={cn(
          "text-center font-medium text-secondary",
          size === "sm" ? "w-9 text-sm" : "w-12 text-base",
        )}
      >
        {value}
      </span>
      <button
        type="button"
        onClick={() => onChange(Math.min(max, value + 1))}
        disabled={disabled || value >= max}
        aria-label="Increase quantity"
        className={button}
      >
        <Plus className={size === "sm" ? "size-3" : "size-4"} />
      </button>
    </div>
  );
}
