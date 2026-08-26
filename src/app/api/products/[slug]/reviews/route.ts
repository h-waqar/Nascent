import { NextRequest, NextResponse } from "next/server";
import { auth, currentUser } from "@clerk/nextjs/server";
import connectToDatabase from "@/lib/db";
import { ProductModel, ReviewModel } from "@/models";
import { takeFixedWindowRateLimit } from "@/lib/rateLimit";
import { toPublicReview, toAdminReview } from "@/lib/reviewDtos";
import { UpsertReviewSchema } from "@/lib/schemas";
import { recalculateProductRating } from "@/lib/ratingHelpers";

type ProductRouteContext = {
  params: Promise<{ slug: string }>;
};

const PRODUCT_VISIBLE_REVIEW_STATUSES = ["approved", "pending"] as const;

function getDisplayName(sessionClaims: unknown): string {
  const claims = sessionClaims as Record<string, unknown> | null | undefined;
  const unsafeMetadata = claims?.unsafeMetadata as Record<string, unknown> | undefined;
  const publicMetadata = claims?.publicMetadata as Record<string, unknown> | undefined;
  const candidates = [
    claims?.name,
    claims?.fullName,
    publicMetadata?.displayName,
    unsafeMetadata?.displayName,
  ];
  const displayName = candidates.find(
    (value): value is string => typeof value === "string" && value.trim().length > 0
  );
  return displayName?.trim().slice(0, 80) ?? "Nascent customer";
}

function cleanImageUrl(value: string | null | undefined): string | undefined {
  if (!value || value.length > 500) return undefined;
  try {
    const url = new URL(value);
    return url.protocol === "http:" || url.protocol === "https:" ? url.toString() : undefined;
  } catch {
    return undefined;
  }
}

function getAuthorName(
  clerkUser: Awaited<ReturnType<typeof currentUser>>,
  sessionClaims: unknown
): string {
  const fromUser =
    clerkUser?.fullName ??
    [clerkUser?.firstName, clerkUser?.lastName].filter(Boolean).join(" ");
  return fromUser.trim().length > 0 ? fromUser.trim().slice(0, 80) : getDisplayName(sessionClaims);
}

function isDuplicateKeyError(error: unknown): boolean {
  return (
    typeof error === "object" &&
    error !== null &&
    "code" in error &&
    (error as { code?: unknown }).code === 11000
  );
}

export async function GET(_req: NextRequest, { params }: ProductRouteContext) {
  const { slug } = await params;

  try {
    await connectToDatabase();

    const product = await ProductModel.findOne({ slug, hidden: { $ne: true } })
      .select("_id")
      .lean();
    if (!product) {
      return NextResponse.json({ error: "Product not found" }, { status: 404 });
    }

    const reviews = await ReviewModel.find({
      productId: product._id,
      status: { $in: PRODUCT_VISIBLE_REVIEW_STATUSES },
    })
      .sort({ createdAt: -1 })
      .limit(20)
      .lean();

    return NextResponse.json({
      reviews: reviews.map((review) => toPublicReview(review as unknown as Record<string, unknown>)),
    });
  } catch (error) {
    console.error(`GET /api/products/${slug}/reviews:`, error);
    return NextResponse.json({ error: "Failed to fetch reviews" }, { status: 500 });
  }
}

export async function POST(req: NextRequest, { params }: ProductRouteContext) {
  const { slug } = await params;
  const { userId, sessionClaims } = await auth();

  if (!userId) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const rateLimit = takeFixedWindowRateLimit(`review-write:${userId}:${slug}`, 5, 60_000);
  if (!rateLimit.ok) {
    return NextResponse.json(
      { error: "Too many review attempts", retryAfterSeconds: rateLimit.retryAfterSeconds },
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

  const parsed = UpsertReviewSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json(
      { error: "Invalid review payload", details: parsed.error.flatten() },
      { status: 400 }
    );
  }

  try {
    await connectToDatabase();
    const clerkUser = await currentUser().catch(() => null);

    const product = await ProductModel.findOne({ slug, hidden: { $ne: true } })
      .select("_id slug name")
      .lean();
    if (!product) {
      return NextResponse.json({ error: "Product not found" }, { status: 404 });
    }

    const title = parsed.data.title?.trim();
    const update: Record<string, unknown> = {
      $set: {
        productSlug: product.slug,
        productName: product.name,
        authorName: getAuthorName(clerkUser, sessionClaims),
        authorImageUrl: cleanImageUrl(clerkUser?.imageUrl),
        rating: parsed.data.rating,
        body: parsed.data.body,
        status: "approved",
        isFeatured: false,
        featuredRank: null,
      },
      $setOnInsert: {
        productId: product._id,
        userId,
      },
      $unset: {
        moderationReason: true,
        moderatedBy: true,
        moderatedAt: true,
      },
    };

    if (title) {
      (update.$set as Record<string, unknown>).title = title;
    } else {
      (update.$unset as Record<string, unknown>).title = true;
    }

    let review: unknown = null;
    try {
      review = await ReviewModel.findOneAndUpdate(
        { productId: product._id, userId },
        update,
        {
          returnDocument: "after",
          runValidators: true,
          setDefaultsOnInsert: true,
          upsert: true,
        }
      ).lean();
    } catch (error) {
      if (!isDuplicateKeyError(error)) throw error;
      review = await ReviewModel.findOneAndUpdate(
        { productId: product._id, userId },
        update,
        {
          returnDocument: "after",
          runValidators: true,
        }
      ).lean();
    }

    await recalculateProductRating(product._id).catch((err) =>
      console.error("Failed to recalculate rating on review:", err)
    );

    return NextResponse.json({
      review: toAdminReview(review as unknown as Record<string, unknown>),
      message: "Review published",
    });
  } catch (error) {
    console.error(`POST /api/products/${slug}/reviews:`, error);
    return NextResponse.json({ error: "Failed to save review" }, { status: 500 });
  }
}
