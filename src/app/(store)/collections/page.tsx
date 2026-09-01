"use client";

import { useState, useMemo, useEffect } from "react";
import type { Product } from "@/types/models";
import { ProductCard } from "@/components/product/ProductCard";
import { ProductGrid } from "@/components/product/ProductGrid";
import { EmptyState } from "@/components/ui/EmptyState";
import { LoadingState } from "@/components/ui/LoadingState";

const SCENT_PROFILES = ["Floral", "Woody", "Oriental", "Fresh"];
const INTENSITIES = ["Subtle", "Moderate", "Intense"];

const SORT_OPTIONS = [
  { value: "featured", label: "Featured / Default" },
  { value: "popular", label: "Popularity (Top Rated)" },
  { value: "price_asc", label: "Price: Low to High" },
  { value: "price_desc", label: "Price: High to Low" },
  { value: "name_asc", label: "Alphabetical: A → Z" },
  { value: "name_desc", label: "Alphabetical: Z → A" },
  { value: "newest", label: "Newest Releases" },
  { value: "oldest", label: "Oldest Releases" },
];

export default function CollectionsPage() {
  const [allProducts, setAllProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedScents, setSelectedScents] = useState<string[]>([]);
  const [selectedIntensities, setSelectedIntensities] = useState<string[]>([]);
  const [search, setSearch] = useState("");
  const [minPrice, setMinPrice] = useState("");
  const [maxPrice, setMaxPrice] = useState("");
  const [sort, setSort] = useState("featured");
  const [mobileFiltersOpen, setMobileFiltersOpen] = useState(false);

  useEffect(() => {
    fetch("/api/products")
      .then((r) => r.json())
      .then((data) => setAllProducts(data.products ?? []))
      .catch(() => setAllProducts([]))
      .finally(() => setLoading(false));
  }, []);

  const activeFilterCount =
    selectedScents.length +
    selectedIntensities.length +
    (minPrice ? 1 : 0) +
    (maxPrice ? 1 : 0) +
    (search ? 1 : 0);

  function clearAllFilters() {
    setSelectedScents([]);
    setSelectedIntensities([]);
    setSearch("");
    setMinPrice("");
    setMaxPrice("");
    setSort("featured");
  }

  const filtered = useMemo(() => {
    const list = allProducts.filter((p) => {
      if (search && !p.name.toLowerCase().includes(search.toLowerCase())) return false;
      if (selectedScents.length > 0 && !selectedScents.some((s) => p.scentNotes.includes(s)))
        return false;
      if (selectedIntensities.length > 0 && (!p.intensity || !selectedIntensities.includes(p.intensity)))
        return false;
      if (minPrice && p.price < Number(minPrice)) return false;
      if (maxPrice && p.price > Number(maxPrice)) return false;
      return true;
    });

    return list.sort((a, b) => {
      if (sort === "popular") {
        const scoreA = (a.rating ?? 5) * 100 + (a.ratingCount ?? 0);
        const scoreB = (b.rating ?? 5) * 100 + (b.ratingCount ?? 0);
        return scoreB - scoreA;
      }
      if (sort === "price_asc") return a.price - b.price;
      if (sort === "price_desc") return b.price - a.price;
      if (sort === "name_asc") return a.name.localeCompare(b.name);
      if (sort === "name_desc") return b.name.localeCompare(a.name);
      if (sort === "newest") {
        return new Date(b.createdAt ?? 0).getTime() - new Date(a.createdAt ?? 0).getTime();
      }
      if (sort === "oldest") {
        return new Date(a.createdAt ?? 0).getTime() - new Date(b.createdAt ?? 0).getTime();
      }
      // Default: Featured first, then newest
      if (a.isFeatured && !b.isFeatured) return -1;
      if (!a.isFeatured && b.isFeatured) return 1;
      return new Date(b.createdAt ?? 0).getTime() - new Date(a.createdAt ?? 0).getTime();
    });
  }, [allProducts, search, selectedScents, selectedIntensities, minPrice, maxPrice, sort]);

  function toggleFilter<T>(arr: T[], val: T, set: (v: T[]) => void) {
    set(arr.includes(val) ? arr.filter((x) => x !== val) : [...arr, val]);
  }

  return (
    <div className="flex flex-col md:flex-row border-x border-b border-black max-w-[1440px] mx-auto bg-white flex-grow">
      {/* ── Mobile Filter & Sort Bar (Sticky / Header on small screens) ── */}
      <div className="md:hidden border-b border-black p-4 flex items-center justify-between bg-[#f9f9f9] sticky top-0 z-20">
        <button
          type="button"
          onClick={() => setMobileFiltersOpen((prev) => !prev)}
          className="flex items-center gap-2 border border-black px-4 py-2 bg-white text-black font-['Inter'] uppercase tracking-[0.15em] text-[11px] font-semibold"
        >
          <span className="material-symbols-outlined text-[16px]">
            {mobileFiltersOpen ? "close" : "tune"}
          </span>
          <span>{mobileFiltersOpen ? "Close Filters" : "Filters"}</span>
          {activeFilterCount > 0 && (
            <span className="w-5 h-5 rounded-full bg-black text-white text-[10px] flex items-center justify-center font-bold">
              {activeFilterCount}
            </span>
          )}
        </button>

        <div className="flex items-center gap-2">
          <label htmlFor="mobile-sort" className="sr-only">
            Sort by
          </label>
          <select
            id="mobile-sort"
            value={sort}
            onChange={(e) => setSort(e.target.value)}
            className="border border-black bg-white px-3 py-2 font-['Inter'] uppercase tracking-[0.1em] text-[10px] font-semibold text-black focus:outline-none cursor-pointer"
          >
            {SORT_OPTIONS.map((opt) => (
              <option key={opt.value} value={opt.value}>
                {opt.label}
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* ── Sidebar ── */}
      <aside
        className={`${
          mobileFiltersOpen ? "flex" : "hidden"
        } md:flex w-full md:w-64 border-b md:border-b-0 md:border-r border-black p-8 flex-col gap-10 flex-shrink-0 bg-white`}
      >
        <div className="flex items-center justify-between border-b border-black pb-3">
          <span className="font-['Inter'] uppercase tracking-[0.2em] text-[12px] font-bold text-black">
            Filter Catalog
          </span>
          {activeFilterCount > 0 && (
            <button
              type="button"
              onClick={clearAllFilters}
              className="font-['Inter'] uppercase tracking-[0.1em] text-[10px] text-neutral-500 hover:text-black underline cursor-pointer"
            >
              Reset
            </button>
          )}
        </div>

        {/* Scent Profile */}
        <div>
          <h3 className="font-['Inter'] uppercase tracking-[0.15em] text-[11px] font-semibold mb-5 border-b border-black/20 pb-2 text-black">
            Scent Profile
          </h3>
          <ul className="flex flex-col gap-3.5">
            {SCENT_PROFILES.map((scent) => (
              <li key={scent} className="flex items-center gap-3">
                <input
                  type="checkbox"
                  id={`scent-${scent}`}
                  checked={selectedScents.includes(scent)}
                  onChange={() => toggleFilter(selectedScents, scent, setSelectedScents)}
                  className="appearance-none w-4 h-4 border border-black checked:bg-black checked:border-black rounded-none cursor-pointer"
                />
                <label
                  htmlFor={`scent-${scent}`}
                  className="cursor-pointer font-['Inter'] text-[13px] text-black hover:opacity-70 select-none"
                >
                  {scent}
                </label>
              </li>
            ))}
          </ul>
        </div>

        {/* Intensity */}
        <div>
          <h3 className="font-['Inter'] uppercase tracking-[0.15em] text-[11px] font-semibold mb-5 border-b border-black/20 pb-2 text-black">
            Intensity
          </h3>
          <ul className="flex flex-col gap-3.5">
            {INTENSITIES.map((intensity) => (
              <li key={intensity} className="flex items-center gap-3">
                <input
                  type="checkbox"
                  id={`intensity-${intensity}`}
                  checked={selectedIntensities.includes(intensity)}
                  onChange={() =>
                    toggleFilter(selectedIntensities, intensity, setSelectedIntensities)
                  }
                  className="appearance-none w-4 h-4 border border-black checked:bg-black checked:border-black rounded-none cursor-pointer"
                />
                <label
                  htmlFor={`intensity-${intensity}`}
                  className="cursor-pointer font-['Inter'] text-[13px] text-black hover:opacity-70 select-none"
                >
                  {intensity}
                </label>
              </li>
            ))}
          </ul>
        </div>

        {/* Price Range */}
        <div>
          <h3 className="font-['Inter'] uppercase tracking-[0.15em] text-[11px] font-semibold mb-5 border-b border-black/20 pb-2 text-black">
            Price Range (PKR)
          </h3>
          <div className="flex items-center gap-2">
            <input
              type="text"
              placeholder="MIN"
              value={minPrice}
              onChange={(e) => setMinPrice(e.target.value.replace(/\D/g, ""))}
              className="w-full border-b border-black bg-transparent text-center font-['Inter'] uppercase tracking-[0.15em] text-[11px] py-2 focus:outline-none"
            />
            <span className="text-black">–</span>
            <input
              type="text"
              placeholder="MAX"
              value={maxPrice}
              onChange={(e) => setMaxPrice(e.target.value.replace(/\D/g, ""))}
              className="w-full border-b border-black bg-transparent text-center font-['Inter'] uppercase tracking-[0.15em] text-[11px] py-2 focus:outline-none"
            />
          </div>
        </div>

        {mobileFiltersOpen && (
          <button
            type="button"
            onClick={() => setMobileFiltersOpen(false)}
            className="md:hidden w-full border border-black bg-black text-white py-3 font-['Inter'] uppercase tracking-[0.15em] text-[11px] font-semibold mt-4"
          >
            Apply Filters ({filtered.length} Items)
          </button>
        )}
      </aside>

      {/* ── Product area ── */}
      <section className="flex-grow flex flex-col min-w-0">
        {/* Top Control Bar: Search & Desktop Sort */}
        <div className="border-b border-black px-4 py-3.5 md:px-8 md:py-4 flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-4 bg-white">
          <div className="flex items-center flex-grow">
            <span className="material-symbols-outlined text-black mr-3 text-[20px]">search</span>
            <input
              type="text"
              placeholder="SEARCH COLLECTION..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full bg-transparent border-none focus:outline-none font-['Inter'] uppercase tracking-[0.12em] text-[14px] text-black placeholder:text-[#666]"
            />
            {search && (
              <button
                type="button"
                onClick={() => setSearch("")}
                className="font-['Inter'] text-[11px] uppercase tracking-wider text-[#4c4546] hover:text-black px-2 cursor-pointer"
              >
                Clear
              </button>
            )}
          </div>

          <div className="hidden md:flex items-center gap-3 flex-shrink-0">
            <label
              htmlFor="desktop-sort"
              className="font-['Inter'] uppercase tracking-[0.15em] text-[10px] text-[#4c4546] font-semibold"
            >
              Sort by:
            </label>
            <div className="relative">
              <select
                id="desktop-sort"
                value={sort}
                onChange={(e) => setSort(e.target.value)}
                className="appearance-none border border-black bg-white pl-4 pr-10 py-2.5 font-['Inter'] uppercase tracking-[0.12em] text-[11px] font-semibold text-black focus:outline-none cursor-pointer rounded-none"
              >
                {SORT_OPTIONS.map((opt) => (
                  <option key={opt.value} value={opt.value}>
                    {opt.label}
                  </option>
                ))}
              </select>
              <span className="material-symbols-outlined absolute right-2.5 top-1/2 -translate-y-1/2 pointer-events-none text-[16px] text-black">
                arrow_drop_down
              </span>
            </div>
          </div>
        </div>

        {/* Results summary header */}
        <div className="px-8 py-3 bg-[#fdfdfd] border-b border-black/10 flex items-center justify-between font-['Inter'] text-[10px] uppercase tracking-wider text-[#4c4546]">
          <span>Showing {filtered.length} {filtered.length === 1 ? "Fragrance" : "Fragrances"}</span>
          {activeFilterCount > 0 && (
            <button onClick={clearAllFilters} className="hover:text-black underline cursor-pointer">
              Clear {activeFilterCount} active {activeFilterCount === 1 ? "filter" : "filters"}
            </button>
          )}
        </div>

        {/* Product Grid */}
        {loading ? (
          <LoadingState minHeight="min-h-[400px]" />
        ) : filtered.length === 0 ? (
          <EmptyState
            message="No fragrances match your filters."
            className="flex-grow min-h-[400px]"
          />
        ) : (
          <ProductGrid cols={3} className="border-none" isVisible={true}>
            {filtered.map((product) => (
              <ProductCard key={product.id} product={product} />
            ))}
          </ProductGrid>
        )}
      </section>
    </div>
  );
}
