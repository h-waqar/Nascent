"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import Image from "next/image";
import type { Product, Category } from "@/types/models";
import { formatPrice } from "@/lib/currency";
import { AdminPageHeader } from "@/components/admin/AdminPageHeader";
import { ConfirmationModal } from "@/components/admin/ConfirmationModal";
import { LowStockBadge } from "@/components/admin/LowStockBadge";

export default function AdminProductsPage() {
  const [products, setProducts] = useState<Product[]>([]);
  const [categoriesById, setCategoriesById] = useState<Record<string, string>>({});
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [pendingDelete, setPendingDelete] = useState<Product | null>(null);
  const [deleting, setDeleting] = useState(false);

  async function load() {
    setLoading(true);
    setError(null);
    try {
      const [pRes, cRes] = await Promise.all([
        fetch("/api/admin/products", { cache: "no-store" }),
        fetch("/api/categories", { cache: "no-store" }),
      ]);
      if (!pRes.ok) throw new Error("Failed to load products");
      const pData = await pRes.json();
      const cData = cRes.ok ? await cRes.json() : { categories: [] };
      setProducts(pData.products ?? []);
      const map: Record<string, string> = {};
      (cData.categories ?? []).forEach((c: Category) => { map[c.id] = c.name; });
      setCategoriesById(map);
    } catch (e) {
      setError(e instanceof Error ? e.message : "Load failed");
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => { load(); }, []);

  async function handleDelete() {
    if (!pendingDelete) return;
    setDeleting(true);
    try {
      const res = await fetch(`/api/admin/products/${pendingDelete.id}`, { method: "DELETE" });
      if (!res.ok) throw new Error("Delete failed");
      setPendingDelete(null);
      await load();
    } catch (e) {
      setError(e instanceof Error ? e.message : "Delete failed");
    } finally {
      setDeleting(false);
    }
  }

  return (
    <div className="bg-white min-h-screen">
      <AdminPageHeader
        title="Products"
        action={
          <Link
            href="/admin/products/new"
            className="border border-black bg-black text-white py-2 px-6 text-[11px] font-semibold uppercase tracking-[0.15em] hover:bg-white hover:text-black transition-none"
          >
            + New Product
          </Link>
        }
      />
      <div className="px-8 py-8">
        {error && (
          <div className="border border-black px-4 py-3 mb-6 text-[11px] uppercase tracking-[0.1em] text-black">
            {error}
          </div>
        )}
        <div className="border border-black">
          {/* Header row */}
          <div className="bg-black text-white h-[44px] px-4 flex items-center text-[11px] font-semibold uppercase tracking-[0.15em]">
            <span className="w-[80px]">Image</span>
            <span className="flex-1">Name</span>
            <span className="w-[120px] text-right">Price</span>
            <span className="w-[80px] text-right">Stock</span>
            <span className="w-[180px]">Collection</span>
            <span className="w-[180px] text-right">Actions</span>
          </div>
          {loading ? (
            <div className="px-4 py-3 text-[13px] text-black">Loading…</div>
          ) : products.length === 0 ? (
            <div className="px-4 py-3 text-[13px] text-black">No products yet. Click + New Product to add one.</div>
          ) : (
            products.map((p) => (
              <div
                key={p.id}
                className="h-[64px] px-4 border-b border-black text-[13px] hover:bg-black hover:text-white transition-none flex items-center"
              >
                <span className="w-[80px]">
                  {p.images?.[0] ? (
                    <Image src={p.images[0]} alt={p.name} width={48} height={48} className="object-cover w-[48px] h-[48px] border border-current" />
                  ) : (
                    <span className="w-[48px] h-[48px] inline-block border border-current bg-current opacity-10" />
                  )}
                </span>
                <span className="flex-1 font-semibold">{p.name}</span>
                <span className="w-[120px] text-right">{formatPrice(p.price)}</span>
                <span className="w-[80px] text-right">
                  <LowStockBadge stock={p.stock} />
                </span>
                <span className="w-[180px]">{categoriesById[p.categoryId] ?? p.collection ?? "—"}</span>
                <span className="w-[180px] text-right flex items-center justify-end gap-4">
                  <Link
                    href={`/admin/products/${p.id}/edit`}
                    className="text-[11px] font-semibold uppercase tracking-[0.1em] hover:underline transition-none"
                  >
                    Edit →
                  </Link>
                  <button
                    type="button"
                    onClick={() => setPendingDelete(p)}
                    className="text-[11px] font-semibold uppercase tracking-[0.1em] hover:underline transition-none"
                  >
                    Delete
                  </button>
                </span>
              </div>
            ))
          )}
        </div>
      </div>
      <ConfirmationModal
        open={!!pendingDelete}
        title={pendingDelete ? `Delete "${pendingDelete.name}"? This cannot be undone.` : ""}
        confirmLabel="Delete Product"
        cancelLabel="Keep Product"
        onConfirm={handleDelete}
        onCancel={() => setPendingDelete(null)}
        busy={deleting}
      />
    </div>
  );
}
