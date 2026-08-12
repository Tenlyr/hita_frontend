import type { Metadata } from "next";

// The console is behind a login and has nothing to offer a search result.
export const metadata: Metadata = {
  title: {
    template: "%s · Hitadecor Console",
    // `absolute`, or the root template appends the site name to it as well.
    absolute: "Hitadecor Console",
  },
  robots: { index: false, follow: false },
};

// Lato now comes from the root layout so portalled UI inherits it too; this
// layout stays as the dashboard section boundary.
export default function DashboardLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return children;
}
