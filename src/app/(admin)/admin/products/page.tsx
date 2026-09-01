"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import Image from "next/image";
import type { Product, Category } from "@/types/models";
import { formatPrice } from "@/lib/currency";
import { AdminPageHeader } from "@/components/admin/AdminPageHeader";
import { ConfirmationModal } from "@/components/admin/ConfirmationModal";
import { LowStockBadge } from "@/components/admin/LowStockBadge";
import { AdminTable, AdminTableHeader, AdminTableRow } from "@/components/admin/AdminTable";
import { Input } from "@/components/ui/Input";
import { Pagination } from "@/components/ui/Pagination";

type StockFilter = "all" | "in_stock" | "low_stock" | "out_of_stock" | "hidden" | "visible";
type SortOption = "name_asc" | "name_desc" | "price_asc" | "price_desc" | "stock_asc" | "newest";

const STOCK_FILTERS: Array<{ key: StockFilter; label: string }> = [
  { key: "all", label: "All Products" },
  { key: "in_stock", label: "In Stock" },
  { key: "low_stock", label: "Low Stock (≤5)" },
  { key: "out_of_stock", label: "Out of Stock" },
  { key: "visible", label: "Visible" },
  { key: "hidden", label: "Hidden" },
];

const SORT_OPTIONS: Array<{ key: SortOption; label: string }> = [
  { key: "name_asc", label: "Name: A → Z" },
  { key: "name_desc", label: "Name: Z → A" },
  { key: "price_asc", label: "Price: Low to High" },
  { key: "price_desc", label: "Price: High to Low" },
  { key: "stock_asc", label: "Stock: Low to High" },
  { key: "newest", label: "Newest First" },
];

const ALPHABET = ["ALL", ..."ABCDEFGHIJKLMNOPQRSTUVWXYZ".split(""), "#"];
const PAGE_SIZE = 10;

export default function AdminProductsPage() {
  const [products, setProducts] = useState<Product[]>([]);
  const [categoriesById, setCategoriesById] = useState<Record<string, string>>({});
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [pendingDelete, setPendingDelete] = useState<Product | null>(null);
  const [deleting, setDeleting] = useState(false);
  const [togglingId, setTogglingId] = useState<string | null>(null);

  // Filters and sorting state
  const [search, setSearch] = useState("");
  const [selectedCollection, setSelectedCollection] = useState("all");
  const [stockFilter, setStockFilter] = useState<StockFilter>("all");
  const [selectedLetter, setSelectedLetter] = useState<string>("ALL");
  const [sortBy, setSortBy] = useState<SortOption>("name_asc");
  const [page, setPage] = useState(1);

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
      (cData.categories ?? []).forEach((c: Category) => {
        map[c.id] = c.name;
      });
      setCategoriesById(map);
    } catch (e) {
      setError(e instanceof Error ? e.message : "Load failed");
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    let cancelled = false;
    async function init() {
      try {
        const [pRes, cRes] = await Promise.all([
          fetch("/api/admin/products", { cache: "no-store" }),
          fetch("/api/categories", { cache: "no-store" }),
        ]);
        if (!pRes.ok) throw new Error("Failed to load products");
        const pData = await pRes.json();
        const cData = cRes.ok ? await cRes.json() : { categories: [] };
        if (!cancelled) {
          setProducts(pData.products ?? []);
          const map: Record<string, string> = {};
          (cData.categories ?? []).forEach((c: Category) => {
            map[c.id] = c.name;
          });
          setCategoriesById(map);
        }
      } catch (e) {
        if (!cancelled) setError(e instanceof Error ? e.message : "Load failed");
      } finally {
        if (!cancelled) setLoading(false);
      }
    }
    init();
    return () => {
      cancelled = true;
    };
  }, []);

  async function handleToggleHidden(id: string, currentHidden: boolean) {
    setTogglingId(id);
    try {
      const res = await fetch(`/api/admin/products/${id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ hidden: !currentHidden }),
      });
      if (!res.ok) throw new Error("Toggle failed");
      await load();
    } catch (e) {
      setError(e instanceof Error ? e.message : "Toggle failed");
    } finally {
      setTogglingId(null);
    }
  }

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

  // Unique collections list
  const availableCollections = useMemo(() => {
    const set = new Set<string>();
    products.forEach((p) => {
      const col = categoriesById[p.categoryId] ?? p.collection;
      if (col && col.trim()) set.add(col.trim());
    });
    return Array.from(set).sort();
  }, [products, categoriesById]);

  // Filtered and sorted products
  const filteredAndSortedProducts = useMemo(() => {
    const q = search.trim().toLowerCase();

    return products
      .filter((p) => {
        // Search query filter
        if (q) {
          const col = (categoriesById[p.categoryId] ?? p.collection ?? "").toLowerCase();
          const matchName = p.name.toLowerCase().includes(q);
          const matchSlug = p.slug.toLowerCase().includes(q);
          const matchCol = col.includes(q);
          if (!matchName && !matchSlug && !matchCol) return false;
        }

        // Collection filter
        if (selectedCollection !== "all") {
          const col = categoriesById[p.categoryId] ?? p.collection;
          if (col !== selectedCollection) return false;
        }

        // Stock status filter
        if (stockFilter === "in_stock" && p.stock <= 5) return false;
        if (stockFilter === "low_stock" && (p.stock > 5 || p.stock <= 0)) return false;
        if (stockFilter === "out_of_stock" && p.stock > 0) return false;
        if (stockFilter === "hidden" && !p.hidden) return false;
        if (stockFilter === "visible" && p.hidden) return false;

        // A-Z letter filter
        if (selectedLetter !== "ALL") {
          const trimmedName = p.name.trim();
          const firstChar = trimmedName.charAt(0).toUpperCase();
          if (selectedLetter === "#") {
            if (/^[A-Z]$/i.test(firstChar)) return false;
          } else {
            if (firstChar !== selectedLetter) return false;
          }
        }

        return true;
      })
      .sort((a, b) => {
        switch (sortBy) {
          case "name_asc":
            return a.name.localeCompare(b.name, undefined, { sensitivity: "base" });
          case "name_desc":
            return b.name.localeCompare(a.name, undefined, { sensitivity: "base" });
          case "price_asc":
            return a.price - b.price;
          case "price_desc":
            return b.price - a.price;
          case "stock_asc":
            return a.stock - b.stock;
          case "newest":
          default:
            return 0; // keeps original loaded order (createdAt: -1)
        }
      });
  }, [products, categoriesById, search, selectedCollection, stockFilter, selectedLetter, sortBy]);

  // Reset page to 1 when filters change
  const handleFilterChange = () => {
    setPage(1);
  };

  const hasActiveFilters =
    search.trim() !== "" ||
    selectedCollection !== "all" ||
    stockFilter !== "all" ||
    selectedLetter !== "ALL" ||
    sortBy !== "name_asc";

  const clearAllFilters = () => {
    setSearch("");
    setSelectedCollection("all");
    setStockFilter("all");
    setSelectedLetter("ALL");
    setSortBy("name_asc");
    setPage(1);
  };

  // Pagination calculations
  const totalItems = filteredAndSortedProducts.length;
  const pageCount = Math.max(1, Math.ceil(totalItems / PAGE_SIZE));
  const currentPage = Math.min(page, pageCount);
  const paginatedProducts = useMemo(() => {
    const start = (currentPage - 1) * PAGE_SIZE;
    return filteredAndSortedProducts.slice(start, start + PAGE_SIZE);
  }, [filteredAndSortedProducts, currentPage]);

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

      <div className="px-8 py-8 space-y-6">
        {error && (
          <div className="border border-black px-4 py-3 text-[11px] uppercase tracking-[0.1em] text-black">
            {error}
          </div>
        )}

        {/* ── Filters Section ── */}
        <div className="border border-black p-5 space-y-5 bg-[#fafafa]">
          {/* Row 1: Search & Sort Dropdown */}
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div className="w-full md:max-w-[340px]">
              <Input
                type="text"
                placeholder="Search products by name or collection…"
                value={search}
                onChange={(e) => {
                  setSearch(e.target.value);
                  handleFilterChange();
                }}
              />
            </div>

            <div className="flex items-center gap-3">
              <label htmlFor="admin-products-sort" className="font-['Inter'] text-[11px] font-semibold uppercase tracking-[0.12em] text-black whitespace-nowrap">
                Sort By:
              </label>
              <select
                id="admin-products-sort"
                value={sortBy}
                onChange={(e) => {
                  setSortBy(e.target.value as SortOption);
                  handleFilterChange();
                }}
                className="border border-black bg-white px-3 py-2 text-[11px] font-semibold uppercase tracking-[0.1em] text-black outline-none cursor-pointer"
              >
                {SORT_OPTIONS.map((opt) => (
                  <option key={opt.key} value={opt.key}>
                    {opt.label}
                  </option>
                ))}
              </select>

              {hasActiveFilters && (
                <button
                  type="button"
                  onClick={clearAllFilters}
                  className="text-[11px] font-semibold uppercase tracking-[0.1em] text-black underline hover:opacity-60 whitespace-nowrap ml-2"
                >
                  Clear Filters
                </button>
              )}
            </div>
          </div>

          {/* Row 2: Stock / Visibility Status Chips */}
          <div className="flex flex-wrap items-center gap-2 pt-2 border-t border-black/10">
            <span className="font-['Inter'] text-[10px] font-semibold uppercase tracking-[0.15em] text-[#666] mr-1">
              Status:
            </span>
            {STOCK_FILTERS.map((f) => {
              const active = stockFilter === f.key;
              return (
                <button
                  key={f.key}
                  type="button"
                  onClick={() => {
                    setStockFilter(f.key);
                    handleFilterChange();
                  }}
                  className={
                    active
                      ? "bg-black text-white px-3 h-[28px] flex items-center text-[11px] font-semibold uppercase tracking-[0.1em]"
                      : "border border-black bg-white text-black px-3 h-[28px] flex items-center text-[11px] font-semibold uppercase tracking-[0.1em] hover:bg-black hover:text-white transition-none"
                  }
                >
                  {f.label}
                </button>
              );
            })}
          </div>

          {/* Row 3: Collections Filter Chips */}
          {availableCollections.length > 0 && (
            <div className="flex flex-wrap items-center gap-2 pt-2 border-t border-black/10">
              <span className="font-['Inter'] text-[10px] font-semibold uppercase tracking-[0.15em] text-[#666] mr-1">
                Collection:
              </span>
              <button
                type="button"
                onClick={() => {
                  setSelectedCollection("all");
                  handleFilterChange();
                }}
                className={
                  selectedCollection === "all"
                    ? "bg-black text-white px-3 h-[28px] flex items-center text-[11px] font-semibold uppercase tracking-[0.1em]"
                    : "border border-black bg-white text-black px-3 h-[28px] flex items-center text-[11px] font-semibold uppercase tracking-[0.1em] hover:bg-black hover:text-white transition-none"
                }
              >
                All Collections
              </button>
              {availableCollections.map((col) => {
                const active = selectedCollection === col;
                return (
                  <button
                    key={col}
                    type="button"
                    onClick={() => {
                      setSelectedCollection(col);
                      handleFilterChange();
                    }}
                    className={
                      active
                        ? "bg-black text-white px-3 h-[28px] flex items-center text-[11px] font-semibold uppercase tracking-[0.1em]"
                        : "border border-black bg-white text-black px-3 h-[28px] flex items-center text-[11px] font-semibold uppercase tracking-[0.1em] hover:bg-black hover:text-white transition-none"
                    }
                  >
                    {col}
                  </button>
                );
              })}
            </div>
          )}

          {/* Row 4: A - Z Alphabet Letter Filter Bar */}
          <div className="pt-2 border-t border-black/10">
            <div className="flex items-center justify-between mb-2">
              <span className="font-['Inter'] text-[10px] font-semibold uppercase tracking-[0.15em] text-[#666]">
                A – Z Filter:
              </span>
              <span className="text-[10px] font-semibold uppercase tracking-[0.1em] text-black">
                {selectedLetter === "ALL"
                  ? "Showing all letters"
                  : selectedLetter === "#"
                  ? "Starting with digits/symbols"
                  : `Starting with "${selectedLetter}"`}
              </span>
            </div>
            <div className="flex flex-wrap gap-1">
              {ALPHABET.map((letter) => {
                const active = selectedLetter === letter;
                return (
                  <button
                    key={letter}
                    type="button"
                    onClick={() => {
                      setSelectedLetter(letter);
                      handleFilterChange();
                    }}
                    className={
                      active
                        ? "bg-black text-white w-[30px] h-[28px] flex items-center justify-center text-[11px] font-semibold uppercase tracking-[0.05em]"
                        : "border border-black bg-white text-black w-[30px] h-[28px] flex items-center justify-center text-[11px] font-semibold uppercase tracking-[0.05em] hover:bg-black hover:text-white transition-none"
                    }
                    title={letter === "ALL" ? "All letters" : `Filter starting with ${letter}`}
                  >
                    {letter}
                  </button>
                );
              })}
            </div>
          </div>
        </div>

        {/* ── Table Header Stats ── */}
        <div className="flex items-center justify-between text-[11px] uppercase tracking-[0.1em] text-[#4c4546]">
          <span>
            Found <strong className="text-black">{totalItems}</strong> product{totalItems === 1 ? "" : "s"}
            {hasActiveFilters ? " matching filters" : ""}
          </span>
          {totalItems > 0 && (
            <span>
              Page {currentPage} of {pageCount}
            </span>
          )}
        </div>

        {/* ── Products Table ── */}
        <AdminTable>
          <AdminTableHeader>
            <span className="w-[80px]">Image</span>
            <span className="flex-1">Name</span>
            <span className="w-[120px] text-right">Price</span>
            <span className="w-[80px] text-right">Stock</span>
            <span className="w-[160px] text-right">Collection</span>
            <span className="w-[220px] text-right">Actions</span>
          </AdminTableHeader>
          {loading ? (
            <div className="px-4 py-3 text-[13px] text-black">Loading…</div>
          ) : paginatedProducts.length === 0 ? (
            <div className="px-4 py-6 text-[13px] text-black text-center space-y-2">
              <p>No products match the selected filters or search criteria.</p>
              {hasActiveFilters && (
                <button
                  type="button"
                  onClick={clearAllFilters}
                  className="text-[11px] font-semibold uppercase tracking-[0.1em] underline hover:opacity-60"
                >
                  Reset all filters
                </button>
              )}
            </div>
          ) : (
            paginatedProducts.map((p) => (
              <AdminTableRow key={p.id} height="h-[64px]">
                <span className="w-[80px]">
                  {p.images?.[0] ? (
                    <Image
                      src={p.images[0]}
                      alt={p.name}
                      width={48}
                      height={48}
                      className="object-cover w-[48px] h-[48px] border border-current"
                    />
                  ) : (
                    <span className="w-[48px] h-[48px] inline-block border border-current bg-current opacity-10" />
                  )}
                </span>
                <span className="flex-1 font-semibold flex items-center gap-2">
                  {p.name}
                  {p.hidden && (
                    <span className="text-[9px] font-semibold uppercase tracking-[0.15em] border border-current px-1.5 py-0.5 opacity-60">
                      Hidden
                    </span>
                  )}
                </span>
                <span className="w-[120px] text-right">{formatPrice(p.price)}</span>
                <span className="w-[80px] text-right">
                  <LowStockBadge stock={p.stock} />
                </span>
                <span className="w-[160px] text-right">
                  {categoriesById[p.categoryId] ?? p.collection ?? "—"}
                </span>
                <span className="w-[220px] text-right flex items-center justify-end gap-3">
                  <button
                    type="button"
                    disabled={togglingId === p.id}
                    onClick={() => handleToggleHidden(p.id, !!p.hidden)}
                    className="text-[11px] font-semibold uppercase tracking-[0.1em] hover:underline transition-none disabled:opacity-40"
                  >
                    {togglingId === p.id ? "…" : p.hidden ? "Show" : "Hide"}
                  </button>
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
              </AdminTableRow>
            ))
          )}
        </AdminTable>

        {/* ── Table Pagination ── */}
        {totalItems > PAGE_SIZE && (
          <Pagination
            page={currentPage}
            pageCount={pageCount}
            totalItems={totalItems}
            itemName="product"
            onPageChange={setPage}
          />
        )}
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
