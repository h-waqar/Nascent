"use client";

import { useState, useMemo } from "react";
import { useScrollReveal } from "@/hooks/useScrollReveal";
import Link from "next/link";
import Image from "next/image";
import { PRODUCTS } from "@/components/dummy-data";

const SCENT_PROFILES = ["Floral", "Woody", "Oriental", "Fresh"];
const INTENSITIES = ["Subtle", "Moderate", "Intense"];

export default function CollectionsPage() {
  const gridReveal = useScrollReveal(0.15);
  const [selectedScents, setSelectedScents] = useState<string[]>([]);
  const [selectedIntensities, setSelectedIntensities] = useState<string[]>([]);
  const [search, setSearch] = useState("");
  const [minPrice, setMinPrice] = useState("");
  const [maxPrice, setMaxPrice] = useState("");

  const filtered = useMemo(() => {
    return PRODUCTS.filter((p) => {
      if (search && !p.name.toLowerCase().includes(search.toLowerCase())) return false;
      if (selectedScents.length > 0 && !selectedScents.some((s) => p.scentNotes.includes(s)))
        return false;
      if (selectedIntensities.length > 0 && (!p.intensity || !selectedIntensities.includes(p.intensity)))
        return false;
      if (minPrice && p.price < Number(minPrice)) return false;
      if (maxPrice && p.price > Number(maxPrice)) return false;
      return true;
    });
  }, [search, selectedScents, selectedIntensities, minPrice, maxPrice]);

  function toggleFilter<T>(arr: T[], val: T, set: (v: T[]) => void) {
    set(arr.includes(val) ? arr.filter((x) => x !== val) : [...arr, val]);
  }

  return (
    <div className="flex flex-col md:flex-row border-x border-b border-black max-w-[1440px] mx-auto bg-white min-h-screen">
      {/* ── Sidebar ── */}
      <aside className="w-full md:w-64 border-b md:border-b-0 md:border-r border-black p-8 flex flex-col gap-12 flex-shrink-0">
        {/* Scent Profile */}
        <div>
          <h3 className="font-['Inter'] uppercase tracking-[0.15em] text-[11px] font-semibold mb-6 border-b border-black pb-2">
            Scent Profile
          </h3>
          <ul className="flex flex-col gap-4">
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
                  className="cursor-pointer font-['Inter'] text-[14px]"
                >
                  {scent}
                </label>
              </li>
            ))}
          </ul>
        </div>

        {/* Intensity */}
        <div>
          <h3 className="font-['Inter'] uppercase tracking-[0.15em] text-[11px] font-semibold mb-6 border-b border-black pb-2">
            Intensity
          </h3>
          <ul className="flex flex-col gap-4">
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
                  className="cursor-pointer font-['Inter'] text-[14px]"
                >
                  {intensity}
                </label>
              </li>
            ))}
          </ul>
        </div>

        {/* Price Range */}
        <div>
          <h3 className="font-['Inter'] uppercase tracking-[0.15em] text-[11px] font-semibold mb-6 border-b border-black pb-2">
            Price Range
          </h3>
          <div className="flex items-center gap-2">
            <input
              type="text"
              placeholder="MIN"
              value={minPrice}
              onChange={(e) => setMinPrice(e.target.value)}
              className="w-full border-b border-black bg-transparent text-center font-['Inter'] uppercase tracking-[0.15em] text-[11px] py-2 focus:outline-none"
            />
            <span className="text-black">–</span>
            <input
              type="text"
              placeholder="MAX"
              value={maxPrice}
              onChange={(e) => setMaxPrice(e.target.value)}
              className="w-full border-b border-black bg-transparent text-center font-['Inter'] uppercase tracking-[0.15em] text-[11px] py-2 focus:outline-none"
            />
          </div>
        </div>
      </aside>

      {/* ── Product area ── */}
      <section className="flex-grow flex flex-col">
        {/* Search bar */}
        <div className="border-b border-black p-8 flex items-center bg-white">
          <span className="material-symbols-outlined text-black mr-4">search</span>
          <input
            type="text"
            placeholder="SEARCH COLLECTION..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full bg-transparent border-none focus:outline-none font-['Inter'] uppercase tracking-[0.15em] text-[11px] text-black placeholder:text-[#4c4546]"
          />
        </div>

        {/* Grid */}
        {filtered.length === 0 ? (
          <div className="flex-grow flex items-center justify-center p-16">
            <p className="font-['Inter'] uppercase tracking-[0.15em] text-[11px] text-[#4c4546]">
              No fragrances match your filters.
            </p>
          </div>
        ) : (
          <div
            ref={gridReveal.ref}
            className={`grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-0 transition-[opacity,transform] duration-700 ease-out ${gridReveal.visible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-6"}`}
          >
            {filtered.map((product) => (
              <Link
                key={product.id}
                href={`/products/${product.slug}`}
                className="border-b border-r border-black flex flex-col bg-white group overflow-hidden cursor-pointer"
              >
                {/* Image — full bleed with hover overlay */}
                <div className="relative h-72 bg-[#f0eeee] overflow-hidden">
                  <Image
                    src={product.images[0]}
                    alt={product.name}
                    fill
                    sizes="(max-width: 768px) 100vw, (max-width: 1024px) 50vw, 33vw"
                    className="object-cover grayscale transition-transform duration-500 group-hover:scale-105"
                  />
                  {/* View overlay */}
                  <div className="absolute inset-0 bg-black/0 group-hover:bg-black/30 transition-all duration-300 flex items-center justify-center">
                    <span className="opacity-0 group-hover:opacity-100 transition-opacity duration-300 border border-white text-white text-[11px] uppercase tracking-[0.2em] font-semibold px-6 py-3 translate-y-2 group-hover:translate-y-0 transition-transform duration-300">
                      View
                    </span>
                  </div>
                </div>

                {/* Info bar */}
                <div className="px-5 py-4 flex justify-between items-center bg-white text-black border-t border-black group-hover:bg-black group-hover:text-white transition-colors duration-300">
                  <span className="font-['Inter'] uppercase tracking-[0.12em] text-[11px] font-semibold">
                    {product.name}
                  </span>
                  <span className="font-['Inter'] text-[11px] font-semibold">
                    ${product.price}
                  </span>
                </div>
              </Link>
            ))}
          </div>
        )}
      </section>
    </div>
  );
}
