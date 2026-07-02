import { NextRequest, NextResponse } from "next/server";
import type { SortOrder } from "mongoose";
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
  const featured = searchParams.get("featured");
  const before = searchParams.get("before");
  const from = searchParams.get("from");
  const to = searchParams.get("to");
  const sortParam = searchParams.get("sort") ?? "newest";
  const requestedLimit = Number(searchParams.get("limit") ?? 50);
  const limit = Number.isFinite(requestedLimit)
    ? Math.max(1, Math.min(Math.trunc(requestedLimit), 100))
    : 50;

  const filter: Record<string, unknown> = {};
  if (status && REVIEW_STATUSES.includes(status as (typeof REVIEW_STATUSES)[number])) {
    filter.status = status;
  }
  if (featured === "true") filter.isFeatured = true;
  if (featured === "false") filter.isFeatured = { $ne: true };

  const createdAt: Record<string, Date> = {};
  if (from) {
    const fromDate = new Date(from);
    if (!Number.isNaN(fromDate.getTime())) createdAt.$gte = fromDate;
  }
  if (to) {
    const toDate = new Date(to);
    if (!Number.isNaN(toDate.getTime())) createdAt.$lte = toDate;
  }
  if (Object.keys(createdAt).length > 0) {
    filter.createdAt = createdAt;
  }

  if (before) {
    const beforeDate = new Date(before);
    if (!Number.isNaN(beforeDate.getTime())) {
      filter.updatedAt = { $lt: beforeDate };
    }
  }

  const sort: Record<string, SortOrder> =
    sortParam === "oldest"
      ? { createdAt: 1 }
      : sortParam === "rank"
        ? { isFeatured: -1, featuredRank: 1, updatedAt: -1 }
        : { createdAt: -1 };

  try {
    await connectToDatabase();

    const docs = await ReviewModel.find(filter)
      .sort(sort)
      .limit(limit + 1)
      .lean();
    const page = docs.slice(0, limit);
    const last = page.at(-1) as { updatedAt?: Date } | undefined;
    const [total, published, hidden, featuredCount] = await Promise.all([
      ReviewModel.countDocuments({}),
      ReviewModel.countDocuments({ status: { $nin: ["hidden", "rejected"] } }),
      ReviewModel.countDocuments({ status: "hidden" }),
      ReviewModel.countDocuments({ status: { $nin: ["hidden", "rejected"] }, isFeatured: true }),
    ]);

    return NextResponse.json({
      reviews: page.map((review) => toAdminReview(review as unknown as Record<string, unknown>)),
      nextCursor: docs.length > limit && last?.updatedAt ? last.updatedAt.toISOString() : null,
      counts: {
        total,
        published,
        hidden,
        featured: featuredCount,
        unfeatured: Math.max(0, published - featuredCount),
      },
    });
  } catch (error) {
    console.error("GET /api/admin/reviews:", error);
    return NextResponse.json({ error: "Failed to fetch reviews" }, { status: 500 });
  }
}
