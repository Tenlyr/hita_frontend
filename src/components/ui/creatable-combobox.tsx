"use client";

import { Check, ChevronDown, Plus } from "lucide-react";
import * as React from "react";

import { Input } from "@/components/ui/input";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { cn } from "@/lib/utils";

interface CreatableComboboxProps {
  id?: string;
  value: string;
  onChange: (value: string) => void;
  options: string[];
  placeholder?: string;
  emptyHint?: string;
  disabled?: boolean;
  className?: string;
}

/**
 * Pick an existing value or type a new one.
 *
 * The field is free text underneath — the list is a convenience so the same
 * category isn't re-typed three different ways, not a constraint.
 */
export function CreatableCombobox({
  id,
  value,
  onChange,
  options,
  placeholder = "Select or type…",
  emptyHint = "Type to add a new one",
  disabled,
  className,
}: CreatableComboboxProps) {
  const [open, setOpen] = React.useState(false);
  const [query, setQuery] = React.useState("");

  const trimmedQuery = query.trim();

  const matches = React.useMemo(() => {
    if (!trimmedQuery) return options;
    const needle = trimmedQuery.toLowerCase();
    return options.filter((option) => option.toLowerCase().includes(needle));
  }, [options, trimmedQuery]);

  // Offer "create" only when the typed text isn't already an exact option.
  const canCreate =
    trimmedQuery.length > 0 &&
    !options.some(
      (option) => option.toLowerCase() === trimmedQuery.toLowerCase(),
    );

  function commit(next: string) {
    onChange(next);
    setQuery("");
    setOpen(false);
  }

  return (
    <Popover
      open={open}
      onOpenChange={(next) => {
        setOpen(next);
        if (!next) setQuery("");
      }}
    >
      <PopoverTrigger
        render={
          <button
            type="button"
            id={id}
            disabled={disabled}
            className={cn(
              "flex h-11 w-full cursor-pointer items-center justify-between gap-2 rounded-none border border-input bg-transparent px-4 text-left text-sm transition-colors outline-none focus-visible:border-ring focus-visible:ring-1 focus-visible:ring-ring/50 disabled:cursor-not-allowed disabled:opacity-50",
              className,
            )}
          />
        }
      >
        <span className={cn(!value && "text-muted-foreground/55")}>
          {value || placeholder}
        </span>
        <ChevronDown className="size-4 shrink-0 text-muted-foreground" />
      </PopoverTrigger>

      <PopoverContent
        align="start"
        className="w-(--anchor-width) rounded-none p-0"
      >
        <div className="border-b border-border p-2">
          <Input
            autoFocus
            value={query}
            onChange={(event) => setQuery(event.target.value)}
            onKeyDown={(event) => {
              if (event.key === "Enter") {
                event.preventDefault();
                if (canCreate) commit(trimmedQuery);
                else if (matches.length > 0) commit(matches[0]);
              }
            }}
            placeholder="Search or type a new one"
            className="h-9 rounded-none"
          />
        </div>

        <ul className="max-h-56 overflow-y-auto py-1">
          {matches.map((option) => (
            <li key={option}>
              <button
                type="button"
                onClick={() => commit(option)}
                className="flex w-full cursor-pointer items-center justify-between gap-2 px-3 py-2 text-left text-sm transition-colors hover:bg-muted"
              >
                {option}
                {option === value ? (
                  <Check className="size-4 text-primary" />
                ) : null}
              </button>
            </li>
          ))}

          {canCreate ? (
            <li>
              <button
                type="button"
                onClick={() => commit(trimmedQuery)}
                className="flex w-full cursor-pointer items-center gap-2 px-3 py-2 text-left text-sm font-medium text-primary transition-colors hover:bg-muted"
              >
                <Plus className="size-4" />
                Add “{trimmedQuery}”
              </button>
            </li>
          ) : null}

          {matches.length === 0 && !canCreate ? (
            <li className="px-3 py-6 text-center text-sm text-muted-foreground">
              {options.length === 0 ? emptyHint : "No matches"}
            </li>
          ) : null}
        </ul>
      </PopoverContent>
    </Popover>
  );
}
