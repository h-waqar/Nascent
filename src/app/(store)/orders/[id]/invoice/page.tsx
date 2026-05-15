import { auth } from "@clerk/nextjs/server";
import { redirect } from "next/navigation";
import Link from "next/link";
import connectToDatabase from "@/lib/db";
import { OrderModel } from "@/models";
import mongoose from "mongoose";
import { PrintButton } from "@/components/ui/PrintButton";
import { formatPrice } from "@/lib/currency";

export const metadata = { title: "Invoice — Nascent" };

interface Props {
  params: Promise<{ id: string }>;
}

export default async function InvoicePage({ params }: Props) {
  const { userId, sessionClaims } = await auth();
  if (!userId) redirect("/sign-in");

  // D-02: owner OR admin may view this invoice.
  // Admin bypass uses the sessionClaims.metadata.role convention from the phase 4 admin gate.
  const isAdmin = (sessionClaims?.metadata as { role?: string })?.role === "admin";

  const { id } = await params;
  if (!mongoose.Types.ObjectId.isValid(id)) redirect("/orders");

  await connectToDatabase();
  const order = await OrderModel.findById(id).lean();
  if (!order) redirect("/orders");
  if (!isAdmin && order.userId !== userId) redirect("/orders");

  const orderId = order._id.toString();
  const orderNumber = `#NSC-${orderId.slice(-4).toUpperCase()}`;
  const createdAt = new Date(order.createdAt as Date).toLocaleDateString("en-GB", {
    day: "2-digit",
    month: "long",
    year: "numeric",
  });
  const paymentLabel =
    order.paymentMethod === "bank_transfer" ? "Direct Bank Transfer" : "Cash on Delivery";

  return (
    <div className="max-w-[794px] mx-auto px-8 py-12">
      {/* Brand header */}
      <div className="border-b border-black pb-8 mb-12 flex justify-between items-start">
        <span className="text-lg font-black uppercase tracking-tighter">NASCENT</span>
        <div className="text-right">
          <p className="text-[11px] uppercase tracking-[0.2em] font-semibold">INVOICE</p>
          <p className="text-[13px] mt-1">{orderNumber}</p>
        </div>
      </div>

      {/* Invoice meta */}
      <div className="grid grid-cols-2 gap-8 border-b border-black pb-12 mb-12">
        {/* Bill To */}
        <div>
          <h2 className="text-[11px] uppercase tracking-[0.15em] font-semibold mb-3">Bill To</h2>
          <p className="text-[13px] leading-[1.8]">
            {order.shippingAddress.fullName}<br />
            {order.shippingAddress.line1}<br />
            {order.shippingAddress.line2 && <>{order.shippingAddress.line2}<br /></>}
            {order.shippingAddress.city}, {order.shippingAddress.postalCode}<br />
            {order.shippingAddress.country}<br />
            {order.shippingAddress.phone}
          </p>
        </div>

        {/* Invoice Details */}
        <div>
          <h2 className="text-[11px] uppercase tracking-[0.15em] font-semibold mb-3">Invoice Details</h2>
          <div className="flex flex-col gap-3">
            {[
              { label: "Date", value: createdAt },
              { label: "Order", value: orderNumber },
              { label: "Payment", value: paymentLabel },
            ].map(({ label, value }) => (
              <div key={label} className="flex flex-col gap-0.5">
                <span className="text-[11px] uppercase tracking-[0.1em] text-[#4c4546]">{label}</span>
                <span className="text-[13px] font-semibold">{value}</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Line items table */}
      <div className="mb-12">
        {/* Header row */}
        <div className="flex border-b border-black pb-3 mb-0">
          <span className="flex-1 text-[10px] uppercase tracking-[0.15em] font-semibold">Item</span>
          <span className="w-16 text-center text-[10px] uppercase tracking-[0.15em] font-semibold">Qty</span>
          <span className="w-28 text-right text-[10px] uppercase tracking-[0.15em] font-semibold">Unit Price</span>
          <span className="w-28 text-right text-[10px] uppercase tracking-[0.15em] font-semibold">Total</span>
        </div>

        {/* Item rows */}
        {order.items.map((item, idx) => (
          <div key={idx} className="flex border-b border-[#e0e0e0] py-4">
            <span className="flex-1 text-[13px]">{item.name}</span>
            <span className="w-16 text-center text-[13px]">{item.quantity}</span>
            <span className="w-28 text-right text-[13px]">{formatPrice(item.price)}</span>
            <span className="w-28 text-right text-[13px]">
              {formatPrice(item.price * item.quantity)}
            </span>
          </div>
        ))}

        {/* Totals */}
        {order.subtotal !== order.total && (
          <div className="flex justify-end gap-8 py-2">
            <span className="text-[13px]">Subtotal</span>
            <span className="text-[13px] w-28 text-right">{formatPrice(order.subtotal)}</span>
          </div>
        )}
        <div className="flex justify-end gap-8 pt-4 border-t border-black">
          <span className="text-[13px] font-semibold uppercase tracking-[0.1em]">Total</span>
          <span className="text-[13px] font-semibold w-28 text-right">{formatPrice(order.total)}</span>
        </div>
      </div>

      {/* Footer: print button + back link */}
      <div className="no-print mt-12 flex flex-col gap-6">
        <p className="text-[11px] tracking-[0.05em] text-[#4c4546]">Thank you for your order.</p>
        <PrintButton />
        <Link
          href="/orders"
          className="text-[11px] uppercase tracking-[0.15em] text-black hover:underline transition-none"
        >
          Back to orders
        </Link>
      </div>
    </div>
  );
}
