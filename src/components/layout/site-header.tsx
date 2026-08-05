"use client";

import Image from "next/image";
import Link from "next/link";
import { usePathname } from "next/navigation";

import { cn } from "@/lib/utils";

const NAV_LINKS = [
  { label: "Home", href: "/" },
  { label: "Products", href: "#products" },
  { label: "About Us", href: "#about" },
  { label: "Contact", href: "#contact" },
];

export function SiteHeader() {
  const pathname = usePathname();

  return (
    <header className="sticky top-0 z-50 border-b border-border bg-background">
      <div className="mx-auto grid max-w-7xl grid-cols-[auto_1fr_auto] items-center gap-6 px-6 py-4">
        <Link href="/" className="flex items-center">
          <Image src="/logo.svg" alt="hita" width={87} height={49} priority />
        </Link>

        <nav className="hidden items-center justify-center gap-8 md:flex">
          {NAV_LINKS.map((link) => {
            const isActive = pathname === link.href;
            return (
              <Link
                key={link.label}
                href={link.href}
                className={cn(
                  "text-lg font-semibold transition-colors hover:text-primary",
                  isActive ? "text-primary" : "text-secondary",
                )}
              >
                {link.label}
              </Link>
            );
          })}
        </nav>

        <div className="hidden items-center gap-6 justify-self-end md:flex">
          <Link
            href="#track-order"
            className="text-sm font-medium text-secondary transition-colors hover:text-primary"
          >
            Track My Order
          </Link>

          <button
            type="button"
            aria-label="Search"
            className="transition-opacity hover:opacity-70"
          >
            <Image src="/icons/ic_search.svg" alt="" width={20} height={20} />
          </button>
        </div>
      </div>
    </header>
  );
}
