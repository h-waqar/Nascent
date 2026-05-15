import { cookies } from "next/headers";
import { notFound } from "next/navigation";
import type { Order } from "@/types/models";
import { formatPrice } from "@/lib/currency";
import { shortRef } from "@/lib/orderRef";
import { AdminPageHeader } from "@/components/admin/AdminPageHeader";
import { OrderStatusManager } from "@/components/admin/OrderStatusManager";

async function getOrder(id: string): Promise<Order | null> {
  const base = process.env.NEXT_PUBLIC_APP_URL ?? "http://localhost:3000";
  const cookieStore = await cookies();
  const res = await fetch(`${base}/api/admin/orders/${id}`, {
    cache: "no-store",
    headers: { cookie: cookieStore.toString() },
  });
  if (!res.ok) return null;
  const data = await res.json();
  return data.order ?? null;
}

export default async function AdminOrderDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const order = await getOrder(id);
  if (!order) notFound();

  const orderRef = `#${shortRef(order.id)}`;
  const formattedDate = new Date(order.createdAt).toLocaleDateString("en-GB", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  });
  const paymentLabel =
    order.paymentMethod === "bank_transfer" ? "Direct Bank Transfer" : "Cash on Delivery";

  return (
    <div className="bg-white min-h-screen">
      <AdminPageHeader title={`Order ${orderRef}`} />
      <div className="px-8 py-8 max-w-[1200px] mx-auto space-y-12">

        {/* 1. Header row — order id + date | status manager + WhatsApp */}
        <section className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 border-b border-black pb-6">
          <div>
            <p className="text-[18px] font-semibold text-black">{orderRef}</p>
            <p className="text-[11px] uppercase tracking-[0.15em] text-black">{formattedDate}</p>
          </div>
          <OrderStatusManager order={order} />
        </section>

        {/* 2. Items table */}
        <section>
          <h2 className="text-[11px] font-semibold uppercase tracking-[0.15em] text-black mb-4">Items</h2>
          <div className="border border-black">
            <div className="bg-black text-white h-[44px] px-4 flex items-center text-[11px] font-semibold uppercase tracking-[0.15em]">
              <span className="flex-1">Product</span>
              <span className="w-[80px] text-right">Qty</span>
              <span className="w-[140px] text-right">Unit Price</span>
              <span className="w-[140px] text-right">Line Total</span>
            </div>
            {order.items.map((item) => (
              <div
                key={item.productId}
                className="h-[48px] px-4 border-b border-black text-[13px] flex items-center"
              >
                <span className="flex-1">{item.name}</span>
                <span className="w-[80px] text-right">{item.quantity}</span>
                <span className="w-[140px] text-right">{formatPrice(item.price)}</span>
                <span className="w-[140px] text-right font-semibold">
                  {formatPrice(item.price * item.quantity)}
                </span>
              </div>
            ))}
          </div>
        </section>

        {/* 3. Totals */}
        <section className="flex flex-col items-end gap-2">
          <div className="flex items-baseline gap-6">
            <span className="text-[11px] uppercase tracking-[0.15em] text-black">Subtotal</span>
            <span className="text-[13px] font-semibold text-black w-[140px] text-right">{formatPrice(order.subtotal)}</span>
          </div>
          <div className="flex items-baseline gap-6 border-t border-black pt-2">
            <span className="text-[11px] uppercase tracking-[0.15em] text-black">Total</span>
            <span className="text-[18px] font-semibold text-black w-[140px] text-right">{formatPrice(order.total)}</span>
          </div>
        </section>

        {/* 4. Customer info */}
        <section>
          <h2 className="text-[11px] font-semibold uppercase tracking-[0.15em] text-black mb-4">Customer</h2>
          <div className="border border-black p-6 space-y-1 text-[13px] text-black leading-[1.7]">
            <p className="font-semibold">{order.shippingAddress.fullName}</p>
            <p>{order.shippingAddress.phone}</p>
            <p>{order.shippingAddress.line1}</p>
            {order.shippingAddress.line2 && <p>{order.shippingAddress.line2}</p>}
            <p>
              {order.shippingAddress.city}, {order.shippingAddress.postalCode}
            </p>
            <p>{order.shippingAddress.country}</p>
          </div>
        </section>

        {/* 5. Payment info */}
        <section>
          <h2 className="text-[11px] font-semibold uppercase tracking-[0.15em] text-black mb-4">Payment</h2>
          <div className="border border-black p-6 text-[13px] text-black">
            <span className="text-[11px] uppercase tracking-[0.15em] mr-3">Method:</span>
            <span className="font-semibold">{paymentLabel}</span>
          </div>
        </section>

      </div>
    </div>
  );
}
