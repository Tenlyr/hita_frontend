"use client";

import { Mail, MapPin, Phone } from "lucide-react";
import Image from "next/image";

import { ContactForm } from "@/components/contact/contact-form";
import { CONTACT_DETAILS } from "@/constants/contact";
import { REVEAL_ITEM, useGsapReveal } from "@/hooks/use-gsap-reveal";

/**
 * One entry: icon on the left, label and value beside it.
 *
 * The value wraps to the column rather than carrying hard line breaks, so a
 * long address reflows instead of overflowing a narrow column.
 */
function InfoRow({
  icon: Icon,
  label,
  children,
}: {
  icon: typeof MapPin;
  label: string;
  children: React.ReactNode;
}) {
  return (
    <div className="flex items-start gap-3">
      <span className="flex size-10 shrink-0 items-center justify-center rounded-full bg-primary/10">
        <Icon className="size-4.5 text-primary" />
      </span>

      <div className="min-w-0 flex-1">
        <dt className="text-xs font-bold tracking-wider text-primary uppercase">
          {label}
        </dt>
        <dd className="mt-1 leading-relaxed text-secondary">{children}</dd>
      </div>
    </div>
  );
}

export function ContactSection() {
  const copyRef = useGsapReveal<HTMLDivElement>({ stagger: 0.08 });

  return (
    <section className="mx-auto w-full max-w-7xl px-4 py-14 sm:px-6 sm:py-20">
      {/* `items-stretch` plus `lg:aspect-auto`: the photo takes its ratio on
          small screens, then matches the form column's height on desktop so
          the left side does not run out halfway down. */}
      <div className="grid items-stretch gap-10 lg:grid-cols-2 lg:gap-14">
        <div className="relative aspect-[4/5] w-full overflow-hidden bg-muted lg:aspect-auto lg:h-full">
          <Image
            src="/images/contact_01.webp"
            alt="Sunburst mirror above a cane console table"
            fill
            priority
            sizes="(max-width: 1024px) 100vw, 50vw"
            className="object-cover"
          />
        </div>

        <div ref={copyRef}>
          <Image
            src="/icons/ic_about.svg"
            alt=""
            width={64}
            height={63}
            className={`${REVEAL_ITEM} h-12 w-auto`}
          />

          <h2
            className={`${REVEAL_ITEM} mt-4 text-2xl font-black text-secondary sm:text-3xl`}
          >
            Get in Touch
          </h2>

          <p
            className={`${REVEAL_ITEM} mt-3 max-w-md text-sm leading-relaxed text-secondary/75 sm:text-base`}
          >
            We&apos;re here to address your inquiries, feedback, and partnership
            opportunities promptly and effectively.
          </p>

          <div className={REVEAL_ITEM}>
            <ContactForm />
          </div>

          <div className={`${REVEAL_ITEM} mt-10 border-t border-border pt-8`}>
            <h3 className="text-lg font-black text-secondary">Contact Info</h3>

            {/* One entry per row, stacked. Each row spans the full column, so
                the address gets the whole width and barely wraps. */}
            <dl className="mt-6 space-y-5 text-sm sm:text-base">
              <InfoRow icon={MapPin} label="Address">
                {CONTACT_DETAILS.addressLines.join(" ")}
              </InfoRow>

              <InfoRow icon={Mail} label="Email">
                <a
                  href={`mailto:${CONTACT_DETAILS.email}`}
                  className="transition-colors hover:text-primary"
                >
                  {CONTACT_DETAILS.email}
                </a>
              </InfoRow>

              <InfoRow icon={Phone} label="Phone">
                {CONTACT_DETAILS.phones.map((phone) => (
                  <a
                    key={phone}
                    href={`tel:${phone.replace(/\s/g, "")}`}
                    className="block transition-colors hover:text-primary"
                  >
                    {phone}
                  </a>
                ))}
              </InfoRow>
            </dl>
          </div>
        </div>
      </div>
    </section>
  );
}
