import mongoose from "mongoose";
import { NextRequest, NextResponse } from "next/server";
import connectToDatabase from "@/lib/db";
import { requireAdmin } from "@/lib/requireAdmin";
import { ReviewModel } from "@/models";
import { UpdateReviewCurationSchema } from "@/lib/schemas";
import { toAdminReview } from "@/lib/reviewDtos";
import type { ReviewStatus } from "@/types/models";

type AdminReviewRouteContext = {
  params: Promise<{ id: string }>;
};

export async function PATCH(req: NextRequest, { params }: AdminReviewRouteContext) {
  const authError = await requireAdmin();
  if (authError) return authError;

  const { id } = await params;
  if (!mongoose.Types.ObjectId.isValid(id)) {
    return NextResponse.json({ error: "Invalid review id" }, { status: 400 });
  }

  let body: unknown;
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON" }, { status: 400 });
  }

  const parsed = UpdateReviewCurationSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json(
      { error: "Invalid curation payload", details: parsed.error.flatten() },
      { status: 400 }
    );
  }

  try {
    await connectToDatabase();

    const existing = await ReviewModel.findById(id).lean();
    if (!existing) {
      return NextResponse.json({ error: "Review not found" }, { status: 404 });
    }

    const currentStatus = existing.status as ReviewStatus;
    const nextStatus = parsed.data.status ?? currentStatus;
    const canAppearPublicly = !["hidden", "rejected"].includes(nextStatus);

    if (parsed.data.isFeatured === true && !canAppearPublicly) {
      return NextResponse.json(
        { error: "Hidden or rejected reviews cannot be featured on the homepage" },
        { status: 400 }
      );
    }

    if (
      parsed.data.featuredRank !== undefined &&
      parsed.data.featuredRank !== null &&
      !canAppearPublicly
    ) {
      return NextResponse.json(
        { error: "Hidden or rejected reviews cannot receive a homepage rank" },
        { status: 400 }
      );
    }

    const set: Record<string, unknown> = {};

    if (parsed.data.status) {
      set.status = parsed.data.status;
    }

    if (!canAppearPublicly) {
      set.isFeatured = false;
      set.featuredRank = null;
    } else {
      if (parsed.data.isFeatured !== undefined) {
        set.isFeatured = parsed.data.isFeatured;
        set.featuredRank = parsed.data.isFeatured
          ? parsed.data.featuredRank ?? existing.featuredRank ?? 100
          : null;
      }

      if (parsed.data.featuredRank !== undefined && parsed.data.isFeatured !== false) {
        set.featuredRank = parsed.data.featuredRank;
      }
    }

    const update: Record<string, unknown> = {};
    if (Object.keys(set).length > 0) update.$set = set;

    const review = await ReviewModel.findByIdAndUpdate(id, update, {
      new: true,
      runValidators: true,
    }).lean();

    return NextResponse.json({
      review: toAdminReview(review as unknown as Record<string, unknown>),
    });
  } catch (error) {
    console.error(`PATCH /api/admin/reviews/${id}:`, error);
    return NextResponse.json({ error: "Failed to update review" }, { status: 500 });
  }
}
