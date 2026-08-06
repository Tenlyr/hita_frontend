"use client";

import type { AuthUser } from "@/types/session.types";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { useCurrentUser } from "@/hooks/use-current-user";

function initialsFor(user: AuthUser): string {
  const source = user.name || user.email || user.phone_number;
  return source
    .split(/[\s@.]+/)
    .filter(Boolean)
    .slice(0, 2)
    .map((part) => part[0]?.toUpperCase() ?? "")
    .join("");
}

/** Read-only profile block in the dashboard top bar. Logout lives in the sidebar. */
export function DashboardUserProfile() {
  const { user, isLoading } = useCurrentUser();

  if (!user) {
    return isLoading ? (
      <div className="flex items-center gap-3">
        <div className="hidden gap-1.5 sm:flex sm:flex-col sm:items-end">
          <div className="h-3.5 w-36 animate-pulse rounded bg-muted" />
          <div className="h-3 w-16 animate-pulse rounded bg-muted" />
        </div>
        <div className="size-9 animate-pulse rounded-full bg-muted" />
      </div>
    ) : null;
  }

  return (
    <div className="flex items-center gap-3">
      <span className="hidden leading-tight sm:flex sm:flex-col sm:items-end">
        <span className="text-sm font-bold text-secondary">
          {user.email ?? user.phone_number}
        </span>
        <span className="text-xs text-muted-foreground">
          {user.name || (user.is_staff ? "Admin" : "Customer")}
        </span>
      </span>
      <Avatar className="size-9">
        <AvatarFallback className="bg-sidebar text-sm font-semibold text-sidebar-foreground">
          {initialsFor(user)}
        </AvatarFallback>
      </Avatar>
    </div>
  );
}
