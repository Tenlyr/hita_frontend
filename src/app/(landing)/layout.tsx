import { Josefin_Sans } from "next/font/google";

import { SiteHeader } from "@/components/layout/site-header";

const josefinSans = Josefin_Sans({
  variable: "--font-sans",
  subsets: ["latin"],
  weight: ["300", "400", "500", "600", "700"],
});

export default function LandingLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <div
      className={`${josefinSans.variable} font-sans flex min-h-screen flex-col`}
    >
      <SiteHeader />
      {children}
    </div>
  );
}
