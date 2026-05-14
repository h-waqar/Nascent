import { describe, it, expect, vi, beforeEach } from "vitest";

// Mock modules before importing the route
vi.mock("@/lib/requireAdmin", () => ({
  requireAdmin: vi.fn(),
}));

vi.mock("@/lib/db", () => ({
  default: vi.fn().mockResolvedValue(undefined),
}));

vi.mock("@/models", () => ({
  OrderModel: {
    findById: vi.fn(),
    findByIdAndUpdate: vi.fn(),
  },
}));

// Import after mocks — real orderStatus and schemas (not mocked per behavior block)
const { GET, PUT } = await import("@/app/api/admin/orders/[id]/route");
const { requireAdmin } = await import("@/lib/requireAdmin");
const { OrderModel } = await import("@/models");

// A valid 24-hex ObjectId
const VALID_ID = "64f1a2b3c4d5e6f7a8b9c0d1";

// Stub order doc returned by findById().lean()
const stubOrder = {
  _id: { toString: () => VALID_ID },
  userId: "user_abc",
  status: "pending",
  total: 150,
  items: [
    { productId: "p1", slug: "oud-noir", name: "Oud Noir", price: 75, quantity: 2 },
  ],
  shippingAddress: {
    fullName: "Jane Doe",
    line1: "1 Test St",
    city: "London",
    postalCode: "SW1A 1AA",
    country: "GB",
    phone: "07700900000",
  },
  createdAt: new Date("2024-01-15T10:00:00.000Z"),
  updatedAt: new Date("2024-01-15T10:00:00.000Z"),
};

function mockParams(id: string) {
  return { params: Promise.resolve({ id }) };
}

function makeRequest(body?: unknown): Request {
  if (body === undefined) {
    return new Request("http://localhost/api/admin/orders/" + VALID_ID);
  }
  return new Request("http://localhost/api/admin/orders/" + VALID_ID, {
    method: "PUT",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(body),
  });
}

describe("GET /api/admin/orders/[id]", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    // Default: admin passes
    vi.mocked(requireAdmin).mockResolvedValue(null);
  });

  it("returns 403 when requireAdmin returns a deny response", async () => {
    const denyResponse = new Response(JSON.stringify({ error: "Forbidden" }), { status: 403 });
    vi.mocked(requireAdmin).mockResolvedValue(denyResponse as never);

    const res = await GET(makeRequest() as never, mockParams(VALID_ID));
    expect(res.status).toBe(403);
  });

  it("returns 400 for an invalid ObjectId", async () => {
    const res = await GET(makeRequest() as never, mockParams("not-an-id"));
    expect(res.status).toBe(400);
    // DB should NOT be called
    expect(OrderModel.findById).not.toHaveBeenCalled();
  });

  it("returns 404 when order is not found", async () => {
    vi.mocked(OrderModel.findById).mockReturnValue({
      lean: vi.fn().mockResolvedValue(null),
    } as never);

    const res = await GET(makeRequest() as never, mockParams(VALID_ID));
    expect(res.status).toBe(404);
  });

  it("returns 200 with serialized order on happy path", async () => {
    vi.mocked(OrderModel.findById).mockReturnValue({
      lean: vi.fn().mockResolvedValue(stubOrder),
    } as never);

    const res = await GET(makeRequest() as never, mockParams(VALID_ID));
    expect(res.status).toBe(200);

    const data = await res.json();
    expect(data.order).toBeDefined();
    expect(data.order.id).toBe(VALID_ID);
    expect(data.order._id).toBeUndefined();
    expect(data.order.status).toBe("pending");
  });
});

describe("PUT /api/admin/orders/[id]", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    vi.mocked(requireAdmin).mockResolvedValue(null);
  });

  it("returns 403 when requireAdmin denies", async () => {
    const denyResponse = new Response(JSON.stringify({ error: "Forbidden" }), { status: 403 });
    vi.mocked(requireAdmin).mockResolvedValue(denyResponse as never);

    const res = await PUT(makeRequest({ status: "confirmed" }) as never, mockParams(VALID_ID));
    expect(res.status).toBe(403);
  });

  it("returns 400 for an invalid ObjectId", async () => {
    const res = await PUT(makeRequest({ status: "confirmed" }) as never, mockParams("not-an-id"));
    expect(res.status).toBe(400);
    expect(OrderModel.findById).not.toHaveBeenCalled();
  });

  it("returns 422 for an unknown status (Zod rejects first)", async () => {
    const res = await PUT(makeRequest({ status: "bogus" }) as never, mockParams(VALID_ID));
    expect(res.status).toBe(422);
    // findById should NOT be called — Zod rejects before DB
    expect(OrderModel.findById).not.toHaveBeenCalled();
  });

  it("valid transition pending → confirmed returns 200 and calls findByIdAndUpdate", async () => {
    vi.mocked(OrderModel.findById).mockReturnValue({
      lean: vi.fn().mockResolvedValue({ ...stubOrder, status: "pending" }),
    } as never);

    const updatedDoc = { ...stubOrder, status: "confirmed" };
    vi.mocked(OrderModel.findByIdAndUpdate).mockReturnValue({
      lean: vi.fn().mockResolvedValue(updatedDoc),
    } as never);

    const res = await PUT(makeRequest({ status: "confirmed" }) as never, mockParams(VALID_ID));
    expect(res.status).toBe(200);

    const data = await res.json();
    expect(data.order.status).toBe("confirmed");
    expect(OrderModel.findByIdAndUpdate).toHaveBeenCalledWith(
      VALID_ID,
      expect.objectContaining({ status: "confirmed" }),
      expect.objectContaining({ strict: false })
    );
  });

  it("invalid transition pending → shipped (skips steps) returns 422 and does NOT call findByIdAndUpdate", async () => {
    vi.mocked(OrderModel.findById).mockReturnValue({
      lean: vi.fn().mockResolvedValue({ ...stubOrder, status: "pending" }),
    } as never);

    const res = await PUT(makeRequest({ status: "shipped" }) as never, mockParams(VALID_ID));
    expect(res.status).toBe(422);
    expect(OrderModel.findByIdAndUpdate).not.toHaveBeenCalled();
  });

  it("transition from terminal status (delivered → cancelled) returns 422", async () => {
    vi.mocked(OrderModel.findById).mockReturnValue({
      lean: vi.fn().mockResolvedValue({ ...stubOrder, status: "delivered" }),
    } as never);

    const res = await PUT(makeRequest({ status: "cancelled" }) as never, mockParams(VALID_ID));
    expect(res.status).toBe(422);
    expect(OrderModel.findByIdAndUpdate).not.toHaveBeenCalled();
  });

  it("valid transition with adminNote calls findByIdAndUpdate with note and strict: false", async () => {
    vi.mocked(OrderModel.findById).mockReturnValue({
      lean: vi.fn().mockResolvedValue({ ...stubOrder, status: "pending" }),
    } as never);

    const updatedDoc = { ...stubOrder, status: "cancelled", adminNote: "customer requested" };
    vi.mocked(OrderModel.findByIdAndUpdate).mockReturnValue({
      lean: vi.fn().mockResolvedValue(updatedDoc),
    } as never);

    const res = await PUT(
      makeRequest({ status: "cancelled", adminNote: "customer requested" }) as never,
      mockParams(VALID_ID)
    );
    expect(res.status).toBe(200);
    expect(OrderModel.findByIdAndUpdate).toHaveBeenCalledWith(
      VALID_ID,
      expect.objectContaining({ status: "cancelled", adminNote: "customer requested" }),
      expect.objectContaining({ strict: false })
    );
  });
});
