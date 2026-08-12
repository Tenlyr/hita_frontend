import type { MetadataRoute } from "next";

import { SITE, absoluteUrl } from "@/constants/seo";

export default function robots(): MetadataRoute.Robots {
  return {
    rules: [
      {
        userAgent: "*",
        allow: "/",
        // The console and anything personal: not secret, but nothing a search
        // result should ever land on.
        disallow: ["/dashboard", "/dashboard/", "/account", "/checkout"],
      },
    ],
    sitemap: absoluteUrl("/sitemap.xml"),
    host: SITE.url,
  };
}
