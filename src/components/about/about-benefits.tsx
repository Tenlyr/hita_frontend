"use client";

import Image from "next/image";

import { REVEAL_ITEM, useGsapReveal } from "@/hooks/use-gsap-reveal";

const BENEFITS = [
  {
    icon: "/icons/ic_shipping.svg",
    title: "Free Shipping",
    description:
      "Enjoy hassle-free shopping with complimentary shipping on all orders. Elevate your experience without the extra cost.",
  },
  {
    icon: "/icons/ic_return.svg",
    title: "Easy to Return",
    description:
      "Satisfaction guaranteed or your money back. Enjoy stress-free returns with our hassle-free process.",
  },
  {
    icon: "/icons/ic_secure_payment.svg",
    title: "Secure Payment",
    description:
      "Shop with confidence knowing your payments are secure. Our encrypted checkout ensures your information stays protected.",
  },
  {
    icon: "/icons/ic_support.svg",
    title: "Customer Support",
    description:
      "Experience dedicated support tailored to your needs. Our team is here to assist you every step of the way.",
  },
  {
    icon: "/icons/ic_product.svg",
    title: "Product QC Team",
    description:
      "Our meticulous QC team ensures every item meets our highest standards. Trust in quality assurance that goes beyond expectation.",
  },
];

/**
 * The five-up promise row.
 *
 * Deliberately not the landing page's `WhyChooseUs`: that one is four items
 * over a background photo with a left-aligned header. Sharing a component
 * across both would mean a prop for every difference.
 */
export function AboutBenefits() {
  const containerRef = useGsapReveal<HTMLDivElement>({ stagger: 0.1 });

  return (
    <section className="py-14 sm:py-20">
      <div ref={containerRef} className="mx-auto w-full max-w-7xl px-4 sm:px-6">
        <header className={`${REVEAL_ITEM} mx-auto max-w-2xl text-center`}>
          <Image
            src="/icons/ic_why_choose.svg"
            alt=""
            width={64}
            height={63}
            className="mx-auto h-14 w-auto sm:h-16"
          />
          <h2 className="mt-4 text-2xl font-black text-secondary sm:text-3xl">
            Why You Choose Us
          </h2>
          <p className="mt-3 text-sm leading-relaxed text-secondary/75 sm:text-base">
            Choose us for exceptional quality. We prioritise your satisfaction
            by offering premium products and a seamless shopping experience.
          </p>
        </header>

        <div className="mt-12 grid gap-8 sm:grid-cols-2 lg:grid-cols-5 lg:gap-6">
          {BENEFITS.map((benefit) => (
            <article key={benefit.title} className={REVEAL_ITEM}>
              <Image
                src={benefit.icon}
                alt=""
                width={55}
                height={44}
                className="h-10 w-auto"
              />
              <h3 className="mt-5 text-lg font-black text-secondary">
                {benefit.title}
              </h3>
              <p className="mt-3 text-sm leading-relaxed text-secondary/75">
                {benefit.description}
              </p>
            </article>
          ))}
        </div>
      </div>
    </section>
  );
}
