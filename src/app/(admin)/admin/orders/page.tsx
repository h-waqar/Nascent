"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import type { Order, OrderStatus } from "@/types/models";
import { ORDER_STATUSES } from "@/lib/orderStatus";
import { formatPrice } from "@/lib/currency";
import { shortRef } from "@/lib/orderRef";
import { AdminPageHeader } from "@/components/admin/AdminPageHeader";
import { StatusBadge } from "@/components/admin/StatusBadge";

type FilterValue = "all" | OrderStatus;

const FILTER_VALUES: FilterValue[] = ["all", ...ORDER_STATUSES];
const PAGE_SIZE = 10;

export default function AdminOrdersPage() {
  const [filter, setFilter] = useState<FilterValue>("all");
  const [search, setSearch] = useState("");
  const [orders, setOrders] = useState<Order[]>([]);
  const [page, setPage] = useState(1);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;
    setLoading(true);
    setError(null);
    setPage(1);
    const url =
      filter === "all"
        ? "/api/admin/orders"
        : `/api/admin/orders?status=${encodeURIComponent(filter)}`;
    fetch(url, { cache: "no-store" })
      .then(async (res) => {
        if (!res.ok) throw new Error("Failed to load orders");
        const data = await res.json();
        if (!cancelled) setOrders(data.orders ?? []);
      })
      .catch((e) => {
        if (!cancelled) setError(e instanceof Error ? e.message : "Load failed");
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });
    return () => {
      cancelled = true;
    };
  }, [filter]);

  const filteredOrders = useMemo(() => {
    if (!search.trim()) return orders;
    const q = search.trim().toLowerCase().replace(/^#/, "");
    return orders.filter((o) => shortRef(o.id).toLowerCase().includes(q));
  }, [orders, search]);

  const pageCount = Math.max(1, Math.ceil(filteredOrders.length / PAGE_SIZE));
  const pageOrders = useMemo(
    () => filteredOrders.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE),
    [filteredOrders, page]
  );

  return (
    <div className="bg-white min-h-screen">
      <AdminPageHeader title="Orders" />
      <div className="px-8 py-8 space-y-6">
        {/* Order ID search */}
        <input
          type="text"
          placeholder="Search by order ID…"
          value={search}
          onChange={(e) => { setSearch(e.target.value); setPage(1); }}
          className="border border-black px-4 h-[40px] text-[13px] w-full max-w-[320px] bg-white text-black placeholder:text-[#9c9c9c] focus:outline-none"
        />

        {/* Status filter chips */}
        <div className="flex flex-wrap gap-2">
          {FILTER_VALUES.map((v) => {
            const active = filter === v;
            return (
              <button
                key={v}
                type="button"
                onClick={() => setFilter(v)}
                className={
                  active
                    ? "bg-black text-white px-3 h-[28px] flex items-center text-[11px] font-semibold uppercase tracking-[0.1em]"
                    : "border border-black px-3 h-[28px] flex items-center text-[11px] font-semibold uppercase tracking-[0.1em] hover:bg-black hover:text-white transition-none"
                }
              >
                {v === "all" ? "All" : v}
              </button>
            );
          })}
        </div>

        {error && (
          <div className="border border-black px-4 py-3 text-[11px] uppercase tracking-[0.1em] text-black">
            {error}
          </div>
        )}

        {/* Table */}
        <div className="border border-black">
          <div className="bg-black text-white h-[44px] px-4 flex items-center text-[11px] font-semibold uppercase tracking-[0.15em]">
            <span className="w-[100px]">Order ID</span>
            <span className="w-[140px]">Date</span>
            <span className="flex-1">Customer</span>
            <span className="w-[120px] text-right">Total</span>
            <span className="w-[140px]">Status</span>
            <span className="w-[140px] text-right">Action</span>
          </div>
          {loading ? (
            <div className="px-4 py-3 text-[13px] text-black">Loading…</div>
          ) : pageOrders.length === 0 ? (
            <div className="px-4 py-3 text-[13px] text-black">No orders match this filter.</div>
          ) : (
            pageOrders.map((o) => (
              <div
                key={o.id}
                className="h-[48px] px-4 border-b border-black text-[13px] hover:bg-black hover:text-white transition-none flex items-center"
              >
                <span className="w-[100px] font-semibold">#{shortRef(o.id)}</span>
                <span className="w-[140px]">
                  {new Date(o.createdAt).toLocaleDateString("en-GB", {
                    day: "2-digit",
                    month: "short",
                    year: "numeric",
                  })}
                </span>
                <span className="flex-1">{o.shippingAddress.fullName}</span>
                <span className="w-[120px] text-right">{formatPrice(o.total)}</span>
                <span className="w-[140px]">
                  <StatusBadge status={o.status} />
                </span>
                <span className="w-[140px] text-right flex items-center justify-end gap-3">
                  <Link
                    href={`/admin/orders/${o.id}`}
                    className="text-[11px] font-semibold uppercase tracking-[0.1em] hover:underline transition-none"
                  >
                    View
                  </Link>
                  <a
                    href={`/orders/${o.id}/invoice`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-[11px] font-semibold uppercase tracking-[0.1em] hover:underline transition-none"
                  >
                    Print
                  </a>
                </span>
              </div>
            ))
          )}
        </div>

        {/* Pagination */}
        <div className="flex items-center justify-between">
          <span className="text-[11px] uppercase tracking-[0.1em] text-black">
            Page {page} of {pageCount} — {filteredOrders.length} order{filteredOrders.length === 1 ? "" : "s"}
          </span>
          <div className="flex gap-2">
            <button
              type="button"
              onClick={() => setPage((p) => Math.max(1, p - 1))}
              disabled={page <= 1}
              className="border border-black bg-white text-black py-2 px-4 text-[11px] font-semibold uppercase tracking-[0.15em] hover:bg-black hover:text-white transition-none disabled:opacity-50 disabled:cursor-not-allowed"
            >
              &larr; Prev
            </button>
            <button
              type="button"
              onClick={() => setPage((p) => Math.min(pageCount, p + 1))}
              disabled={page >= pageCount}
              className="border border-black bg-white text-black py-2 px-4 text-[11px] font-semibold uppercase tracking-[0.15em] hover:bg-black hover:text-white transition-none disabled:opacity-50 disabled:cursor-not-allowed"
            >
              Next &rarr;
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
