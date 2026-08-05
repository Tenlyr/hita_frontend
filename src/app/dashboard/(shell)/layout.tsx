import { DashboardSidebar } from "@/components/layout/dashboard-sidebar";
import { DashboardUserProfile } from "@/components/layout/dashboard-user-profile";
import {
  SidebarInset,
  SidebarProvider,
  SidebarTrigger,
} from "@/components/ui/sidebar";
import { Toaster } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";

export default function DashboardShellLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <TooltipProvider>
      <SidebarProvider
        style={
          {
            "--sidebar-width": "15rem",
            "--sidebar-width-icon": "4.5rem",
          } as React.CSSProperties
        }
      >
        <DashboardSidebar />
        <SidebarInset className="bg-muted">
          <header className="sticky top-0 z-30 flex h-16 shrink-0 items-center gap-3 border-b border-border bg-background px-4">
            <SidebarTrigger className="size-8" />
            <div className="ml-auto">
              <DashboardUserProfile />
            </div>
          </header>
          <div className="flex-1 p-4 sm:p-6">{children}</div>
        </SidebarInset>
        <Toaster position="bottom-right" richColors closeButton />
      </SidebarProvider>
    </TooltipProvider>
  );
}
