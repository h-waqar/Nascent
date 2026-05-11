"use client";

import { useState, useMemo } from "react";
import Link from "next/link";
import Image from "next/image";
import { PRODUCTS } from "@/components/dummy-data";

const SCENT_PROFILES = ["Floral", "Woody", "Oriental", "Fresh"];
const INTENSITIES = ["Subtle", "Moderate", "Intense"];

export default function CollectionsPage() {
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
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-0">
            {filtered.map((product) => (
              <div
                key={product.id}
                className="border-b border-r border-black flex flex-col bg-white group"
              >
                {/* Image */}
                <div className="aspect-[3/4] w-full overflow-hidden p-8 flex items-center justify-center bg-[#f9f9f9] border-b border-black relative">
                  <Image
                    src={product.images[0]}
                    alt={product.name}
                    fill
                    className="object-contain grayscale p-8"
                  />
                </div>

                {/* Info */}
                <div className="p-6 flex flex-col justify-between flex-grow">
                  <div>
                    <h4 className="text-[24px] leading-[1.2] tracking-[0.05em] font-medium mb-2">
                      {product.name}
                    </h4>
                    <p className="font-['Inter'] text-[14px] text-[#4c4546] mb-4">
                      {product.scentNotes.join(" / ")}
                    </p>
                  </div>
                  <div className="flex justify-between items-center mt-auto">
                    <span className="font-['Inter'] uppercase tracking-[0.15em] text-[11px] font-semibold">
                      ${product.price}
                    </span>
                    <Link
                      href={`/products/${product.slug}`}
                      className="border border-black px-4 py-2 font-['Inter'] uppercase tracking-[0.15em] text-[11px] font-semibold hover:bg-black hover:text-white transition-none"
                    >
                      View
                    </Link>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </section>
    </div>
  );
}
