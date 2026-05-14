import { clerkMiddleware, createRouteMatcher } from "@clerk/nextjs/server";
import { NextResponse } from "next/server";

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
    const { sessionClaims } = await auth();
    if (sessionClaims?.metadata?.role !== "admin") {
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
