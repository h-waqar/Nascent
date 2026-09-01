import { describe, it, expect, vi } from "vitest";

vi.mock("@/lib/db", () => ({
  default: vi.fn().mockResolvedValue(true),
}));

vi.mock("@/models", () => ({
  OrderModel: {
    aggregate: vi.fn().mockImplementation((pipeline) => {
      if (pipeline[0]?.$facet) {
        return Promise.resolve([
          {
            allTime: [{ total: 50000 }],
            thisMonth: [{ total: 12000 }],
          },
        ]);
      }
      if (pipeline[0]?.$group?._id === "$status") {
        return Promise.resolve([
          { _id: "pending", count: 3 },
          { _id: "delivered", count: 10 },
        ]);
      }
      return Promise.resolve([
        {
          _id: "prod_1",
          name: "Sample Fragrance",
          slug: "sample-fragrance",
          unitsSold: 15,
          revenue: 15000,
        },
      ]);
    }),
    find: vi.fn().mockReturnValue({
      sort: vi.fn().mockReturnValue({
        limit: vi.fn().mockReturnValue({
          lean: vi.fn().mockResolvedValue([
            {
              _id: "order_123",
              total: 5000,
              status: "pending",
              createdAt: new Date("2026-04-01T00:00:00Z"),
              shippingAddress: { fullName: "Jane Doe" },
            },
          ]),
        }),
      }),
    }),
  },
  ProductModel: {
    find: vi.fn().mockReturnValue({
      select: vi.fn().mockReturnValue({
        lean: vi.fn().mockResolvedValue([
          {
            _id: "prod_low",
            name: "Low Stock Perfume",
            slug: "low-stock-perfume",
            stock: 2,
            categoryId: "cat_1",
            collection: "Woody",
          },
        ]),
      }),
    }),
    countDocuments: vi.fn().mockResolvedValue(25),
    distinct: vi.fn().mockResolvedValue(["Woody", "Floral", "Citrus"]),
  },
}));

describe("getAdminStats service layer", () => {
  it("returns formatted stats data directly from database without HTTP loopback", async () => {
    const { getAdminStats } = await import("@/lib/adminStats");
    const stats = await getAdminStats();

    expect(stats.revenue.allTime).toBe(50000);
    expect(stats.revenue.thisMonth).toBe(12000);
    expect(stats.totalOrders).toBe(13);
    expect(stats.statusBreakdown.pending).toBe(3);
    expect(stats.statusBreakdown.delivered).toBe(10);
    expect(stats.statusBreakdown.processing).toBe(0);
    expect(stats.topProducts).toHaveLength(1);
    expect(stats.topProducts[0].name).toBe("Sample Fragrance");
    expect(stats.lowStock).toHaveLength(1);
    expect(stats.lowStock[0].stock).toBe(2);
    expect(stats.recentOrders).toHaveLength(1);
    expect(stats.activeProducts).toBe(25);
    expect(stats.collectionsCount).toBe(3);
  });
});
