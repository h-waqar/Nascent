import { NextRequest, NextResponse } from "next/server";
import { requireAdmin } from "@/lib/requireAdmin";
import connectToDatabase from "@/lib/db";
import { OrderModel } from "@/models";
import { ORDER_STATUSES } from "@/lib/orderStatus";
import type { OrderStatus } from "@/types/models";

const SORTABLE = new Set(["createdAt", "total"]);

export async function GET(req: NextRequest) {
  const deny = await requireAdmin();
  if (deny) return deny;

  const { searchParams } = new URL(req.url);
  const statusParam = searchParams.get("status");
  const sortParam = searchParams.get("sort") ?? "createdAt";
  const orderParam = searchParams.get("order") === "asc" ? 1 : -1;

  const sortKey = SORTABLE.has(sortParam) ? sortParam : "createdAt";

  try {
    await connectToDatabase();
    const filter: Record<string, unknown> = {};
    if (statusParam && (ORDER_STATUSES as string[]).includes(statusParam)) {
      filter.status = statusParam as OrderStatus;
    }
    const orders = await OrderModel.find(filter)
      .sort({ [sortKey]: orderParam })
      .lean();
    return NextResponse.json({
      orders: orders.map((o) => ({
        ...o,
        id: o._id.toString(),
        _id: undefined,
        createdAt: (o.createdAt as Date).toISOString(),
        updatedAt: (o.updatedAt as Date).toISOString(),
      })),
    });
  } catch (e) {
    console.error("GET /api/admin/orders:", e);
    return NextResponse.json({ error: "Failed to fetch orders" }, { status: 500 });
  }
}
