import { NextRequest, NextResponse } from "next/server";
import { auth } from "@clerk/nextjs/server";
import connectToDatabase from "@/lib/db";
import { OrderModel } from "@/models";
import mongoose from "mongoose";

export async function GET(
  _req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { userId } = await auth();
  if (!userId) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { id } = await params;
  if (!mongoose.Types.ObjectId.isValid(id)) {
    return NextResponse.json({ error: "Invalid order ID" }, { status: 400 });
  }

  try {
    await connectToDatabase();
    const order = await OrderModel.findById(id).lean();

    if (!order) {
      return NextResponse.json({ error: "Order not found" }, { status: 404 });
    }

    if (order.userId !== userId) {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    return NextResponse.json({
      order: {
        ...order,
        id: order._id.toString(),
        _id: undefined,
        createdAt: (order.createdAt as Date).toISOString(),
        updatedAt: (order.updatedAt as Date).toISOString(),
      },
    });
  } catch (e) {
    console.error("GET /api/orders/[id]:", e);
    return NextResponse.json({ error: "Failed to fetch order" }, { status: 500 });
  }
}
