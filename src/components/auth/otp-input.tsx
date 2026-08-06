"use client";

import * as React from "react";

import { cn } from "@/lib/utils";

interface OtpInputProps {
  value: string;
  onChange: (value: string) => void;
  length?: number;
  disabled?: boolean;
  hasError?: boolean;
  /** Fires when the last box is filled, so the caller can auto-submit. */
  onComplete?: (value: string) => void;
}

export function OtpInput({
  value,
  onChange,
  length = 6,
  disabled,
  hasError,
  onComplete,
}: OtpInputProps) {
  const inputsRef = React.useRef<Array<HTMLInputElement | null>>([]);

  function focusBox(index: number) {
    inputsRef.current[Math.max(0, Math.min(index, length - 1))]?.focus();
  }

  function commit(next: string) {
    onChange(next);
    if (next.length === length) onComplete?.(next);
  }

  function handleChange(index: number, raw: string) {
    const digits = raw.replace(/\D/g, "");
    if (!digits) return;

    // Typing over a filled box replaces it; pasting fills forward from here.
    const chars = value.padEnd(length, " ").split("");
    digits
      .slice(0, length - index)
      .split("")
      .forEach((digit, offset) => {
        chars[index + offset] = digit;
      });

    const next = chars.join("").trimEnd();
    commit(next);
    focusBox(index + digits.length);
  }

  function handleKeyDown(index: number, event: React.KeyboardEvent) {
    if (event.key === "Backspace") {
      event.preventDefault();
      if (value[index]) {
        commit(value.slice(0, index) + value.slice(index + 1));
      } else if (index > 0) {
        // Empty box: clear the previous one and step back.
        commit(value.slice(0, index - 1));
        focusBox(index - 1);
      }
      return;
    }
    if (event.key === "ArrowLeft") {
      event.preventDefault();
      focusBox(index - 1);
    }
    if (event.key === "ArrowRight") {
      event.preventDefault();
      focusBox(index + 1);
    }
  }

  function handlePaste(event: React.ClipboardEvent) {
    event.preventDefault();
    const digits = event.clipboardData
      .getData("text")
      .replace(/\D/g, "")
      .slice(0, length);
    if (!digits) return;
    commit(digits);
    focusBox(digits.length);
  }

  return (
    <div className="flex justify-between gap-2 sm:gap-3">
      {Array.from({ length }).map((_, index) => (
        <input
          key={index}
          ref={(node) => {
            inputsRef.current[index] = node;
          }}
          type="text"
          inputMode="numeric"
          autoComplete={index === 0 ? "one-time-code" : "off"}
          maxLength={length}
          disabled={disabled}
          value={value[index] ?? ""}
          onChange={(event) => handleChange(index, event.target.value)}
          onKeyDown={(event) => handleKeyDown(index, event)}
          onPaste={handlePaste}
          onFocus={(event) => event.target.select()}
          aria-label={`Digit ${index + 1}`}
          className={cn(
            "h-12 w-full rounded-none border bg-transparent text-center text-lg font-semibold text-secondary transition-colors outline-none sm:h-14 sm:text-xl",
            "focus-visible:border-sidebar focus-visible:ring-1 focus-visible:ring-sidebar/40",
            "disabled:cursor-not-allowed disabled:opacity-50",
            hasError ? "border-destructive" : "border-input",
          )}
        />
      ))}
    </div>
  );
}
