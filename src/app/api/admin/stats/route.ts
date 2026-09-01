import { NextResponse } from "next/server";
import { requireAdmin } from "@/lib/requireAdmin";
import { getAdminStats } from "@/lib/adminStats";

export async function GET() {
  const deny = await requireAdmin();
  if (deny) return deny;

  try {
    const stats = await getAdminStats();
    return NextResponse.json({ stats });
  } catch (e) {
    console.error("GET /api/admin/stats:", e);
    return NextResponse.json({ error: "Failed to fetch stats" }, { status: 500 });
  }
}
