import { auth } from "@clerk/nextjs/server";
import { NextResponse } from "next/server";

/**
 * Call at the top of every /api/admin/* route handler.
 * Returns null when the request is from a confirmed admin.
 * Returns a NextResponse (401 if not signed in, 403 if signed in but not admin)
 * — the caller must return it immediately.
 */
export async function requireAdmin(): Promise<NextResponse | null> {
  const { userId, sessionClaims } = await auth();
  if (!userId) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
  if (sessionClaims?.metadata?.role !== "admin") {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }
  return null;
}
