import { NextRequest, NextResponse } from "next/server";
import { auth } from "@clerk/nextjs/server";
import connectToDatabase from "@/lib/db";
import { OrderModel, ProductModel, SettingsModel } from "@/models";
import { generateWhatsAppLink } from "@/lib/whatsapp";
import type { OrderItem, ShippingAddress, PaymentMethod } from "@/types/models";

interface OrderPayload {
  items: OrderItem[];
  shippingAddress: ShippingAddress;
  paymentMethod: PaymentMethod;
}

const VALID_PAYMENT_METHODS: PaymentMethod[] = ["cod", "bank_transfer"];

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

  // CR-03: Validate payment method enum.
  if (!VALID_PAYMENT_METHODS.includes(paymentMethod)) {
    return NextResponse.json({ error: "Invalid payment method" }, { status: 400 });
  }

  // Hoist these so the catch block can restore stock if OrderModel.create fails.
  const verifiedItems: OrderItem[] = [];
  const decremented: string[] = [];

  try {
    await connectToDatabase();

    // CR-03: Enforce admin-configured payment method settings.
    const settings = await SettingsModel.findOne({}).lean();
    if (paymentMethod === "cod" && settings && !(settings as Record<string, unknown>).codEnabled) {
      return NextResponse.json({ error: "Cash on delivery is not available" }, { status: 400 });
    }
    if (paymentMethod === "bank_transfer" && settings && !(settings as Record<string, unknown>).bankTransferEnabled) {
      return NextResponse.json({ error: "Bank transfer is not available" }, { status: 400 });
    }

    // CR-01: Fetch canonical prices from DB — never trust client-supplied prices.
    const productIds = items.map((i) => i.productId);
    const dbProducts = await ProductModel.find({ _id: { $in: productIds } })
      .select("_id price")
      .lean();
    const priceMap = new Map(
      dbProducts.map((p) => [p._id.toString(), (p as Record<string, unknown>).price as number])
    );

    // Replace client prices with DB prices and validate all products exist.
    for (const item of items) {
      const dbPrice = priceMap.get(item.productId);
      if (dbPrice === undefined) {
        return NextResponse.json(
          { error: `Product not found: ${item.productId}` },
          { status: 404 }
        );
      }
      verifiedItems.push({ ...item, price: dbPrice });
    }

    const subtotal = verifiedItems.reduce((sum, item) => sum + item.price * item.quantity, 0);
    const shipping = typeof (settings as Record<string, unknown>)?.shippingCost === "number"
      ? ((settings as Record<string, unknown>).shippingCost as number)
      : 0;
    const total = subtotal + shipping;

    // CR-02: Check and atomically decrement stock before creating the order.
    for (const item of verifiedItems) {
      const updated = await ProductModel.findOneAndUpdate(
        { _id: item.productId, stock: { $gte: item.quantity } },
        { $inc: { stock: -item.quantity } },
        { new: true }
      );
      if (!updated) {
        // Compensate: restore stock for all already-decremented products.
        for (const pid of decremented) {
          const qty = verifiedItems.find((i) => i.productId === pid)?.quantity ?? 0;
          await ProductModel.findByIdAndUpdate(pid, { $inc: { stock: qty } }).catch(() => {});
        }
        return NextResponse.json(
          { error: `Insufficient stock for: ${item.name}` },
          { status: 409 }
        );
      }
      decremented.push(item.productId);
    }

    const order = await OrderModel.create({
      userId,
      items: verifiedItems,
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

    // Fetch whatsapp number from settings (DB wins; env fallback for cold-start)
    let waNumber: string = process.env.NEXT_PUBLIC_WHATSAPP_NUMBER ?? "";
    try {
      const settingsDoc = await SettingsModel.findOne({}).lean();
      if (settingsDoc && (settingsDoc as Record<string, unknown>).whatsappNumber) {
        waNumber = (settingsDoc as Record<string, unknown>).whatsappNumber as string;
      }
    } catch {
      // non-fatal — env fallback already set
    }
    const whatsappLink = generateWhatsAppLink(orderPlain, waNumber);
    await OrderModel.findByIdAndUpdate(order._id, { whatsappLink });

    return NextResponse.json({ order: { ...orderPlain, whatsappLink } }, { status: 201 });
  } catch (e) {
    // If OrderModel.create (or WhatsApp link steps) threw after stock was decremented,
    // restore the decremented inventory to avoid a silent stock leak.
    if (decremented.length > 0) {
      for (const pid of decremented) {
        const qty = verifiedItems.find((i) => i.productId === pid)?.quantity ?? 0;
        if (qty > 0) {
          await ProductModel.findByIdAndUpdate(pid, { $inc: { stock: qty } }).catch(() => {});
        }
      }
    }
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
