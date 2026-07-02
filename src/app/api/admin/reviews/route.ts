import { NextRequest, NextResponse } from "next/server";
import connectToDatabase from "@/lib/db";
import { requireAdmin } from "@/lib/requireAdmin";
import { ReviewModel } from "@/models";
import { REVIEW_STATUSES } from "@/lib/schemas";
import { toAdminReview } from "@/lib/reviewDtos";

export async function GET(req: NextRequest) {
  const authError = await requireAdmin();
  if (authError) return authError;

  const { searchParams } = new URL(req.url);
  const status = searchParams.get("status");
  const before = searchParams.get("before");
  const requestedLimit = Number(searchParams.get("limit") ?? 50);
  const limit = Number.isFinite(requestedLimit)
    ? Math.max(1, Math.min(Math.trunc(requestedLimit), 100))
    : 50;

  const filter: Record<string, unknown> = {};
  if (status && REVIEW_STATUSES.includes(status as (typeof REVIEW_STATUSES)[number])) {
    filter.status = status;
  }
  if (before) {
    const beforeDate = new Date(before);
    if (!Number.isNaN(beforeDate.getTime())) {
      filter.updatedAt = { $lt: beforeDate };
    }
  }

  try {
    await connectToDatabase();

    const docs = await ReviewModel.find(filter)
      .sort({ updatedAt: -1 })
      .limit(limit + 1)
      .lean();
    const page = docs.slice(0, limit);
    const last = page.at(-1) as { updatedAt?: Date } | undefined;

    return NextResponse.json({
      reviews: page.map((review) => toAdminReview(review as unknown as Record<string, unknown>)),
      nextCursor: docs.length > limit && last?.updatedAt ? last.updatedAt.toISOString() : null,
    });
  } catch (error) {
    console.error("GET /api/admin/reviews:", error);
    return NextResponse.json({ error: "Failed to fetch reviews" }, { status: 500 });
  }
}
