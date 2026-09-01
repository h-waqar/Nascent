import connectToDatabase from "@/lib/db";
import { OrderModel, ProductModel } from "@/models";
import { ORDER_STATUSES } from "@/lib/orderStatus";
import type { OrderStatus } from "@/types/models";

export interface StatsData {
  revenue: { allTime: number; thisMonth: number };
  totalOrders: number;
  statusBreakdown: Record<OrderStatus, number>;
  topProducts: { productId: string; name: string; slug: string; unitsSold: number; revenue: number }[];
  lowStock: { id: string; name: string; slug: string; stock: number; categoryId: string | null; collection: string | null }[];
  recentOrders: { id: string; total: number; status: OrderStatus; createdAt: string; shippingAddress: { fullName: string; line1: string; city: string; postalCode: string; country: string; phone: string } }[];
  activeProducts: number;
  collectionsCount: number;
}

export async function getAdminStats(): Promise<StatsData> {
  await connectToDatabase();

  const now = new Date();
  const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
  const REVENUE_STATUSES_EXCLUDED = ["cancelled", "refunded"];

  // Revenue: all-time + this-month, excluding cancelled/refunded.
  const revenueAgg = await OrderModel.aggregate([
    {
      $facet: {
        allTime: [
          { $match: { status: { $nin: REVENUE_STATUSES_EXCLUDED } } },
          { $group: { _id: null, total: { $sum: "$total" } } },
        ],
        thisMonth: [
          { $match: { status: { $nin: REVENUE_STATUSES_EXCLUDED }, createdAt: { $gte: startOfMonth } } },
          { $group: { _id: null, total: { $sum: "$total" } } },
        ],
      },
    },
  ]);
  const allTimeRevenue = revenueAgg[0]?.allTime?.[0]?.total ?? 0;
  const thisMonthRevenue = revenueAgg[0]?.thisMonth?.[0]?.total ?? 0;

  // Status breakdown — count of orders per status (zero-filled for all 7 statuses).
  const statusAgg = await OrderModel.aggregate([{ $group: { _id: "$status", count: { $sum: 1 } } }]);
  const statusBreakdown: Record<string, number> = {};
  for (const s of ORDER_STATUSES) statusBreakdown[s] = 0;
  for (const row of statusAgg) {
    if (row?._id && row._id in statusBreakdown) statusBreakdown[row._id] = row.count;
  }
  const totalOrders = Object.values(statusBreakdown).reduce((a, b) => a + b, 0);

  // Top products by units sold (excluding cancelled/refunded orders).
  const topProductsAgg = await OrderModel.aggregate([
    { $match: { status: { $nin: REVENUE_STATUSES_EXCLUDED } } },
    { $unwind: "$items" },
    {
      $group: {
        _id: "$items.productId",
        name: { $first: "$items.name" },
        slug: { $first: "$items.slug" },
        unitsSold: { $sum: "$items.quantity" },
        revenue: { $sum: { $multiply: ["$items.price", "$items.quantity"] } },
      },
    },
    { $sort: { unitsSold: -1 } },
    { $limit: 5 },
  ]);
  const topProducts = topProductsAgg.map((p) => ({
    productId: p._id,
    name: p.name,
    slug: p.slug,
    unitsSold: p.unitsSold,
    revenue: p.revenue,
  }));

  // Low-stock products (<= 5 units).
  const lowStockDocs = await ProductModel.find({ stock: { $lte: 5 } })
    .select("name slug stock categoryId collection")
    .lean();
  const lowStock = lowStockDocs.map((p) => ({
    id: p._id.toString(),
    name: p.name,
    slug: p.slug,
    stock: p.stock,
    categoryId: p.categoryId ? String(p.categoryId) : null,
    collection: p.collection ? String(p.collection) : null,
  }));

  // Recent orders (last 10).
  const recentDocs = await OrderModel.find({}).sort({ createdAt: -1 }).limit(10).lean();
  const recentOrders = recentDocs.map((o) => ({
    id: o._id.toString(),
    total: o.total,
    status: o.status as OrderStatus,
    createdAt: (o.createdAt as Date).toISOString(),
    shippingAddress: o.shippingAddress,
  }));

  // Active products + distinct collections.
  const activeProducts = await ProductModel.countDocuments({});
  const distinctCollections = await ProductModel.distinct("collection");
  const collectionsCount = distinctCollections.filter(Boolean).length;

  return {
    revenue: { allTime: allTimeRevenue, thisMonth: thisMonthRevenue },
    totalOrders,
    statusBreakdown: statusBreakdown as Record<OrderStatus, number>,
    topProducts,
    lowStock,
    recentOrders,
    activeProducts,
    collectionsCount,
  };
}
