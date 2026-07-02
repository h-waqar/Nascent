import type { PublicReview, Review, ReviewStatus } from "@/types/models";

type ReviewRecord = Record<string, unknown>;

function stringifyId(value: unknown): string {
  if (typeof value === "string") return value;
  if (value && typeof (value as { toString?: () => string }).toString === "function") {
    return (value as { toString: () => string }).toString();
  }
  return "";
}

function iso(value: unknown): string {
  if (value instanceof Date) return value.toISOString();
  if (typeof value === "string") return value;
  return new Date(0).toISOString();
}

function optionalIso(value: unknown): string | undefined {
  if (!value) return undefined;
  return iso(value);
}

function optionalString(value: unknown): string | undefined {
  return typeof value === "string" && value.length > 0 ? value : undefined;
}

function optionalNumber(value: unknown): number | null {
  return typeof value === "number" ? value : null;
}

export function toPublicReview(review: ReviewRecord): PublicReview {
  return {
    id: stringifyId(review._id),
    productId: stringifyId(review.productId),
    productSlug: String(review.productSlug ?? ""),
    productName: String(review.productName ?? ""),
    authorName: String(review.authorName ?? "Nascent customer"),
    rating: Number(review.rating ?? 0),
    title: optionalString(review.title),
    body: String(review.body ?? ""),
    isFeatured: Boolean(review.isFeatured),
    featuredRank: optionalNumber(review.featuredRank),
    createdAt: iso(review.createdAt),
    updatedAt: iso(review.updatedAt),
  };
}

export function toAdminReview(review: ReviewRecord): Review {
  return {
    ...toPublicReview(review),
    userId: String(review.userId ?? ""),
    status: String(review.status ?? "pending") as ReviewStatus,
    moderationReason: optionalString(review.moderationReason),
    moderatedBy: optionalString(review.moderatedBy),
    moderatedAt: optionalIso(review.moderatedAt),
  };
}
