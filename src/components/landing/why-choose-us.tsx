"use client";

import Image from "next/image";

import { REVEAL_ITEM, useGsapReveal } from "@/hooks/use-gsap-reveal";

const FEATURES = [
  {
    icon: "/icons/ic_shipping.svg",
    title: "Free Shipping",
    description:
      "Enjoy free shipping on all orders, making your shopping experience even more convenient. Get your favorite products delivered.",
  },
  {
    icon: "/icons/ic_return.svg",
    title: "Easy to Return",
    description:
      "Experience hassle-free returns with our easy-to-use return policy. If you're not satisfied, simply return your product for a quick refund.",
  },
  {
    icon: "/icons/ic_secure_payment.svg",
    title: "Secure Payment",
    description:
      "Shop with confidence using our secure payment options, ensuring your personal information stays protected. We prioritize your safety.",
  },
  {
    icon: "/icons/ic_support.svg",
    title: "Customer Support",
    description:
      "Our dedicated customer support team is here to assist you every step of the way. Reach out to us anytime for prompt, friendly help.",
  },
];

export function WhyChooseUs() {
  // Same lift-and-fade the product grid uses, so the page reads as one
  // sequence rather than each section having its own idea of an entrance.
  const containerRef = useGsapReveal<HTMLDivElement>({ stagger: 0.1 });

  return (
    <section className="relative isolate overflow-hidden py-16 sm:py-24">
      <Image
        src="/images/why_choose_bg.webp"
        alt=""
        fill
        priority={false}
        sizes="100vw"
        className="-z-10 object-cover"
      />
      {/* Softens the photo so the copy stays legible over it. */}
      <div className="absolute inset-0 -z-10 bg-background/55" />

      <div ref={containerRef} className="mx-auto w-full max-w-7xl px-4 sm:px-6">
        <header className={`${REVEAL_ITEM} max-w-xl`}>
          <Image
            src="/icons/ic_why_choose.svg"
            alt=""
            width={64}
            height={63}
            className="h-12 w-auto sm:h-20"
          />
          <h2 className="mt-4 text-2xl font-black text-secondary sm:text-3xl">
            Why you Choose Us
          </h2>
          <p className="mt-2 text-sm text-secondary/80 sm:text-base">
            Choose us for unparalleled quality, exceptional service, and a
            commitment to your satisfaction. Join countless others who rely on
            us for reliability.
          </p>
        </header>

        <div className="mt-10 grid gap-6 sm:grid-cols-2 lg:grid-cols-4 lg:gap-5">
          {FEATURES.map((feature) => (
            <article
              key={feature.title}
              // Soft shadow spread on every side rather than cast downward,
              // so the card reads as floating off the photo.
              className={`${REVEAL_ITEM} rounded-2xl bg-background/85 p-6 shadow-[0_4px_36px_rgba(23,36,48,0.14)] backdrop-blur-sm transition-shadow duration-300 hover:shadow-[0_8px_48px_rgba(23,36,48,0.20)]`}
            >
              <Image
                src={feature.icon}
                alt=""
                width={55}
                height={44}
                className="h-10 w-auto"
              />
              <h3 className="mt-5 text-lg font-black text-secondary sm:text-xl">
                {feature.title}
              </h3>
              <p className="mt-3 text-sm leading-relaxed text-secondary/75">
                {feature.description}
              </p>
            </article>
          ))}
        </div>
      </div>
    </section>
  );
}
