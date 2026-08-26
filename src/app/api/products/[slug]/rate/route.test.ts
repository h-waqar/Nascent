import { describe, it, expect, vi, beforeEach } from "vitest";
import { NextRequest } from "next/server";

vi.mock("@/lib/db", () => ({
  default: vi.fn(() => Promise.resolve()),
}));

vi.mock("@clerk/nextjs/server", () => ({
  auth: vi.fn(() => Promise.resolve({ userId: null })),
}));

const mockProductFindOneLean = vi.fn();
const mockProductFindOne = vi.fn(() => ({
  select: vi.fn(() => ({
    lean: mockProductFindOneLean,
  })),
}));

const mockRatingFindOneLean = vi.fn();
const mockRatingFindOne = vi.fn(() => ({
  lean: mockRatingFindOneLean,
}));

const mockRatingFindOneAndUpdate = vi.fn();
const mockProductFindByIdAndUpdate = vi.fn();
const mockRatingFindLean = vi.fn();
const mockRatingFind = vi.fn(() => ({
  select: vi.fn(() => ({
    lean: mockRatingFindLean,
  })),
}));
const mockReviewFindLean = vi.fn();
const mockReviewFind = vi.fn(() => ({
  select: vi.fn(() => ({
    lean: mockReviewFindLean,
  })),
}));

vi.mock("@/models", () => ({
  ProductModel: {
    findOne: mockProductFindOne,
    findByIdAndUpdate: mockProductFindByIdAndUpdate,
  },
  RatingModel: {
    findOne: mockRatingFindOne,
    findOneAndUpdate: mockRatingFindOneAndUpdate,
    find: mockRatingFind,
  },
  ReviewModel: {
    find: mockReviewFind,
  },
}));

const { GET, POST } = await import("@/app/api/products/[slug]/rate/route");

describe("GET /api/products/[slug]/rate", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("returns 404 if product not found", async () => {
    mockProductFindOneLean.mockResolvedValueOnce(null);

    const req = new NextRequest("http://localhost/api/products/unknown/rate");
    const res = await GET(req, { params: Promise.resolve({ slug: "unknown" }) });

    expect(res.status).toBe(404);
    const body = await res.json();
    expect(body.error).toBe("Product not found");
  });

  it("returns rating stats and guest rating when product exists", async () => {
    mockProductFindOneLean.mockResolvedValueOnce({
      _id: "prod-1",
      slug: "noir-velour",
      name: "Noir Velour",
      rating: 4.8,
      ratingCount: 12,
      reviewCount: 3,
    });
    mockRatingFindOneLean.mockResolvedValueOnce({ rating: 5 });

    const req = new NextRequest("http://localhost/api/products/noir-velour/rate");
    const res = await GET(req, { params: Promise.resolve({ slug: "noir-velour" }) });

    expect(res.status).toBe(200);
    const body = await res.json();
    expect(body.rating).toBe(4.8);
    expect(body.ratingCount).toBe(12);
    expect(body.userRating).toBe(5);
  });
});

describe("POST /api/products/[slug]/rate", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("validates rating is an integer between 1 and 5", async () => {
    const req = new NextRequest("http://localhost/api/products/noir-velour/rate", {
      method: "POST",
      body: JSON.stringify({ rating: 6 }),
    });
    const res = await POST(req, { params: Promise.resolve({ slug: "noir-velour" }) });

    expect(res.status).toBe(400);
    const body = await res.json();
    expect(body.error).toContain("Rating must be an integer between 1 and 5");
  });

  it("successfully records guest rating and returns updated aggregate", async () => {
    mockProductFindOneLean.mockResolvedValueOnce({
      _id: "prod-1",
      slug: "noir-velour",
    });
    mockRatingFindOneAndUpdate.mockResolvedValueOnce({});
    mockRatingFindLean.mockResolvedValueOnce([{ rating: 5 }, { rating: 5 }]);
    mockReviewFindLean.mockResolvedValueOnce([{ rating: 4 }]);
    mockProductFindByIdAndUpdate.mockResolvedValueOnce({});

    const req = new NextRequest("http://localhost/api/products/noir-velour/rate", {
      method: "POST",
      body: JSON.stringify({ rating: 5 }),
    });
    const res = await POST(req, { params: Promise.resolve({ slug: "noir-velour" }) });

    expect(res.status).toBe(200);
    const body = await res.json();
    expect(body.success).toBe(true);
    expect(body.userRating).toBe(5);
    expect(body.ratingCount).toBe(3);
    expect(body.rating).toBe(4.7);
  });
});
