import { auth } from "@/lib/auth";
import { NextResponse } from "next/server";

// Protect all app pages except auth & public assets
export default auth((req) => {
  const { nextUrl } = req;
  const pathname = nextUrl.pathname;

  // Allow unauthenticated access to login and auth endpoints
  const publicPaths = ["/login", "/register", "/api/auth", "/favicon.ico"];
  if (publicPaths.some((p) => pathname.startsWith(p))) {
    return NextResponse.next();
  }

  // If no user, redirect to login
  // req.auth is injected by NextAuth v5 middleware wrapper
  if (!req.auth?.user) {
    const url = new URL("/login", nextUrl);
    url.searchParams.set("next", pathname);
    return NextResponse.redirect(url);
  }

  return NextResponse.next();
});

export const config = {
  // Exclude Next internals; block everything else under /app
  matcher: ["/((?!_next|assets|images|public).*)"],
};
