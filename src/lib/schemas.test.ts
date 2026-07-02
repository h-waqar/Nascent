import { describe, it, expect } from "vitest";
import {
  CreateProductSchema,
  UpdateProductSchema,
  UpdateOrderStatusSchema,
  UpdateSettingsSchema,
  UpsertReviewSchema,
  UpdateReviewModerationSchema,
} from "@/lib/schemas";

describe("CreateProductSchema", () => {
  const validProduct = {
    name: "A",
    slug: "a-b",
    description: "d",
    price: 10,
    stock: 3,
  };

  it("accepts valid product data", () => {
    expect(CreateProductSchema.safeParse(validProduct).success).toBe(true);
  });

  it("rejects slug with uppercase and spaces", () => {
    expect(
      CreateProductSchema.safeParse({ ...validProduct, slug: "Bad Slug!" }).success
    ).toBe(false);
  });

  it("rejects negative price", () => {
    expect(
      CreateProductSchema.safeParse({ ...validProduct, price: -1 }).success
    ).toBe(false);
  });
});

describe("UpdateProductSchema", () => {
  it("accepts partial data (price only)", () => {
    expect(UpdateProductSchema.safeParse({ price: 12 }).success).toBe(true);
  });
});

describe("UpdateOrderStatusSchema", () => {
  it("accepts valid order status", () => {
    expect(
      UpdateOrderStatusSchema.safeParse({ status: "confirmed" }).success
    ).toBe(true);
  });

  it("rejects invalid order status", () => {
    expect(
      UpdateOrderStatusSchema.safeParse({ status: "bogus" }).success
    ).toBe(false);
  });
});

describe("UpdateSettingsSchema", () => {
  it("accepts partial settings data", () => {
    expect(
      UpdateSettingsSchema.safeParse({ accountName: "X", codEnabled: true }).success
    ).toBe(true);
  });
});

describe("UpsertReviewSchema", () => {
  it("accepts a bounded valid review", () => {
    expect(
      UpsertReviewSchema.safeParse({
        rating: 5,
        title: "Precise and quiet",
        body: "A clean opening with a long mineral drydown.",
      }).success
    ).toBe(true);
  });

  it("rejects invalid rating and short body", () => {
    expect(
      UpsertReviewSchema.safeParse({
        rating: 6,
        body: "short",
      }).success
    ).toBe(false);
  });
});

describe("UpdateReviewModerationSchema", () => {
  it("accepts admin approval with homepage curation fields", () => {
    expect(
      UpdateReviewModerationSchema.safeParse({
        status: "approved",
        isFeatured: true,
        featuredRank: 1,
      }).success
    ).toBe(true);
  });

  it("rejects empty moderation payloads", () => {
    expect(UpdateReviewModerationSchema.safeParse({}).success).toBe(false);
  });
});
