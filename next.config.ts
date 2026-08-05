import type { NextConfig } from "next";

// Product images are served by Django from a different origin, so the host has
// to be allow-listed before next/image will render them.
const apiOrigin = (() => {
  try {
    return new URL(
      process.env.NEXT_PUBLIC_API_BASE_URL ?? "http://127.0.0.1:8000/api/v1",
    );
  } catch {
    return null;
  }
})();

const nextConfig: NextConfig = {
  images: {
    remotePatterns: [
      {
        protocol: "http",
        hostname: "127.0.0.1",
        port: "8000",
        pathname: "/media/**",
      },
      {
        protocol: "http",
        hostname: "localhost",
        port: "8000",
        pathname: "/media/**",
      },
      ...(apiOrigin
        ? [
            {
              protocol: apiOrigin.protocol.replace(":", "") as "http" | "https",
              hostname: apiOrigin.hostname,
              port: apiOrigin.port,
              pathname: "/media/**",
            },
          ]
        : []),
    ],
  },
};

export default nextConfig;
