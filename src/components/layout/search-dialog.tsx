"use client";

import { Search, X } from "lucide-react";
import { useRouter } from "next/navigation";
import * as React from "react";

import { Dialog, DialogContent, DialogTitle } from "@/components/ui/dialog";
import { APP_ROUTES } from "@/constants/routes";
import { josefinSans } from "@/lib/fonts";
import { cn } from "@/lib/utils";
import { productService } from "@/services/product.service";
import type { Category } from "@/types/customer.product.types";

/** Enough to fill a row without wrapping into a wall of chips. */
const MAX_TAGS = 6;

interface SearchDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function SearchDialog({ open, onOpenChange }: SearchDialogProps) {
  const router = useRouter();
  const [term, setTerm] = React.useState("");
  const [tags, setTags] = React.useState<Category[]>([]);

  // Fetched on first open rather than on mount: the categories are only worth
  // a request once someone actually reaches for search.
  React.useEffect(() => {
    if (!open || tags.length > 0) return;
    let cancelled = false;

    async function load() {
      try {
        const result = await productService.categories();
        if (!cancelled) setTags(result.slice(0, MAX_TAGS));
      } catch {
        // No tags is a fine outcome — the input still works.
      }
    }

    void load();
    return () => {
      cancelled = true;
    };
  }, [open, tags.length]);

  function go(href: string) {
    setTerm("");
    onOpenChange(false);
    router.push(href);
  }

  function handleSubmit(event: React.FormEvent) {
    event.preventDefault();
    const query = term.trim();
    if (!query) return;
    go(`${APP_ROUTES.SHOP.PRODUCTS}?search=${encodeURIComponent(query)}`);
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent
        showCloseButton={false}
        // Portalled into <body>, so the storefront typeface is set here.
        // Square corners and no padding: the dark close sits flush in the
        // corner, which a rounded, padded popup cannot do.
        className={cn(
          josefinSans.variable,
          "font-sans gap-0 rounded-none p-0 sm:max-w-2xl",
        )}
      >
        <DialogTitle className="sr-only">Search products</DialogTitle>

        {/* Square dark close, flush to the panel's top-right corner. */}
        <button
          type="button"
          onClick={() => onOpenChange(false)}
          aria-label="Close search"
          className="absolute top-0 right-0 flex size-12 cursor-pointer items-center justify-center bg-secondary text-white transition-opacity hover:opacity-90"
        >
          <X className="size-5" />
        </button>

        <div className="w-full px-6 pt-14 pb-8 sm:px-8 sm:pt-16 sm:pb-10">
          <form onSubmit={handleSubmit} className="border-b border-border pb-4">
            <div className="flex items-center gap-4">
              <input
                // Focused on open so a keyboard user can just start typing.
                autoFocus
                value={term}
                onChange={(event) => setTerm(event.target.value)}
                placeholder="Type your keyword"
                aria-label="Search products"
                className="min-w-0 flex-1 bg-transparent text-lg font-medium text-secondary outline-none placeholder:text-secondary/70 sm:text-xl"
              />

              <button
                type="submit"
                aria-label="Search"
                className="shrink-0 cursor-pointer text-secondary transition-colors hover:text-primary"
              >
                <Search className="size-6 sm:size-7" />
              </button>
            </div>
          </form>

          {tags.length > 0 ? (
            <div className="mt-8">
              <h2 className="text-xl font-black text-secondary sm:text-2xl">
                Popular Tags
              </h2>

              <div className="mt-5 flex flex-wrap gap-2.5">
                {tags.map((tag) => (
                  <button
                    key={tag.name}
                    type="button"
                    onClick={() =>
                      go(
                        `${APP_ROUTES.SHOP.PRODUCTS}?category=${encodeURIComponent(tag.name)}`,
                      )
                    }
                    className="cursor-pointer border border-secondary px-4 py-2.5 text-sm font-medium text-secondary transition-colors hover:bg-secondary hover:text-white"
                  >
                    {tag.name}
                  </button>
                ))}
              </div>
            </div>
          ) : null}
        </div>
      </DialogContent>
    </Dialog>
  );
}
