import mongoose from "mongoose";
import { NextRequest, NextResponse } from "next/server";
import { auth } from "@clerk/nextjs/server";
import connectToDatabase from "@/lib/db";
import { requireAdmin } from "@/lib/requireAdmin";
import { ReviewModel } from "@/models";
import { UpdateReviewModerationSchema } from "@/lib/schemas";
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

  const parsed = UpdateReviewModerationSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json(
      { error: "Invalid moderation payload", details: parsed.error.flatten() },
      { status: 400 }
    );
  }

  try {
    await connectToDatabase();

    const existing = await ReviewModel.findById(id).lean();
    if (!existing) {
      return NextResponse.json({ error: "Review not found" }, { status: 404 });
    }

    const { userId: adminUserId } = await auth();
    const currentStatus = existing.status as ReviewStatus;
    const nextStatus = parsed.data.status ?? currentStatus;

    if (parsed.data.isFeatured === true && nextStatus !== "approved") {
      return NextResponse.json(
        { error: "Only approved reviews can be featured on the homepage" },
        { status: 400 }
      );
    }

    if (
      parsed.data.featuredRank !== undefined &&
      parsed.data.featuredRank !== null &&
      nextStatus !== "approved"
    ) {
      return NextResponse.json(
        { error: "Only approved reviews can receive a homepage rank" },
        { status: 400 }
      );
    }

    const set: Record<string, unknown> = {};
    const unset: Record<string, true> = {};

    if (parsed.data.status) {
      set.status = parsed.data.status;
      set.moderatedBy = adminUserId ?? "admin";
      set.moderatedAt = new Date();
    }

    if (parsed.data.moderationReason !== undefined) {
      const reason = parsed.data.moderationReason.trim();
      if (reason) {
        set.moderationReason = reason;
      } else {
        unset.moderationReason = true;
      }
    }

    if (nextStatus !== "approved") {
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
    if (Object.keys(unset).length > 0) update.$unset = unset;

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
