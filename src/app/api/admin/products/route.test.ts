import { describe, it, expect, vi, beforeEach } from "vitest";
import { NextRequest } from "next/server";

// --- Mocks ---

vi.mock("@/lib/requireAdmin", () => ({
  requireAdmin: vi.fn(),
}));

vi.mock("@/lib/db", () => ({
  default: vi.fn(() => Promise.resolve()),
}));

// Spy on generateSlug so we can check it's called in the no-slug path
vi.mock("@/lib/slug", () => ({
  generateSlug: vi.fn((name: string) =>
    name.toLowerCase().replace(/\s+/g, "-").replace(/[^a-z0-9-]/g, "")
  ),
}));

const mockFindLean = vi.fn();
const mockFindSortLean = vi.fn();
const mockFindSort = vi.fn(() => ({ lean: mockFindSortLean }));
const mockFind = vi.fn(() => ({ sort: mockFindSort }));
const mockFindOneLean = vi.fn();
const mockFindOne = vi.fn(() => ({ lean: mockFindOneLean }));
const mockCreate = vi.fn();

vi.mock("@/models", () => ({
  ProductModel: {
    find: mockFind,
    findOne: mockFindOne,
    create: mockCreate,
  },
}));

// Import after mocks
const { GET, POST } = await import("@/app/api/admin/products/route");
const { requireAdmin } = await import("@/lib/requireAdmin");

// Helper: create a fake mongo doc
function makeDoc(overrides = {}) {
  return {
    _id: { toString: () => "507f1f77bcf86cd799439011" },
    name: "Rose Oud",
    slug: "rose-oud",
    description: "A rich oud",
    price: 150,
    stock: 10,
    images: [],
    scentNotes: [],
    isFeatured: false,
    createdAt: new Date("2024-01-01"),
    updatedAt: new Date("2024-01-02"),
    toObject: function () {
      return {
        _id: this._id,
        name: this.name,
        slug: this.slug,
        description: this.description,
        price: this.price,
        stock: this.stock,
        images: this.images,
        scentNotes: this.scentNotes,
        isFeatured: this.isFeatured,
        createdAt: this.createdAt,
        updatedAt: this.updatedAt,
      };
    },
    ...overrides,
  };
}

function makeRequest(method: string, body?: unknown) {
  return new NextRequest("http://localhost/api/admin/products", {
    method,
    ...(body !== undefined
      ? {
          body: JSON.stringify(body),
          headers: { "Content-Type": "application/json" },
        }
      : {}),
  });
}

describe("GET /api/admin/products", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("returns 200 with products array (happy path)", async () => {
    vi.mocked(requireAdmin).mockResolvedValue(null);
    const doc = makeDoc();
    mockFindSortLean.mockResolvedValue([doc]);

    const res = await GET(makeRequest("GET"));
    const json = await res.json();

    expect(res.status).toBe(200);
    expect(json.products).toHaveLength(1);
    expect(json.products[0].id).toBe("507f1f77bcf86cd799439011");
    expect(json.products[0]._id).toBeUndefined();
  });

  it("returns 403 when requireAdmin denies access", async () => {
    const deny = new Response(JSON.stringify({ error: "Forbidden" }), {
      status: 403,
    }) as any;
    vi.mocked(requireAdmin).mockResolvedValue(deny);

    const res = await GET(makeRequest("GET"));
    expect(res.status).toBe(403);
  });
});

describe("POST /api/admin/products", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    vi.mocked(requireAdmin).mockResolvedValue(null);
    // Default: no slug collision
    mockFindOneLean.mockResolvedValue(null);
  });

  it("returns 201 with created product on valid body", async () => {
    const body = {
      name: "Rose Oud",
      slug: "rose-oud",
      description: "A rich oud",
      price: 150,
      stock: 10,
    };
    const created = makeDoc();
    mockCreate.mockResolvedValue(created);

    const res = await POST(makeRequest("POST", body));
    const json = await res.json();

    expect(res.status).toBe(201);
    expect(json.product.id).toBe("507f1f77bcf86cd799439011");
    expect(json.product._id).toBeUndefined();
    expect(json.product.slug).toBe("rose-oud");
  });

  it("returns 422 on invalid body (empty name)", async () => {
    const body = { name: "" };
    const res = await POST(makeRequest("POST", body));
    expect(res.status).toBe(422);
  });

  it("returns 409 when slug already exists", async () => {
    const body = {
      name: "Rose Oud",
      slug: "rose-oud",
      description: "A rich oud",
      price: 150,
      stock: 10,
    };
    // Simulate a collision
    mockFindOneLean.mockResolvedValue({ _id: "existing" });

    const res = await POST(makeRequest("POST", body));
    expect(res.status).toBe(409);
    const json = await res.json();
    expect(json.error).toMatch(/slug/i);
  });

  it("derives slug from name when no slug provided", async () => {
    const body = {
      name: "Rose Oud",
      description: "A rich oud",
      price: 150,
      stock: 10,
    };
    const created = makeDoc();
    mockCreate.mockResolvedValue(created);

    const res = await POST(makeRequest("POST", body));
    expect(res.status).toBe(201);

    // generateSlug should have been called with the name
    const { generateSlug } = await import("@/lib/slug");
    expect(vi.mocked(generateSlug)).toHaveBeenCalledWith("Rose Oud");
  });

  it("returns 403 when requireAdmin denies access", async () => {
    const deny = new Response(JSON.stringify({ error: "Forbidden" }), {
      status: 403,
    }) as any;
    vi.mocked(requireAdmin).mockResolvedValue(deny);

    const res = await POST(makeRequest("POST", { name: "X" }));
    expect(res.status).toBe(403);
  });
});
