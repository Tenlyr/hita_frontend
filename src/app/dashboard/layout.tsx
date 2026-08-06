// Lato now comes from the root layout so portalled UI inherits it too; this
// layout stays as the dashboard section boundary.
export default function DashboardLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return children;
}
