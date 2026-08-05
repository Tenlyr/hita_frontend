import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

import { APP_CONFIG } from "@/constants/config";
import { APP_ROUTES } from "@/constants/routes";

/**
 * Guards the admin console.
 *
 * This is an optimistic check: it only looks for the presence of the access
 * token cookie, never its validity. Real enforcement stays on the API, which
 * rejects expired or forged tokens — this just keeps signed-out visitors from
 * landing on a shell that would fail every request anyway.
 */
export function proxy(request: NextRequest) {
  const { pathname } = request.nextUrl;
  const isLoginRoute = pathname === APP_ROUTES.ADMIN.LOGIN;
  // Admin cookie only — a signed-in customer must not reach the admin console.
  const hasSession = Boolean(
    request.cookies.get(APP_CONFIG.adminAccessTokenCookieName)?.value,
  );

  if (!hasSession && !isLoginRoute) {
    const url = request.nextUrl.clone();
    url.pathname = APP_ROUTES.ADMIN.LOGIN;
    url.search = "";
    return NextResponse.redirect(url);
  }

  // Already signed in — no reason to show the login screen again.
  if (hasSession && isLoginRoute) {
    const url = request.nextUrl.clone();
    url.pathname = APP_ROUTES.APP.DASHBOARD;
    url.search = "";
    return NextResponse.redirect(url);
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/dashboard", "/dashboard/:path*"],
};
