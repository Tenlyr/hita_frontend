import { DashboardView } from "@/components/dashboard/dashboard-view";

export const metadata = { title: "Overview" };

export default function DashboardPage() {
  return (
    <div className="w-full space-y-6">
      <header>
        <h1 className="text-2xl font-black text-secondary sm:text-3xl">
          Dashboard
        </h1>
        <p className="mt-1 text-sm text-muted-foreground">
          Sales, stock and what has happened lately.
        </p>
      </header>

      <DashboardView />
    </div>
  );
}
