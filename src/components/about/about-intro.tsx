"use client";

import gsap from "gsap";
import Image from "next/image";
import * as React from "react";

import { REVEAL_ITEM, useGsapReveal } from "@/hooks/use-gsap-reveal";

/** Classes the collage effect targets, scoped through `gsap.context`. */
const HERO_PHOTO = "about-hero-photo";
const THUMB = "about-thumb";

/** All three cycle through the large frame; the thumbnails are the picker. */
const SHOTS = [
  {
    src: "/images/about_01.webp",
    alt: "Handcrafted ceramics on a timber shelf",
  },
  { src: "/images/about_02.webp", alt: "Styled living room with vases" },
  { src: "/images/about_03.webp", alt: "Console table and sunburst mirror" },
];

const SWITCH_MS = 4000;

export function AboutIntro() {
  // The copy uses the shared reveal so this page enters the same way the
  // landing sections do.
  const copyRef = useGsapReveal<HTMLDivElement>({ stagger: 0.09 });
  const collageRef = React.useRef<HTMLDivElement>(null);

  const [active, setActive] = React.useState(0);
  const frameRefs = React.useRef<Array<HTMLDivElement | null>>([]);
  const shown = React.useRef(0);
  const hasPainted = React.useRef(false);

  React.useEffect(() => {
    const timer = window.setInterval(
      () => setActive((current) => (current + 1) % SHOTS.length),
      SWITCH_MS,
    );
    return () => window.clearInterval(timer);
  }, [active]);

  // Crossfade with a touch of scale, so a switch settles rather than blinks.
  React.useEffect(() => {
    const frames = frameRefs.current;
    const incoming = frames[active];
    if (!incoming) return;

    const previous = shown.current;
    const outgoing = previous === active ? null : frames[previous];
    shown.current = active;

    const reduced = window.matchMedia(
      "(prefers-reduced-motion: reduce)",
    ).matches;

    // The first frame is already painted, so only later switches animate.
    if (!hasPainted.current || reduced) {
      hasPainted.current = true;
      gsap.set(frames.filter(Boolean) as HTMLDivElement[], { autoAlpha: 0 });
      gsap.set(incoming, { autoAlpha: 1, scale: 1 });
      return;
    }

    if (outgoing) {
      gsap.to(outgoing, { autoAlpha: 0, duration: 0.7, ease: "power2.inOut" });
    }
    gsap.fromTo(
      incoming,
      { autoAlpha: 0, scale: 1.08 },
      {
        autoAlpha: 1,
        scale: 1,
        duration: 0.9,
        ease: "power2.out",
        overwrite: "auto",
      },
    );
  }, [active]);

  React.useEffect(() => {
    if (!collageRef.current) return;
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;

    const context = gsap.context(() => {
      /* No ScrollTrigger. This section sits directly under the banner, so a
         trigger buys nothing — and it measures the section before the large
         photo has loaded, so the start point can end up below the scroll
         position and never fire, leaving `from` targets stuck at their
         starting values. That is what kept the thumbnails invisible. */

      // Scale only: `autoAlpha` here would fight the crossfade that decides
      // which frame is showing.
      gsap.from(`.${HERO_PHOTO}`, {
        scale: 1.12,
        duration: 1.2,
        ease: "power2.out",
      });

      /* `fromTo` rather than `from`: the end state is stated outright, so a
         tween that is interrupted or never started cannot strand the
         thumbnails at `visibility: hidden`. */
      gsap.fromTo(
        `.${THUMB}`,
        { xPercent: 20, autoAlpha: 0 },
        {
          xPercent: 0,
          autoAlpha: 1,
          duration: 0.8,
          ease: "power3.out",
          stagger: 0.15,
          delay: 0.3,
        },
      );
    }, collageRef);

    return () => context.revert();
  }, []);

  return (
    // The tint belongs to the whole band, not just the copy — otherwise the
    // photo column reads as a separate panel dropped beside it.
    <section className="bg-muted/60">
      <div className="mx-auto w-full max-w-7xl px-4 py-14 sm:px-6 sm:py-20">
        <div className="grid items-stretch gap-8 lg:grid-cols-2 lg:gap-0">
          <div ref={collageRef} className="relative lg:min-h-[36rem]">
            {/* Same shape as the product gallery: the frame stops short of the
              column so the thumbnails overhang it from the inside, rather
              than escaping the container and relying on overflow. */}
            <div className="relative aspect-[4/5] w-full overflow-hidden bg-muted sm:aspect-[5/4] lg:aspect-auto lg:h-full lg:w-[88%]">
              {SHOTS.map((shot, position) => (
                <div
                  key={shot.src}
                  ref={(node) => {
                    frameRefs.current[position] = node;
                  }}
                  aria-hidden={position !== active}
                  className={`${HERO_PHOTO} absolute inset-0${position === active ? "" : " opacity-0"}`}
                >
                  <Image
                    src={shot.src}
                    alt={position === active ? shot.alt : ""}
                    fill
                    priority={position === 0}
                    sizes="(max-width: 1024px) 100vw, 45vw"
                    className="object-cover"
                  />
                </div>
              ))}
            </div>

            {/* A row underneath on small screens, a stack overhanging the photo
              from lg — so they are reachable at every width. */}
            <div className="no-scrollbar mt-4 flex gap-3 overflow-x-auto lg:absolute lg:top-1/2 lg:right-0 lg:mt-0 lg:-translate-y-1/2 lg:flex-col lg:gap-4 lg:overflow-visible">
              {SHOTS.map((shot, position) => (
                <button
                  key={shot.src}
                  type="button"
                  onClick={() => setActive(position)}
                  aria-label={`Show ${shot.alt}`}
                  aria-current={position === active}
                  className={`${THUMB} relative size-20 shrink-0 cursor-pointer overflow-hidden border-2 transition-colors sm:size-24 lg:size-32 lg:border-4 lg:shadow-lg ${
                    position === active
                      ? "border-primary"
                      : "border-transparent hover:border-border lg:border-background"
                  }`}
                >
                  <Image
                    src={shot.src}
                    alt=""
                    fill
                    sizes="128px"
                    className="object-cover"
                  />
                </button>
              ))}
            </div>
          </div>

          <div
            ref={copyRef}
            className="flex flex-col justify-center lg:py-6 lg:pl-14"
          >
            <Image
              src="/icons/ic_about.svg"
              alt=""
              width={55}
              height={44}
              className={`${REVEAL_ITEM} h-12 w-auto sm:h-16`}
            />

            <h2
              className={`${REVEAL_ITEM} mt-5 text-2xl font-black text-secondary sm:text-3xl`}
            >
              Welcome to hita
            </h2>

            <div className="mt-4 space-y-4 text-sm leading-relaxed text-secondary/80 sm:text-base">
              <p className={REVEAL_ITEM}>
                Heritage Inspired Timeless Aesthetics, where tradition meets
                elegance, and every piece tells a story.
              </p>

              <p className={REVEAL_ITEM}>
                At hita, we believe a home is more than just a space — it is a
                reflection of emotions, memories and personal style. Our mission
                is to bring you décor you live with rather than simply look at.
              </p>

              <p className={REVEAL_ITEM}>
                Our products are deeply rooted in heritage, drawing inspiration
                from the rich craftsmanship and timeless beauty of traditional
                art forms. Each product we curate carries the soul of skilled
                artisans, blending old-world charm with contemporary elegance.
                Whether it is eco-fusion bowls, handwoven baskets, wooden
                accents, ceramic pieces or rustic décor, every creation is a
                tribute to the artistry of the past, reimagined for modern
                homes.
              </p>

              <p className={`${REVEAL_ITEM} font-bold text-primary underline`}>
                Our Motto — #Myhitahome
              </p>

              <p className={REVEAL_ITEM}>
                We take pride in making every home a hita home. Each piece we
                offer is thoughtfully chosen to enhance the beauty of your
                space, making it feel more inviting and special. When you bring
                hita into your home you become part of our journey — one where
                aesthetics meet comfort, and where heritage finds a place in
                everyday living.
              </p>

              <p className={REVEAL_ITEM}>
                <span className="font-bold text-secondary">
                  Our goal is simple:
                </span>{" "}
                to bring you the best home décor products, the kind that make
                you feel happy, special and truly at home.
              </p>

              <p className={REVEAL_ITEM}>
                Let&apos;s make every space beautiful, together.
              </p>

              <p className={`${REVEAL_ITEM} text-primary italic`}>
                &ldquo;Welcome to hita — where your home is our home.&rdquo;
              </p>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
