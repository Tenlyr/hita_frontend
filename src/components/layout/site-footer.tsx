import Image from "next/image";
import Link from "next/link";

import { CartLink, WishlistLink } from "@/components/layout/footer-shop-links";
import { NewsletterForm } from "@/components/layout/newsletter-form";
import { BrandIcon, type BrandNetwork } from "@/components/ui/brand-icon";
import { APP_ROUTES } from "@/constants/routes";

const { SHOP } = APP_ROUTES;

const LINK_CLASS = "text-white/75 transition-colors hover:text-primary";

const LINK_COLUMNS: {
  title: string;
  links: { label: string; href: string }[];
}[] = [
  {
    title: "Sitemap",
    links: [
      { label: "About", href: SHOP.ABOUT },
      { label: "Contact", href: SHOP.CONTACT },
    ],
  },
  {
    title: "Others",
    links: [
      { label: "Privacy Policy", href: SHOP.PRIVACY_POLICY },
      { label: "Shipping Policy", href: SHOP.SHIPPING_POLICY },
      { label: "Return Policy", href: SHOP.RETURN_POLICY },
    ],
  },
  {
    title: "Customer Service",
    links: [
      { label: "FAQs", href: SHOP.FAQ },
      { label: "Terms & Condition", href: SHOP.TERMS },
    ],
  },
];

const SOCIALS: { network: BrandNetwork; href: string; label: string }[] = [
  { network: "facebook", href: "https://facebook.com", label: "Facebook" },
  { network: "whatsapp", href: "https://wa.me/", label: "WhatsApp" },
  { network: "instagram", href: "https://instagram.com", label: "Instagram" },
];

/** Both are actions rather than links: the cart opens its drawer, and the
    wishlist needs an account behind it. */
function ShopColumn() {
  return (
    <div>
      <h3 className="text-lg font-black text-white sm:text-xl">Shop</h3>
      <ul className="mt-5 space-y-3">
        <li>
          <CartLink className={`${LINK_CLASS} cursor-pointer`} />
        </li>
        <li>
          <WishlistLink className={`${LINK_CLASS} cursor-pointer`} />
        </li>
      </ul>
    </div>
  );
}

function LinkColumn({ title, links }: (typeof LINK_COLUMNS)[number]) {
  return (
    <div>
      <h3 className="text-lg font-black text-white sm:text-xl">{title}</h3>
      <ul className="mt-5 space-y-3">
        {links.map((link) => (
          <li key={link.label}>
            <Link href={link.href} className={LINK_CLASS}>
              {link.label}
            </Link>
          </li>
        ))}
      </ul>
    </div>
  );
}

export function SiteFooter() {
  const [sitemap, others, service] = LINK_COLUMNS;

  return (
    <footer className="relative isolate mt-auto overflow-hidden">
      <Image
        src="/images/footer.jpg"
        alt=""
        fill
        sizes="100vw"
        className="-z-10 object-cover"
      />
      {/* Heavy scrim: the photo is decorative, the copy has to stay readable. */}
      <div className="absolute inset-0 -z-10 bg-secondary/92" />

      <div className="mx-auto w-full max-w-7xl px-4 pt-16 pb-6 sm:px-6 sm:pt-20 sm:pb-8">
        <div className="grid gap-8 lg:grid-cols-2 lg:items-center lg:gap-16">
          <div>
            <h2 className="text-3xl font-black text-white sm:text-4xl">
              Newsletter
            </h2>
            <p className="mt-4 max-w-md leading-relaxed text-white/75">
              Stay in the loop with exclusive offers and updates. Subscribe to
              our newsletter for the latest trends and promotions delivered.
            </p>
          </div>
          <NewsletterForm />
        </div>

        {/* Brand sits in the middle column on desktop, first on mobile so the
            wordmark is not buried under four link lists. */}
        <div className="mt-16 grid gap-10 sm:grid-cols-2 lg:grid-cols-6 lg:gap-8">
          {/* Two columns wide: the blurb reads badly at link-column width. */}
          <div className="order-1 lg:order-3 lg:col-span-2 lg:text-center">
            <Image
              src="/logo.svg"
              alt="hita"
              width={87}
              height={49}
              className="h-11 w-auto lg:mx-auto"
            />
            <p className="mt-5 leading-relaxed text-white/75">
              Discover our collection of thoughtfully curated handcrafted pieces
              that bring beauty and artistry to your space. Each item tells a
              story of traditional craftsmanship and contemporary design.
            </p>
            <div className="mt-6 flex gap-3 lg:justify-center">
              {SOCIALS.map((social) => (
                <a
                  key={social.network}
                  href={social.href}
                  target="_blank"
                  rel="noopener noreferrer"
                  aria-label={social.label}
                  className="flex size-10 items-center justify-center rounded-full border border-white/30 text-white transition-colors hover:border-primary hover:text-primary"
                >
                  <BrandIcon network={social.network} className="size-4" />
                </a>
              ))}
            </div>
          </div>

          <div className="order-2 lg:order-1">
            <LinkColumn {...sitemap} />
          </div>
          {/* 2nd and 4th columns centre on desktop, framing the brand block. */}
          <div className="order-3 lg:order-2 lg:text-center">
            <LinkColumn {...others} />
          </div>
          <div className="order-4 lg:order-4 lg:text-center">
            <ShopColumn />
          </div>
          <div className="order-5 lg:order-5">
            <LinkColumn {...service} />
          </div>
        </div>

        {/* One template literal, not mixed JSX text and an expression: JSX
            strips the space after {year}, and a {" "} fix gets removed again
            by the formatter. */}
        <div className="mt-14 border-t border-white/15 pt-6 text-center text-sm text-white/70">
          {`© ${new Date().getFullYear()} Developed & Maintained by Raise High Tech Pvt. Ltd.`}
        </div>
      </div>
    </footer>
  );
}
