"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import type { Order, OrderStatus } from "@/types/models";
import { ORDER_STATUSES, isValidTransition } from "@/lib/orderStatus";
import { generateWhatsAppLink } from "@/lib/whatsapp";

export interface OrderStatusManagerProps {
  order: Order;
}

export function OrderStatusManager({ order }: OrderStatusManagerProps) {
  const router = useRouter();
  const [pending, setPending] = useState<OrderStatus>(order.status);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Legal next-statuses = current status (the no-op default) + every status `s`
  // for which isValidTransition(order.status, s) returns true.
  const legalOptions: OrderStatus[] = [
    order.status,
    ...ORDER_STATUSES.filter((s) => isValidTransition(order.status, s)),
  ];

  const noChange = pending === order.status;
  const whatsappHref = generateWhatsAppLink(order);

  async function handleUpdate() {
    if (noChange) return;
    setSubmitting(true);
    setError(null);
    try {
      const res = await fetch(`/api/admin/orders/${order.id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status: pending }),
      });
      if (!res.ok) {
        const body = await res.json().catch(() => ({}));
        throw new Error(typeof body.error === "string" ? body.error : `HTTP ${res.status}`);
      }
      router.refresh();
    } catch (e) {
      setError(e instanceof Error ? e.message : "Update failed");
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <div className="flex items-center gap-3 flex-wrap">
      <select
        value={pending}
        onChange={(e) => setPending(e.target.value as OrderStatus)}
        disabled={submitting || legalOptions.length === 1}
        className="border border-black px-3 h-[40px] text-[11px] font-semibold uppercase tracking-[0.15em] bg-white text-black focus:outline-none disabled:opacity-50"
      >
        {legalOptions.map((s) => (
          <option key={s} value={s}>
            {s.toUpperCase()}
          </option>
        ))}
      </select>
      <button
        type="button"
        onClick={handleUpdate}
        disabled={submitting || noChange}
        className="border border-black bg-black text-white py-2 px-6 text-[11px] font-semibold uppercase tracking-[0.15em] hover:bg-white hover:text-black transition-none disabled:opacity-50 disabled:cursor-not-allowed"
      >
        {submitting ? "Updating…" : "Update"}
      </button>
      <a
        href={whatsappHref}
        target="_blank"
        rel="noopener noreferrer"
        className="border border-black bg-white text-black py-2 px-6 text-[11px] font-semibold uppercase tracking-[0.15em] hover:bg-black hover:text-white transition-none"
      >
        WhatsApp &rarr;
      </a>
      {error && (
        <span className="text-[11px] uppercase tracking-[0.1em] text-black border border-black px-3 py-1">
          {error}
        </span>
      )}
    </div>
  );
}
