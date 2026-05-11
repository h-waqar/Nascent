import { NextRequest, NextResponse } from "next/server";
import { auth } from "@clerk/nextjs/server";
import connectToDatabase from "@/lib/db";
import { OrderModel } from "@/models";
import { generateWhatsAppLink } from "@/lib/whatsapp";
import type { OrderItem, ShippingAddress, PaymentMethod } from "@/types/models";

interface OrderPayload {
  items: OrderItem[];
  shippingAddress: ShippingAddress;
  paymentMethod: PaymentMethod;
}

export async function POST(req: NextRequest) {
  const { userId } = await auth();
  if (!userId) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  let body: OrderPayload;
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON" }, { status: 400 });
  }

  const { items, shippingAddress, paymentMethod } = body;
  if (!items?.length || !shippingAddress || !paymentMethod) {
    return NextResponse.json({ error: "Missing required fields" }, { status: 400 });
  }

  const subtotal = items.reduce((sum, item) => sum + item.price * item.quantity, 0);
  const shipping = 5;
  const total = subtotal + shipping;

  try {
    await connectToDatabase();
    const order = await OrderModel.create({
      userId,
      items,
      subtotal,
      total,
      status: "pending",
      paymentMethod,
      shippingAddress,
    });

    const orderPlain = {
      id: order._id.toString(),
      userId: order.userId,
      items: order.items,
      subtotal: order.subtotal,
      total: order.total,
      status: order.status,
      paymentMethod: order.paymentMethod,
      shippingAddress: order.shippingAddress,
      createdAt: order.createdAt.toISOString(),
      updatedAt: order.updatedAt.toISOString(),
    };

    const whatsappLink = generateWhatsAppLink(orderPlain);
    await OrderModel.findByIdAndUpdate(order._id, { whatsappLink });

    return NextResponse.json({ order: { ...orderPlain, whatsappLink } }, { status: 201 });
  } catch (e) {
    console.error("POST /api/orders:", e);
    return NextResponse.json({ error: "Failed to create order" }, { status: 500 });
  }
}

export async function GET(_req: NextRequest) {
  const { userId } = await auth();
  if (!userId) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    await connectToDatabase();
    const orders = await OrderModel.find({ userId }).sort({ createdAt: -1 }).lean();
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
    console.error("GET /api/orders:", e);
    return NextResponse.json({ error: "Failed to fetch orders" }, { status: 500 });
  }
}
