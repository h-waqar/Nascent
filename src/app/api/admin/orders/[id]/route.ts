import { NextRequest, NextResponse } from "next/server";
import mongoose from "mongoose";
import { requireAdmin } from "@/lib/requireAdmin";
import connectToDatabase from "@/lib/db";
import { OrderModel } from "@/models";
import { UpdateOrderStatusSchema } from "@/lib/schemas";
import { isValidTransition } from "@/lib/orderStatus";
import type { OrderStatus } from "@/types/models";

function serialize(o: Record<string, unknown> & { _id: { toString(): string } }) {
  return {
    ...o,
    id: o._id.toString(),
    _id: undefined,
    createdAt: o.createdAt ? new Date(o.createdAt as string | Date).toISOString() : undefined,
    updatedAt: o.updatedAt ? new Date(o.updatedAt as string | Date).toISOString() : undefined,
  };
}

export async function GET(_req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const deny = await requireAdmin();
  if (deny) return deny;
  const { id } = await params;
  if (!mongoose.Types.ObjectId.isValid(id)) {
    return NextResponse.json({ error: "Invalid order ID" }, { status: 400 });
  }
  try {
    await connectToDatabase();
    const order = await OrderModel.findById(id).lean();
    if (!order) return NextResponse.json({ error: "Order not found" }, { status: 404 });
    return NextResponse.json({ order: serialize(order as never) });
  } catch (e) {
    console.error("GET /api/admin/orders/[id]:", e);
    return NextResponse.json({ error: "Failed to fetch order" }, { status: 500 });
  }
}

export async function PUT(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const deny = await requireAdmin();
  if (deny) return deny;
  const { id } = await params;
  if (!mongoose.Types.ObjectId.isValid(id)) {
    return NextResponse.json({ error: "Invalid order ID" }, { status: 400 });
  }
  let body: unknown;
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON" }, { status: 400 });
  }
  const parsed = UpdateOrderStatusSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ error: parsed.error.issues }, { status: 422 });
  }
  try {
    await connectToDatabase();
    const current = await OrderModel.findById(id).lean();
    if (!current) return NextResponse.json({ error: "Order not found" }, { status: 404 });

    const nextStatus = parsed.data.status as OrderStatus;
    const currentStatus = (current as { status: OrderStatus }).status;
    if (!isValidTransition(currentStatus, nextStatus)) {
      return NextResponse.json(
        { error: `Cannot transition from "${currentStatus}" to "${nextStatus}"` },
        { status: 422 }
      );
    }

    const update: Record<string, unknown> = { status: nextStatus };
    if (parsed.data.adminNote) update.adminNote = parsed.data.adminNote;

    // adminNote is not in the Order schema — persist via { strict: false }.
    const updated = await OrderModel.findByIdAndUpdate(id, update, {
      new: true,
      runValidators: true,
      strict: false,
    }).lean();
    if (!updated) return NextResponse.json({ error: "Order not found" }, { status: 404 });
    return NextResponse.json({ order: serialize(updated as never) });
  } catch (e) {
    console.error("PUT /api/admin/orders/[id]:", e);
    return NextResponse.json({ error: "Failed to update order" }, { status: 500 });
  }
}
