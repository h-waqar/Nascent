import { NextRequest, NextResponse } from "next/server";
import connectToDatabase from "@/lib/db";
import { ReviewModel } from "@/models";
import { toPublicReview } from "@/lib/reviewDtos";

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const requestedLimit = Number(searchParams.get("limit") ?? 6);
  const limit = Number.isFinite(requestedLimit)
    ? Math.max(1, Math.min(Math.trunc(requestedLimit), 12))
    : 6;

  try {
    await connectToDatabase();

    const reviews = await ReviewModel.find({
      status: "approved",
      isFeatured: true,
    })
      .sort({ featuredRank: 1, updatedAt: -1 })
      .limit(limit)
      .lean();

    return NextResponse.json({
      reviews: reviews.map((review) => toPublicReview(review as unknown as Record<string, unknown>)),
    });
  } catch (error) {
    console.error("GET /api/reviews/homepage:", error);
    return NextResponse.json({ error: "Failed to fetch homepage reviews" }, { status: 500 });
  }
}
