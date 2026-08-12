import type { Metadata } from "next";
import { Geist_Mono, Lato } from "next/font/google";
import "./globals.css";

import { SITE } from "@/constants/seo";

// Lato is the app-wide default so portalled UI (popovers, tooltips, toasts,
// sheets) inherits it — those render into <body>, outside any section layout.
// The landing section overrides --font-sans with Josefin Sans locally.
const lato = Lato({
  variable: "--font-sans",
  subsets: ["latin"],
  weight: ["100", "300", "400", "700", "900"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  // Everything relative — canonicals, og:image — resolves against this, so it
  // has to be the real public origin in production.
  metadataBase: new URL(SITE.url),
  title: {
    // Pages pass a bare title; the site name is appended once, here.
    template: `%s · ${SITE.name}`,
    default: `${SITE.name} — ${SITE.tagline}`,
  },
  description: SITE.description,
  applicationName: SITE.name,
  keywords: [
    "home decor",
    "handcrafted decor",
    "mango wood tray",
    "resin inlay",
    "marble coasters",
    "serving tray",
    "Coimbatore",
    SITE.name,
  ],
  authors: [{ name: SITE.name, url: SITE.url }],
  creator: SITE.name,
  publisher: SITE.name,
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      // Let Google show full-size image previews and longer snippets rather
      // than the conservative defaults.
      "max-image-preview": "large",
      "max-snippet": -1,
      "max-video-preview": -1,
    },
  },
  openGraph: {
    type: "website",
    siteName: SITE.name,
    locale: SITE.locale,
    url: SITE.url,
    title: `${SITE.name} — ${SITE.tagline}`,
    description: SITE.description,
    images: [{ url: SITE.ogImage, width: 1200, height: 630, alt: SITE.name }],
  },
  twitter: {
    card: "summary_large_image",
    title: `${SITE.name} — ${SITE.tagline}`,
    description: SITE.description,
    images: [SITE.ogImage],
  },
  // app/icon.png is picked up by convention; naming it here as well covers
  // the Apple touch icon, which is not inferred from it.
  icons: {
    icon: "/icon.png",
    apple: "/icon.png",
  },
  formatDetection: { telephone: false },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="en"
      className={`${lato.variable} ${geistMono.variable} font-sans antialiased`}
      suppressHydrationWarning
    >
      {/* No height:100% chain here — percentage heights on html/body stop
          `position: sticky` descendants from having any range to stick in. */}
      <body className="flex min-h-screen flex-col">{children}</body>
    </html>
  );
}
