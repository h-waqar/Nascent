import { clerkMiddleware, createRouteMatcher, clerkClient } from "@clerk/nextjs/server";
import { NextResponse } from "next/server";
import type { Roles } from "@/types/globals";

const isAdminRoute = createRouteMatcher(["/admin(.*)", "/api/admin(.*)"]);

const isPublicRoute = createRouteMatcher([
  "/",
  "/collections(.*)",
  "/products(.*)",
  "/contact(.*)",
  "/about(.*)",
  "/archive(.*)",
  "/stores(.*)",
  "/privacy(.*)",
  "/terms(.*)",
  "/shipping(.*)",
  "/sign-in(.*)",
  "/sign-up(.*)",
  "/api/products(.*)",
  "/api/categories(.*)",
  "/api/settings(.*)",
]);

export default clerkMiddleware(async (auth, request) => {
  if (isAdminRoute(request)) {
    const { userId, sessionClaims } = await auth();
    if (!userId) {
      if (request.nextUrl.pathname.startsWith("/api/")) {
        return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
      }
      const signInUrl = new URL("/sign-in", request.url);
      signInUrl.searchParams.set("redirect_url", request.url);
      return NextResponse.redirect(signInUrl);
    }

    let role = sessionClaims?.metadata?.role;
    if (!role) {
      try {
        const client = await clerkClient();
        const user = await client.users.getUser(userId);
        role = (user.publicMetadata as { role?: Roles })?.role;
      } catch {
        // ignore
      }
    }

    if (role !== "admin") {
      if (request.nextUrl.pathname.startsWith("/api/")) {
        return NextResponse.json({ error: "Forbidden" }, { status: 403 });
      }
      return NextResponse.redirect(new URL("/", request.url));
    }
    return; // admin passes through
  }
  if (!isPublicRoute(request)) {
    await auth.protect();
  }
});

export const config = {
  matcher: [
    "/((?!_next|[^?]*\\.(?:html?|css|js(?!on)|jpe?g|webp|png|gif|svg|ttf|woff2?|ico|csv|docx?|xlsx?|zip|webmanifest)).*)",
    "/(api|trpc)(.*)",
  ],
};
