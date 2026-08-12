"use client";

import Image from "next/image";

import { CONTACT_DETAILS } from "@/constants/contact";
import type { PolicyRow } from "@/constants/shipping";
import { REVEAL_ITEM, useGsapReveal } from "@/hooks/use-gsap-reveal";

interface PolicyDocumentProps {
  title: string;
  rows: PolicyRow[];
  ruleTitle: string;
  ruleBody: string;
  /** Wording before the email — it differs per policy. */
  contactLead: string;
}

/**
 * Label/value rows, a rule section, and a contact line.
 *
 * Shared by the shipping and return policies: they are the same document with
 * different words, and keeping one component means a spacing tweak lands on
 * both instead of only the one being looked at.
 */
export function PolicyDocument({
  title,
  rows,
  ruleTitle,
  ruleBody,
  contactLead,
}: PolicyDocumentProps) {
  const containerRef = useGsapReveal<HTMLDivElement>({ stagger: 0.07 });

  return (
    <div ref={containerRef} className="mx-auto w-full max-w-4xl">
      <Image
        src="/icons/ic_about.svg"
        alt=""
        width={64}
        height={63}
        className={`${REVEAL_ITEM} h-12 w-auto`}
      />

      <h2
        className={`${REVEAL_ITEM} mt-5 text-2xl font-black text-secondary sm:text-3xl`}
      >
        {title}
      </h2>

      <dl className="mt-8 space-y-4">
        {rows.map((row) => (
          // Label and value share a line and wrap together, so a long value
          // does not indent itself into a second column.
          <div key={row.label} className={REVEAL_ITEM}>
            <dt className="inline font-bold text-primary">{row.label}:</dt>{" "}
            <dd className="inline leading-relaxed text-secondary">
              {row.value}
            </dd>
          </div>
        ))}
      </dl>

      <hr
        className={`${REVEAL_ITEM} mt-12 border-t border-dashed border-primary/50`}
      />

      <h2
        className={`${REVEAL_ITEM} mt-12 text-2xl font-black text-secondary sm:text-3xl`}
      >
        {ruleTitle}
      </h2>

      <p className={`${REVEAL_ITEM} mt-5 leading-relaxed text-secondary`}>
        {ruleBody}
      </p>

      <p className={`${REVEAL_ITEM} mt-6 leading-relaxed text-secondary`}>
        {contactLead}{" "}
        <a
          href={`mailto:${CONTACT_DETAILS.email}`}
          className="text-primary underline-offset-4 transition-opacity hover:underline hover:opacity-80"
        >
          {CONTACT_DETAILS.email}
        </a>
      </p>
    </div>
  );
}
