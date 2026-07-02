import { describe, expect, it } from "vitest";
import { toPublicReview, toAdminReview } from "@/lib/reviewDtos";

describe("review DTO mappers", () => {
  const rawReview = {
    _id: "review-1",
    productId: "product-1",
    productSlug: "nocturne",
    productName: "Nocturne",
    userId: "user-1",
    authorName: "Customer",
    authorImageUrl: "https://img.clerk.com/avatar.png",
    rating: 5,
    title: "Excellent",
    body: "A precise and long-wearing scent.",
    status: "approved",
    moderationReason: "safe",
    moderatedBy: "admin-1",
    moderatedAt: new Date("2026-07-01T00:00:00.000Z"),
    isFeatured: true,
    featuredRank: 1,
    createdAt: new Date("2026-07-01T00:00:00.000Z"),
    updatedAt: new Date("2026-07-02T00:00:00.000Z"),
  };

  it("public review DTO excludes ownership and moderation fields", () => {
    const dto = toPublicReview(rawReview);
    expect(dto).not.toHaveProperty("userId");
    expect(dto).not.toHaveProperty("status");
    expect(dto).not.toHaveProperty("moderationReason");
    expect(dto.productSlug).toBe("nocturne");
    expect(dto.authorImageUrl).toBe("https://img.clerk.com/avatar.png");
  });

  it("admin review DTO includes status and moderation metadata", () => {
    const dto = toAdminReview(rawReview);
    expect(dto.userId).toBe("user-1");
    expect(dto.status).toBe("approved");
    expect(dto.moderatedBy).toBe("admin-1");
  });
});
