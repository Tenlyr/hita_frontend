import Image from "next/image";
import Link from "next/link";

import { cn } from "@/lib/utils";

export interface BannerCrumb {
  label: string;
  /** Omit on the final crumb — it renders as the current page. */
  href?: string;
}

interface PageBannerProps {
  title: string;
  crumbs?: BannerCrumb[];
  className?: string;
}

/** Title + breadcrumb over the shared banner photo. */
export function PageBanner({ title, crumbs = [], className }: PageBannerProps) {
  return (
    <section
      className={cn(
        "relative isolate flex min-h-56 flex-col items-center justify-center px-4 py-14 text-center sm:min-h-64 sm:px-6",
        className,
      )}
    >
      <Image
        src="/images/banner_bg.webp"
        alt=""
        fill
        priority
        sizes="100vw"
        className="-z-10 object-cover"
      />
      {/* Darkens the photo so white text keeps its contrast wherever it lands. */}
      <div className="absolute inset-0 -z-10 bg-secondary/55" />

      <h1 className="text-3xl font-black text-white sm:text-4xl">{title}</h1>

      {crumbs.length > 0 ? (
        <nav aria-label="Breadcrumb" className="mt-3">
          <ol className="flex flex-wrap items-center justify-center gap-2 text-sm sm:text-base">
            {crumbs.map((crumb, index) => (
              <li key={crumb.label} className="flex items-center gap-2">
                {index > 0 ? (
                  <span aria-hidden className="text-white/60">
                    /
                  </span>
                ) : null}

                {crumb.href ? (
                  <Link
                    href={crumb.href}
                    className="font-medium text-white transition-colors hover:text-primary"
                  >
                    {crumb.label}
                  </Link>
                ) : (
                  <span
                    aria-current="page"
                    className="font-medium text-primary"
                  >
                    {crumb.label}
                  </span>
                )}
              </li>
            ))}
          </ol>
        </nav>
      ) : null}
    </section>
  );
}
