import { NextRequest, NextResponse } from "next/server";
import { auth } from "@clerk/nextjs/server";
import connectToDatabase from "@/lib/db";
import { ProductModel, RatingModel } from "@/models";
import { takeFixedWindowRateLimit } from "@/lib/rateLimit";
import { getVisitorId, recalculateProductRating } from "@/lib/ratingHelpers";
import crypto from "crypto";

type ProductRouteContext = {
  params: Promise<{ slug: string }>;
};

export async function GET(req: NextRequest, { params }: ProductRouteContext) {
  const { slug } = await params;

  try {
    await connectToDatabase();
    const { userId } = await auth().catch(() => ({ userId: null }));
    const visitorId = getVisitorId(req, userId);

    const product = await ProductModel.findOne({ slug, hidden: { $ne: true } })
      .select("_id slug name rating ratingCount reviewCount")
      .lean();

    if (!product) {
      return NextResponse.json({ error: "Product not found" }, { status: 404 });
    }

    const userRatingDoc = await RatingModel.findOne({
      productId: product._id,
      visitorId,
    }).lean();

    return NextResponse.json({
      rating: product.rating ?? 5.0,
      ratingCount: product.ratingCount ?? 0,
      reviewCount: product.reviewCount ?? 0,
      userRating: userRatingDoc ? userRatingDoc.rating : null,
    });
  } catch (error) {
    console.error(`GET /api/products/${slug}/rate:`, error);
    return NextResponse.json({ error: "Failed to fetch rating" }, { status: 500 });
  }
}

export async function POST(req: NextRequest, { params }: ProductRouteContext) {
  const { slug } = await params;
  const { userId } = await auth().catch(() => ({ userId: null }));
  const visitorId = getVisitorId(req, userId);

  const rateLimit = takeFixedWindowRateLimit(`rate-write:${visitorId}:${slug}`, 10, 60_000);
  if (!rateLimit.ok) {
    return NextResponse.json(
      { error: "Too many rating attempts", retryAfterSeconds: rateLimit.retryAfterSeconds },
      {
        status: 429,
        headers: { "Retry-After": String(rateLimit.retryAfterSeconds) },
      }
    );
  }

  let body: unknown;
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON" }, { status: 400 });
  }

  const rawRating = (body as { rating?: unknown })?.rating;
  const numRating = Number(rawRating);

  if (!Number.isInteger(numRating) || numRating < 1 || numRating > 5) {
    return NextResponse.json(
      { error: "Rating must be an integer between 1 and 5" },
      { status: 400 }
    );
  }

  try {
    await connectToDatabase();

    const product = await ProductModel.findOne({ slug, hidden: { $ne: true } })
      .select("_id slug")
      .lean();

    if (!product) {
      return NextResponse.json({ error: "Product not found" }, { status: 404 });
    }

    await RatingModel.findOneAndUpdate(
      { productId: product._id, visitorId },
      {
        $set: {
          productSlug: product.slug,
          rating: numRating,
        },
      },
      { upsert: true, returnDocument: "after" }
    );

    const stats = await recalculateProductRating(product._id);

    const res = NextResponse.json({
      success: true,
      message: "Rating recorded",
      rating: stats.rating,
      ratingCount: stats.ratingCount,
      userRating: numRating,
    });

    // If client didn't have visitor cookie and is guest, attach one
    if (!req.cookies.get("nascent_vid") && !userId) {
      const newVid = crypto.randomBytes(16).toString("hex");
      res.cookies.set("nascent_vid", newVid, {
        path: "/",
        httpOnly: true,
        sameSite: "lax",
        maxAge: 60 * 60 * 24 * 365, // 1 year
      });
    }

    return res;
  } catch (error) {
    console.error(`POST /api/products/${slug}/rate:`, error);
    return NextResponse.json({ error: "Failed to save rating" }, { status: 500 });
  }
}
