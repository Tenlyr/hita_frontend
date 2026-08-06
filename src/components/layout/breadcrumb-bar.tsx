import Link from "next/link";

import { cn } from "@/lib/utils";

export interface Crumb {
  label: string;
  /** Omit on the last crumb — it renders as the current page. */
  href?: string;
}

interface BreadcrumbBarProps {
  crumbs: Crumb[];
  className?: string;
}

/** Full-width tinted bar with the trail, used above storefront detail pages. */
export function BreadcrumbBar({ crumbs, className }: BreadcrumbBarProps) {
  return (
    <nav
      aria-label="Breadcrumb"
      className={cn("w-full bg-primary/8 py-8", className)}
    >
      <ol className="mx-auto flex w-full max-w-7xl flex-wrap items-center gap-2 px-4 text-base font-medium sm:px-6 sm:text-md">
        {crumbs.map((crumb, index) => (
          <li key={`${crumb.label}-${index}`} className="flex items-center gap-2">
            {index > 0 ? (
              <span aria-hidden className="text-secondary/40">
                /
              </span>
            ) : null}

            {crumb.href ? (
              <Link
                href={crumb.href}
                className="text-secondary transition-colors hover:text-primary"
              >
                {crumb.label}
              </Link>
            ) : (
              <span aria-current="page" className="text-primary">
                {crumb.label}
              </span>
            )}
          </li>
        ))}
      </ol>
    </nav>
  );
}
