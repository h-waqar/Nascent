import { Types } from "mongoose";
import { ProductModel, RatingModel, ReviewModel } from "@/models";
import crypto from "crypto";
import { NextRequest } from "next/server";

export function getVisitorId(req: NextRequest, userId?: string | null): string {
  if (userId) return `user_${userId}`;

  const clientCookie = req.cookies.get("nascent_vid")?.value;
  if (clientCookie && clientCookie.length >= 8) {
    return `vid_${clientCookie.slice(0, 64)}`;
  }

  const forwarded = req.headers.get("x-forwarded-for") || "";
  const ip = forwarded.split(",")[0].trim() || req.headers.get("x-real-ip") || "unknown-ip";
  const userAgent = req.headers.get("user-agent") || "unknown-agent";

  const raw = `${ip}::${userAgent}`;
  return `guest_${crypto.createHash("sha256").update(raw).digest("hex").slice(0, 32)}`;
}

export async function recalculateProductRating(productId: Types.ObjectId | string) {
  const pId =
    typeof productId === "string" && Types.ObjectId.isValid(productId)
      ? new Types.ObjectId(productId)
      : productId;

  const [ratings, reviews] = await Promise.all([
    RatingModel.find({ productId: pId }).select("rating").lean(),
    ReviewModel.find({
      productId: pId,
      status: { $in: ["approved", "pending"] },
    })
      .select("rating")
      .lean(),
  ]);

  const allRatings = [
    ...ratings.map((r) => r.rating),
    ...reviews.map((r) => r.rating),
  ];

  const totalCount = allRatings.length;
  const avgRating =
    totalCount > 0
      ? Number((allRatings.reduce((sum, r) => sum + r, 0) / totalCount).toFixed(1))
      : 5.0;

  await ProductModel.findByIdAndUpdate(pId, {
    $set: {
      rating: avgRating,
      ratingCount: totalCount,
      reviewCount: reviews.length,
    },
  });

  return { rating: avgRating, ratingCount: totalCount, reviewCount: reviews.length };
}
