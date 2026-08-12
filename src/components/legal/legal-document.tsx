"use client";

import { CONTACT_DETAILS } from "@/constants/contact";
import type { LegalSection } from "@/constants/legal";
import { REVEAL_ITEM, useGsapReveal } from "@/hooks/use-gsap-reveal";

interface LegalDocumentProps {
  /** Omit on documents that open straight into their first section. */
  intro?: string;
  sections: LegalSection[];
  /** The other policy pages will reuse this shell. */
  businessName?: string;
}

/**
 * Intro, numbered sections, contact block.
 *
 * Built as a shell rather than a one-off page because the shipping, return and
 * privacy policies are the same document with different words.
 */
export function LegalDocument({
  intro,
  sections,
  businessName = "Hita Decor",
}: LegalDocumentProps) {
  const containerRef = useGsapReveal<HTMLDivElement>({ stagger: 0.05 });

  return (
    <div ref={containerRef} className="mx-auto w-full max-w-4xl">
      {intro ? (
        <p
          className={`${REVEAL_ITEM} leading-relaxed text-secondary/80 sm:text-lg`}
        >
          {intro}
        </p>
      ) : null}

      {sections.map((section, index) => (
        <section
          key={section.title}
          // No intro means the first heading is the top of the page and does
          // not need spacing above it.
          className={`${REVEAL_ITEM} ${!intro && index === 0 ? "" : "mt-10"}`}
        >
          <h2 className="text-xl font-black text-secondary sm:text-2xl">
            {section.title}
          </h2>

          <ol className="mt-4 list-decimal space-y-3 pl-6 marker:font-medium marker:text-secondary/70">
            {section.items.map((item) => (
              <li key={item} className="pl-1 leading-relaxed text-secondary/80">
                {item}
              </li>
            ))}
          </ol>
        </section>
      ))}

      <section className={`${REVEAL_ITEM} mt-12`}>
        <h2 className="text-xl font-black text-secondary sm:text-2xl">
          Contact Information
        </h2>

        <address className="mt-4 leading-relaxed text-secondary/80 not-italic">
          <span className="block font-medium text-primary">
            {businessName},
          </span>

          {/* Links rather than plain text: this block is the one place a
              customer looks when something has gone wrong. */}
          {CONTACT_DETAILS.phones.map((phone) => (
            <a
              key={phone}
              href={`tel:${phone.replace(/\s/g, "")}`}
              className="block underline underline-offset-4 transition-colors hover:text-primary"
            >
              {phone},
            </a>
          ))}

          <a
            href={`mailto:${CONTACT_DETAILS.email}`}
            className="block underline underline-offset-4 transition-colors hover:text-primary"
          >
            {CONTACT_DETAILS.email},
          </a>

          {CONTACT_DETAILS.addressLines.map((line) => (
            <span key={line} className="block">
              {line}
            </span>
          ))}
        </address>
      </section>
    </div>
  );
}
