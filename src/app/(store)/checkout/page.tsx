"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Image from "next/image";
import Link from "next/link";
import { useCartStore } from "@/lib/cart";
import type { PaymentMethod, ShippingAddress } from "@/types/models";
import { formatPrice } from "@/lib/currency";

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
              <InputField
                label="Email Address"
                type="email"
                value={form.email}
                onChange={(v) => set("email", v)}
                required
              />
            </fieldset>

            {/* Shipping */}
            <fieldset className="space-y-4">
              <legend className="text-[11px] uppercase tracking-[0.2em] font-semibold text-black mb-4 block">
                Shipping Address
              </legend>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <InputField
                  label="First Name"
                  value={form.firstName}
                  onChange={(v) => set("firstName", v)}
                  required
                />
                <InputField
                  label="Last Name"
                  value={form.lastName}
                  onChange={(v) => set("lastName", v)}
                  required
                />
              </div>
              <InputField
                label="Street Address"
                value={form.line1}
                onChange={(v) => set("line1", v)}
                required
              />
              <InputField
                label="Apartment, suite, etc. (optional)"
                value={form.line2}
                onChange={(v) => set("line2", v)}
              />
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <InputField
                  label="City"
                  value={form.city}
                  onChange={(v) => set("city", v)}
                  required
                />
                <InputField
                  label="State"
                  value={form.state}
                  onChange={(v) => set("state", v)}
                />
                <InputField
                  label="ZIP / Postal Code"
                  value={form.postalCode}
                  onChange={(v) => set("postalCode", v)}
                  required
                />
              </div>
              <InputField
                label="Phone Number"
                type="tel"
                value={form.phone}
                onChange={(v) => set("phone", v)}
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
                    form.paymentMethod === "cod" ? "border-black bg-black text-white" : "border-black bg-white text-black"
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
                    <p className="text-[12px] uppercase tracking-[0.15em] font-semibold">Cash on Delivery</p>
                    <p className="text-[11px] opacity-70 mt-0.5">Pay when your order arrives</p>
                  </div>
                </label>
              )}

              {(!bankSettings || bankSettings.bankTransferEnabled) && (
                <label
                  className={`flex items-center gap-4 border p-4 cursor-pointer transition-none ${
                    form.paymentMethod === "bank_transfer" ? "border-black bg-black text-white" : "border-black bg-white text-black"
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
                    <p className="text-[12px] uppercase tracking-[0.15em] font-semibold">Direct Bank Transfer</p>
                    <p className="text-[11px] opacity-70 mt-0.5">Transfer to our account, confirm via WhatsApp</p>
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
                      <span className="text-[11px] uppercase tracking-[0.1em] text-[#4c4546]">{label}</span>
                      <span className="text-[12px] font-semibold text-black">{value}</span>
                    </div>
                  ))}
                  <p className="text-[11px] text-[#4c4546] pt-2 leading-[1.6]">
                    Please transfer the total amount to the account above. Your order will not ship until we receive payment confirmation via WhatsApp.
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
              {loading ? "Placing Order…" : (
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

          <div className="space-y-6 mb-8">
            {items.map((item) => (
              <div key={item.productId} className="flex gap-4">
                <div className="relative w-16 h-20 flex-shrink-0 border border-black overflow-hidden bg-white">
                  {item.image ? (
                    <Image
                      src={item.image}
                      alt={item.name}
                      fill
                      sizes="64px"
                      className="object-cover grayscale"
                    />
                  ) : (
                    <div className="w-full h-full bg-[#e8e0e1]" />
                  )}
                  <span className="absolute -top-2 -right-2 w-5 h-5 bg-black text-white text-[10px] flex items-center justify-center font-semibold">
                    {item.quantity}
                  </span>
                </div>
                <div className="flex-1 flex flex-col justify-center">
                  <p className="text-[13px] uppercase tracking-[0.05em] font-medium text-black">{item.name}</p>
                  <p className="text-[11px] text-[#4c4546] mt-1">50ml Extrait de Parfum</p>
                </div>
                <p className="text-[13px] font-semibold text-black self-center">
                  {formatPrice(item.price * item.quantity)}
                </p>
              </div>
            ))}
          </div>

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
              <span className="text-[13px] uppercase tracking-[0.1em] font-semibold text-black">Total</span>
              <span className="text-[18px] font-semibold text-black">{formatPrice(grandTotal)}</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

interface InputFieldProps {
  label: string;
  value: string;
  onChange: (v: string) => void;
  type?: string;
  required?: boolean;
}

function InputField({ label, value, onChange, type = "text", required }: InputFieldProps) {
  return (
    <div className="flex flex-col gap-1.5">
      <label className="text-[11px] uppercase tracking-[0.1em] text-[#4c4546]">{label}</label>
      <input
        type={type}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        required={required}
        className="border border-black bg-white px-4 py-3 text-[13px] text-black placeholder:text-[#9c9c9c] outline-none focus:outline-none focus:ring-0 focus:border-black"
      />
    </div>
  );
}
