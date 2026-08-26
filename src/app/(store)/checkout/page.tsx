"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { useCartStore } from "@/lib/cart";
import type { PaymentMethod, ShippingAddress } from "@/types/models";
import { formatPrice } from "@/lib/currency";
import { Input } from "@/components/ui/Input";
import { OrderItemsList } from "@/components/order/OrderItemsList";

interface PublicSettings {
  bankName: string;
  accountName: string;
  accountNumber: string;
  iban: string;
  whatsappNumber?: string;
  shippingCost?: number;
  codEnabled: boolean;
  bankTransferEnabled: boolean;
}

interface FormState {
  email: string;
  firstName: string;
  lastName: string;
  line1: string;
  line2: string;
  city: string;
  state: string;
  postalCode: string;
  phone: string;
  paymentMethod: PaymentMethod;
}

const INITIAL: FormState = {
  email: "",
  firstName: "",
  lastName: "",
  line1: "",
  line2: "",
  city: "",
  state: "",
  postalCode: "",
  phone: "",
  paymentMethod: "cod",
};

export default function CheckoutPage() {
  const router = useRouter();
  const { items, total, clearCart } = useCartStore();
  const [form, setForm] = useState<FormState>(INITIAL);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [bankSettings, setBankSettings] = useState<PublicSettings | null>(null);

  useEffect(() => {
    fetch("/api/settings", { cache: "no-store" })
      .then((r) => r.json())
      .then((d) => setBankSettings(d.settings ?? null))
      .catch(() => setBankSettings(null));
  }, []);

  const subtotal = total();
  const shipping = bankSettings?.shippingCost ?? 0;
  const grandTotal = subtotal + shipping;

  function set(field: keyof FormState, value: string) {
    setForm((prev) => ({ ...prev, [field]: value }));
  }

  if (items.length === 0) {
    return (
      <div className="min-h-[60vh] flex flex-col items-center justify-center gap-6">
        <p className="text-[14px] uppercase tracking-[0.15em] text-black">Your cart is empty.</p>
        <Link
          href="/collections"
          className="border border-black bg-black text-white py-3 px-8 text-[11px] uppercase tracking-[0.15em] font-semibold hover:bg-white hover:text-black transition-none"
        >
          Browse Collections
        </Link>
      </div>
    );
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError(null);

    const shippingAddress: ShippingAddress = {
      fullName: `${form.firstName} ${form.lastName}`.trim(),
      line1: form.line1,
      line2: form.line2 || undefined,
      city: form.city,
      postalCode: form.postalCode,
      country: "PK",
      phone: form.phone,
    };

    try {
      const res = await fetch("/api/orders", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          items: items.map((item) => ({
            productId: item.productId,
            slug: item.slug,
            name: item.name,
            price: item.price,
            quantity: item.quantity,
            image: item.image,
          })),
          shippingAddress,
          paymentMethod: form.paymentMethod,
        }),
      });

      if (!res.ok) {
        const data = await res.json();
        setError(data.error ?? "Failed to place order. Please try again.");
        setLoading(false);
        return;
      }

      const { order } = await res.json();
      clearCart();
      router.push(`/orders/${order.id}/confirmation`);
    } catch {
      setError("Network error. Please check your connection and try again.");
      setLoading(false);
    }
  }

  return (
    <div className="max-w-[1440px] mx-auto min-h-[calc(100vh-80px)]">
      <div className="grid grid-cols-1 lg:grid-cols-[1fr_480px] min-h-[calc(100vh-80px)]">
        {/* ── Left: Form ── */}
        <div className="border-r border-black p-8 lg:p-16">
          <h1 className="text-[32px] leading-none tracking-[-0.02em] font-light uppercase mb-12">
            Checkout
          </h1>

          <form onSubmit={handleSubmit} className="space-y-10">
            {/* Contact */}
            <fieldset className="space-y-4">
              <legend className="text-[11px] uppercase tracking-[0.2em] font-semibold text-black mb-4 block">
                Contact Information
              </legend>
              <Input
                label="Email Address"
                type="email"
                value={form.email}
                onChange={(e) => set("email", e.target.value)}
                required
              />
            </fieldset>

            {/* Shipping */}
            <fieldset className="space-y-4">
              <legend className="text-[11px] uppercase tracking-[0.2em] font-semibold text-black mb-4 block">
                Shipping Address
              </legend>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <Input
                  label="First Name"
                  value={form.firstName}
                  onChange={(e) => set("firstName", e.target.value)}
                  required
                />
                <Input
                  label="Last Name"
                  value={form.lastName}
                  onChange={(e) => set("lastName", e.target.value)}
                  required
                />
              </div>
              <Input
                label="Street Address"
                value={form.line1}
                onChange={(e) => set("line1", e.target.value)}
                required
              />
              <Input
                label="Apartment, suite, etc. (optional)"
                value={form.line2}
                onChange={(e) => set("line2", e.target.value)}
              />
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <Input
                  label="City"
                  value={form.city}
                  onChange={(e) => set("city", e.target.value)}
                  required
                />
                <Input
                  label="State"
                  value={form.state}
                  onChange={(e) => set("state", e.target.value)}
                />
                <Input
                  label="ZIP / Postal Code"
                  value={form.postalCode}
                  onChange={(e) => set("postalCode", e.target.value)}
                  required
                />
              </div>
              <Input
                label="Phone Number"
                type="tel"
                value={form.phone}
                onChange={(e) => set("phone", e.target.value)}
                required
              />
            </fieldset>

            {/* Payment */}
            <fieldset className="space-y-4">
              <legend className="text-[11px] uppercase tracking-[0.2em] font-semibold text-black mb-4 block">
                Payment Method
              </legend>

              {bankSettings && !bankSettings.codEnabled && !bankSettings.bankTransferEnabled && (
                <p className="text-[12px] text-[#4c4546] border border-black p-4">
                  No payment methods are currently available. Please contact us for assistance.
                </p>
              )}

              {(!bankSettings || bankSettings.codEnabled) && (
                <label
                  className={`flex items-center gap-4 border p-4 cursor-pointer transition-none ${
                    form.paymentMethod === "cod"
                      ? "border-black bg-black text-white"
                      : "border-black bg-white text-black"
                  }`}
                >
                  <input
                    type="radio"
                    name="payment"
                    value="cod"
                    checked={form.paymentMethod === "cod"}
                    onChange={() => set("paymentMethod", "cod")}
                    className="sr-only"
                  />
                  <span className="material-symbols-outlined text-[20px]">local_shipping</span>
                  <div>
                    <p className="text-[12px] uppercase tracking-[0.15em] font-semibold">
                      Cash on Delivery
                    </p>
                    <p className="text-[11px] opacity-70 mt-0.5">Pay when your order arrives</p>
                  </div>
                </label>
              )}

              {(!bankSettings || bankSettings.bankTransferEnabled) && (
                <label
                  className={`flex items-center gap-4 border p-4 cursor-pointer transition-none ${
                    form.paymentMethod === "bank_transfer"
                      ? "border-black bg-black text-white"
                      : "border-black bg-white text-black"
                  }`}
                >
                  <input
                    type="radio"
                    name="payment"
                    value="bank_transfer"
                    checked={form.paymentMethod === "bank_transfer"}
                    onChange={() => set("paymentMethod", "bank_transfer")}
                    className="sr-only"
                  />
                  <span className="material-symbols-outlined text-[20px]">account_balance</span>
                  <div>
                    <p className="text-[12px] uppercase tracking-[0.15em] font-semibold">
                      Direct Bank Transfer
                    </p>
                    <p className="text-[11px] opacity-70 mt-0.5">
                      Transfer to our account, confirm via WhatsApp
                    </p>
                  </div>
                </label>
              )}

              {form.paymentMethod === "bank_transfer" && (
                <div className="border border-black p-6 space-y-3 bg-[#f9f9f9]">
                  <p className="text-[11px] uppercase tracking-[0.15em] font-semibold text-black mb-4">
                    Bank Details
                  </p>
                  {[
                    ["Institution", bankSettings?.bankName ?? "—"],
                    ["Account Name", bankSettings?.accountName ?? "—"],
                    ["Account Number", bankSettings?.accountNumber ?? "—"],
                    ["IBAN", bankSettings?.iban ?? "—"],
                  ].map(([label, value]) => (
                    <div key={label} className="flex justify-between border-b border-[#e0e0e0] pb-2">
                      <span className="text-[11px] uppercase tracking-[0.1em] text-[#4c4546]">
                        {label}
                      </span>
                      <span className="text-[12px] font-semibold text-black">{value}</span>
                    </div>
                  ))}
                  <p className="text-[11px] text-[#4c4546] pt-2 leading-[1.6]">
                    Please transfer the total amount to the account above. Your order will not ship
                    until we receive payment confirmation via WhatsApp.
                  </p>
                  {bankSettings?.whatsappNumber && (
                    <a
                      href={`https://wa.me/${bankSettings.whatsappNumber}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-block text-[11px] uppercase tracking-[0.15em] font-semibold text-black underline pt-1"
                    >
                      Questions? Contact us on WhatsApp →
                    </a>
                  )}
                </div>
              )}
            </fieldset>

            {error && (
              <p className="text-[12px] text-red-600 border border-red-300 p-3">{error}</p>
            )}

            <button
              type="submit"
              disabled={loading}
              className="w-full border border-black bg-black text-white py-4 px-8 text-[11px] uppercase tracking-[0.15em] font-semibold hover:bg-white hover:text-black transition-none disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
            >
              {loading ? (
                "Placing Order…"
              ) : (
                <>
                  Place Order
                  <span className="material-symbols-outlined text-[18px]">arrow_forward</span>
                </>
              )}
            </button>
          </form>
        </div>

        {/* ── Right: Order Summary ── */}
        <div className="bg-[#f9f9f9] p-8 lg:p-12 border-t border-black lg:border-t-0">
          <h2 className="text-[11px] uppercase tracking-[0.2em] font-semibold text-black mb-8">
            Order Summary
          </h2>

          <OrderItemsList items={items} className="mb-8" />

          <div className="border-t border-black pt-6 space-y-3">
            <div className="flex justify-between">
              <span className="text-[12px] uppercase tracking-[0.1em] text-[#4c4546]">Subtotal</span>
              <span className="text-[12px] font-semibold text-black">{formatPrice(subtotal)}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-[12px] uppercase tracking-[0.1em] text-[#4c4546]">Shipping</span>
              <span className="text-[12px] font-semibold text-black">
                {shipping === 0 ? "Free" : formatPrice(shipping)}
              </span>
            </div>
            <div className="flex justify-between border-t border-black pt-4 mt-2">
              <span className="text-[13px] uppercase tracking-[0.1em] font-semibold text-black">
                Total
              </span>
              <span className="text-[18px] font-semibold text-black">{formatPrice(grandTotal)}</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
