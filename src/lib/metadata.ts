import type { Metadata } from "next";

import { SITE, absoluteUrl, clampDescription } from "@/constants/seo";

interface PageMetaOptions {
  title: string;
  description?: string;
  /** Route path, used for the canonical URL. */
  path: string;
  image?: string | null;
  /** Screens behind a login, or that duplicate other pages, stay out of the index. */
  noIndex?: boolean;
  type?: "website" | "article";
}

/**
 * Page metadata with the parts that are easy to forget: a canonical URL, and
 * Open Graph and Twitter cards that carry an absolute image.
 *
 * The title is left bare — the root layout's template appends the site name,
 * so passing "Contact Us" here renders "Contact Us · Hitadecor".
 */
export function pageMetadata({
  title,
  description,
  path,
  image,
  noIndex = false,
  type = "website",
}: PageMetaOptions): Metadata {
  const summary = clampDescription(description || SITE.description);
  // Social cards have no template to lean on, so the brand is appended here —
  // unless the title already says it, as the home page's does.
  const socialTitle = title.includes(SITE.name)
    ? title
    : `${title} · ${SITE.name}`;
  const url = absoluteUrl(path);
  const ogImage = image ? absoluteUrl(image) : absoluteUrl(SITE.ogImage);

  return {
    title,
    description: summary,
    alternates: { canonical: url },
    robots: noIndex
      ? { index: false, follow: false }
      : { index: true, follow: true },
    openGraph: {
      title: socialTitle,
      description: summary,
      url,
      siteName: SITE.name,
      locale: SITE.locale,
      type,
      images: [{ url: ogImage, width: 1200, height: 630, alt: title }],
    },
    twitter: {
      card: "summary_large_image",
      title: socialTitle,
      description: summary,
      images: [ogImage],
    },
  };
}
