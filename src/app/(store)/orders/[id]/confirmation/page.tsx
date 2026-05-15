"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { use } from "react";
import type { Order } from "@/types/models";
import { generateWhatsAppLink } from "@/lib/whatsapp";
import { formatPrice } from "@/lib/currency";
import { formatOrderRef } from "@/lib/orderRef";

interface Props {
  params: Promise<{ id: string }>;
}

interface PublicSettings {
  bankName: string;
  accountName: string;
  accountNumber: string;
  iban: string;
  codEnabled: boolean;
  bankTransferEnabled: boolean;
}

export default function OrderConfirmationPage({ params }: Props) {
  const { id } = use(params);
  const [order, setOrder] = useState<Order | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [bankSettings, setBankSettings] = useState<PublicSettings | null>(null);

  useEffect(() => {
    fetch("/api/settings", { cache: "no-store" })
      .then((r) => r.json())
      .then((d) => setBankSettings(d.settings ?? null))
      .catch(() => setBankSettings(null));
  }, []);

  useEffect(() => {
    fetch(`/api/orders/${id}`)
      .then((res) => {
        if (!res.ok) throw new Error("Order not found");
        return res.json();
      })
      .then(({ order }) => setOrder(order))
      .catch((e) => setError(e.message))
      .finally(() => setLoading(false));
  }, [id]);

  if (loading) {
    return (
      <div className="min-h-[60vh] flex items-center justify-center">
        <p className="text-[11px] uppercase tracking-[0.2em] text-[#4c4546]">Loading…</p>
      </div>
    );
  }

  if (error || !order) {
    return (
      <div className="min-h-[60vh] flex flex-col items-center justify-center gap-6">
        <p className="text-[14px] uppercase tracking-[0.1em] text-black">Order not found.</p>
        <Link
          href="/collections"
          className="border border-black bg-black text-white py-3 px-8 text-[11px] uppercase tracking-[0.15em] font-semibold hover:bg-white hover:text-black transition-none"
        >
          Return to Shop
        </Link>
      </div>
    );
  }

  const orderNumber = formatOrderRef(order.id);
  const whatsappLink = generateWhatsAppLink(order);
  const isBankTransfer = order.paymentMethod === "bank_transfer";

  return (
    <div className="max-w-[1440px] mx-auto px-6 py-24 lg:px-24">
      <div className="max-w-[672px] mx-auto">
        {/* Header */}
        <div className="border-b border-black pb-12 mb-12 text-center">
          <div className="w-12 h-12 border border-black flex items-center justify-center mx-auto mb-8">
            <span className="material-symbols-outlined text-[24px] text-black">check</span>
          </div>
          <h1 className="text-[64px] leading-none tracking-[-0.04em] font-light text-black uppercase mb-4">
            Thank You
          </h1>
          <p className="text-[13px] uppercase tracking-[0.15em] text-[#4c4546]">
            Your order has been received
          </p>
          <p className="text-[18px] font-light text-black mt-4">{orderNumber}</p>
        </div>

        {/* Order Items */}
        <div className="mb-12">
          <h2 className="text-[11px] uppercase tracking-[0.2em] font-semibold text-black mb-6">
            Your Order
          </h2>
          <div className="space-y-4">
            {order.items.map((item) => (
              <div key={item.productId} className="flex justify-between border-b border-[#e0e0e0] pb-4">
                <div>
                  <p className="text-[13px] uppercase tracking-[0.05em] font-medium text-black">{item.name}</p>
                  <p className="text-[11px] text-[#4c4546] mt-0.5">Qty: {item.quantity}</p>
                </div>
                <p className="text-[13px] font-semibold text-black">
                  {formatPrice(item.price * item.quantity)}
                </p>
              </div>
            ))}
          </div>
          <div className="flex justify-between mt-4 pt-4 border-t border-black">
            <span className="text-[13px] uppercase tracking-[0.1em] font-semibold text-black">Total Paid</span>
            <span className="text-[18px] font-semibold text-black">{formatPrice(order.total)}</span>
          </div>
        </div>

        {/* Bank Transfer Instructions */}
        {isBankTransfer && (
          <div className="border border-black p-8 mb-12 bg-[#f9f9f9]">
            <h2 className="text-[11px] uppercase tracking-[0.2em] font-semibold text-black mb-6">
              Next Steps: Direct Bank Transfer
            </h2>
            <div className="space-y-3 mb-6">
              {[
                ["Institution", bankSettings?.bankName ?? "—"],
                ["Account Name", bankSettings?.accountName ?? "—"],
                ["Account Number", bankSettings?.accountNumber ?? "—"],
                ["IBAN", bankSettings?.iban ?? "—"],
                ["Reference", orderNumber],
              ].map(([label, value]) => (
                <div key={label} className="flex justify-between border-b border-[#e0e0e0] pb-2">
                  <span className="text-[11px] uppercase tracking-[0.1em] text-[#4c4546]">{label}</span>
                  <span className="text-[12px] font-semibold text-black">{value}</span>
                </div>
              ))}
            </div>
            <p className="text-[12px] text-[#4c4546] leading-[1.7]">
              Please transfer the total amount to the account above using your order number as reference.
              After transferring, share a screenshot via WhatsApp to confirm — your order ships once payment is verified.
            </p>
          </div>
        )}

        {/* CTAs */}
        <div className="flex flex-col sm:flex-row gap-4">
          <a
            href={whatsappLink}
            target="_blank"
            rel="noopener noreferrer"
            className="flex-1 border border-black bg-black text-white py-4 px-8 text-[11px] uppercase tracking-[0.15em] font-semibold hover:bg-white hover:text-black transition-none flex items-center justify-center gap-2"
          >
            <span className="material-symbols-outlined text-[18px]">chat</span>
            {isBankTransfer ? "Share Screenshot via WhatsApp" : "Contact via WhatsApp"}
          </a>
          <Link
            href="/collections"
            className="flex-1 border border-black bg-white text-black py-4 px-8 text-[11px] uppercase tracking-[0.15em] font-semibold hover:bg-black hover:text-white transition-none flex items-center justify-center gap-2"
          >
            Return to Shop
          </Link>
          <Link
            href={`/orders/${order.id}/invoice`}
            className="flex-1 border border-black bg-white text-black py-4 px-8 text-[11px] uppercase tracking-[0.15em] font-semibold hover:bg-black hover:text-white transition-none flex items-center justify-center gap-2"
          >
            <span className="material-symbols-outlined text-[18px]">receipt_long</span>
            View Invoice
          </Link>
        </div>

        {/* Shipping info */}
        <div className="mt-12 border-t border-black pt-8">
          <h2 className="text-[11px] uppercase tracking-[0.2em] font-semibold text-black mb-4">
            Shipping To
          </h2>
          <p className="text-[13px] text-black leading-[1.8]">
            {order.shippingAddress.fullName}<br />
            {order.shippingAddress.line1}<br />
            {order.shippingAddress.line2 && <>{order.shippingAddress.line2}<br /></>}
            {order.shippingAddress.city}, {order.shippingAddress.postalCode}<br />
            {order.shippingAddress.phone}
          </p>
        </div>
      </div>
    </div>
  );
}
