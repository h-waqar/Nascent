"use client";

import Image from "next/image";
import Link from "next/link";
import { useState, useEffect, useMemo } from "react";
import { useScrollReveal } from "@/hooks/useScrollReveal";
import { useCartStore } from "@/lib/cart";
import { formatPrice } from "@/lib/currency";
import type { Product } from "@/types/models";
import { ProductCard } from "@/components/product/ProductCard";
import { OlfactoryProfile } from "@/components/product/OlfactoryProfile";
import { LoadingState } from "@/components/ui/LoadingState";

const INTENSITY_TIERS = ["Light", "Moderate", "Strong", "Intense"] as const;

export default function ScentFinderPage() {
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);

  // Calibrated state (starts false until user touches any slider)
  const [calibrated, setCalibrated] = useState(false);

  // Slider States
  const [woody, setWoody] = useState(50);
  const [floral, setFloral] = useState(50);
  const [oriental, setOriental] = useState(50);
  const [fresh, setFresh] = useState(50);
  const [intensityVal, setIntensityVal] = useState(1); // Mapped: 0=Light, 1=Moderate, 2=Strong, 3=Intense

  const [gridRef, gridVisible] = useScrollReveal(0.15);
  const { addItem, openCart } = useCartStore();

  useEffect(() => {
    fetch("/api/products")
      .then((r) => r.json())
      .then((data) => {
        setProducts(data.products ?? []);
        setLoading(false);
      })
      .catch(() => setLoading(false));
  }, []);

  // Proximity calculations
  const matches = useMemo(() => {
    if (!calibrated || products.length === 0) return [];

    const intensityMap: Record<string, number> = {
      Subtle: 0,
      Light: 0,
      Moderate: 1,
      Strong: 2,
      Intense: 3,
    };

    const userWeights = { woody, floral, oriental, fresh };

    return products
      .map((product) => {
        // 1. Intensity Match (30% weight)
        const prodIntensityVal = intensityMap[product.intensity ?? "Moderate"] ?? 1;
        const intensityScore = 1 - Math.abs(intensityVal - prodIntensityVal) / 3;

        // 2. Scent Family Weighted Match (70% weight)
        let sumUserWeights = 0;
        let matchedUserWeights = 0;

        const families = [
          { key: "woody", name: "Woody" },
          { key: "floral", name: "Floral" },
          { key: "oriental", name: "Oriental" },
          { key: "fresh", name: "Fresh" },
        ] as const;

        families.forEach((fam) => {
          const userWeight = userWeights[fam.key];
          sumUserWeights += userWeight;
          const hasNote = product.scentNotes.some(
            (note) => note.toLowerCase() === fam.name.toLowerCase()
          );
          if (hasNote) {
            matchedUserWeights += userWeight;
          }
        });

        const familyScore = sumUserWeights > 0 ? matchedUserWeights / sumUserWeights : 0.5;

        // 3. Combined Score
        const scoreVal = familyScore * 0.7 + intensityScore * 0.3;
        const matchPercentage = Math.round(scoreVal * 100);

        return {
          product,
          score: matchPercentage,
        };
      })
      .sort((a, b) => b.score - a.score || a.product.name.localeCompare(b.product.name));
  }, [calibrated, products, woody, floral, oriental, fresh, intensityVal]);

  const bestMatch = matches[0];
  const secondaryMatches = matches.slice(1).filter((m) => m.score >= 10);

  function handleAddToCart(product: Product) {
    addItem({
      productId: product.id,
      slug: product.slug,
      name: product.name,
      price: product.price,
      image: product.images[0],
    });
    openCart();
  }

  function handleSliderChange(setter: (v: number) => void) {
    return (e: React.ChangeEvent<HTMLInputElement>) => {
      setter(Number(e.target.value));
      if (!calibrated) setCalibrated(true);
    };
  }

  if (loading) {
    return (
      <LoadingState
        message="Initializing Diagnostic Systems..."
        minHeight="min-h-[calc(100vh-80px)]"
      />
    );
  }

  return (
    <div className="max-w-[1440px] mx-auto border-x border-b border-black bg-white min-h-screen flex flex-col">
      {/* ── Page Header ── */}
      <div className="border-b border-black py-12 px-6 md:px-12 text-center bg-white">
        <h1 className="text-[44px] sm:text-[64px] leading-none tracking-[-0.04em] font-light uppercase text-black">
          Olfactory Registry
        </h1>
        <p className="font-['Inter'] uppercase tracking-[0.2em] text-[11px] text-[#4c4546] mt-4">
          Diagnostic molecular matching & scent discovery
        </p>
      </div>

      {/* ── Main Panel ── */}
      <div className="flex-1 grid grid-cols-1 lg:grid-cols-12 gap-0">
        {/* Left Column: Diagnostic Controls (span 4) */}
        <aside className="lg:col-span-4 border-b lg:border-b-0 lg:border-r border-black p-8 md:p-12 flex flex-col gap-10 bg-white">
          <div>
            <h3 className="font-['Inter'] uppercase tracking-[0.15em] text-[11px] font-bold text-black border-b border-black pb-2 mb-6">
              Calibration Panel
            </h3>
            <p className="font-['Inter'] text-[12px] text-[#4c4546] leading-relaxed">
              Adjust the molecular weights and formulation parameters. The system will dynamically
              compute matching profiles in real-time.
            </p>
          </div>

          {/* Scent Family Sliders */}
          <div className="space-y-8">
            <h4 className="font-['Inter'] uppercase tracking-[0.12em] text-[10px] font-semibold text-black mb-4">
              Scent Family Weightings
            </h4>

            {[
              { label: "Woody", value: woody, setter: setWoody },
              { label: "Floral", value: floral, setter: setFloral },
              { label: "Oriental", value: oriental, setter: setOriental },
              { label: "Fresh", value: fresh, setter: setFresh },
            ].map(({ label, value, setter }) => (
              <div key={label} className="space-y-2">
                <div className="flex justify-between font-['Inter'] text-[11px] uppercase tracking-wider text-black">
                  <span>{label}</span>
                  <span className="font-bold">{value}%</span>
                </div>
                <input
                  type="range"
                  min="0"
                  max="100"
                  value={value}
                  onChange={handleSliderChange(setter)}
                  className="w-full appearance-none bg-neutral-200 h-[1px] cursor-pointer outline-none [&::-webkit-slider-thumb]:appearance-none [&::-webkit-slider-thumb]:w-[1px] [&::-webkit-slider-thumb]:h-[20px] [&::-webkit-slider-thumb]:bg-black [&::-moz-range-thumb]:w-[1px] [&::-moz-range-thumb]:h-[20px] [&::-moz-range-thumb]:bg-black [&::-moz-range-thumb]:border-0"
                />
              </div>
            ))}
          </div>

          {/* Intensity Slider */}
          <div className="space-y-4">
            <h4 className="font-['Inter'] uppercase tracking-[0.12em] text-[10px] font-semibold text-black mb-4">
              Intensity Tier
            </h4>
            <div className="space-y-2">
              <div className="flex justify-between font-['Inter'] text-[11px] uppercase tracking-wider text-black">
                <span>Concentration</span>
                <span className="font-bold">{INTENSITY_TIERS[intensityVal]}</span>
              </div>
              <input
                type="range"
                min="0"
                max="3"
                step="1"
                value={intensityVal}
                onChange={handleSliderChange(setIntensityVal)}
                className="w-full appearance-none bg-neutral-200 h-[1px] cursor-pointer outline-none [&::-webkit-slider-thumb]:appearance-none [&::-webkit-slider-thumb]:w-[1px] [&::-webkit-slider-thumb]:h-[20px] [&::-webkit-slider-thumb]:bg-black [&::-moz-range-thumb]:w-[1px] [&::-moz-range-thumb]:h-[20px] [&::-moz-range-thumb]:bg-black [&::-moz-range-thumb]:border-0"
              />
              <div className="flex justify-between text-[9px] font-['Inter'] uppercase tracking-wider text-[#4c4546] pt-1">
                <span>Light</span>
                <span>Moderate</span>
                <span>Strong</span>
                <span>Intense</span>
              </div>
            </div>
          </div>
        </aside>

        {/* Right Column: Dynamic Results (span 8) */}
        <main className="lg:col-span-8 bg-[#f9f9f9] flex flex-col">
          {!calibrated ? (
            /* Uncalibrated Empty State */
            <div className="flex-1 flex flex-col justify-center items-center p-12 text-center bg-white min-h-[500px]">
              <div className="max-w-[400px] flex flex-col items-center gap-8">
                <div className="relative w-64 h-64 border border-black p-2 bg-[#f9f9f9] overflow-hidden">
                  <Image
                    src="/images/scent_finder_hero.png"
                    alt="Clinical laboratory glass apparatus"
                    fill
                    sizes="256px"
                    className="object-cover grayscale"
                  />
                </div>
                <div>
                  <h3 className="font-['Inter'] uppercase tracking-[0.15em] text-[11px] font-bold text-black mb-3">
                    System Uncalibrated
                  </h3>
                  <p className="font-['Inter'] text-[12px] text-[#4c4546] leading-relaxed">
                    Adjust the dial weightings on the Calibration Panel to begin matching olfactory
                    compositions.
                  </p>
                </div>
              </div>
            </div>
          ) : matches.length === 0 ? (
            /* Calibrated but no match state */
            <div className="flex-grow flex items-center justify-center p-12 bg-white">
              <p className="font-['Inter'] uppercase tracking-[0.15em] text-[11px] text-[#4c4546]">
                No proximity matches above threshold.
              </p>
            </div>
          ) : (
            /* Recommendations Display */
            <div className="flex-grow bg-white flex flex-col">
              {/* Spotlight Best Match */}
              {bestMatch && (
                <section className="border-b border-black bg-white">
                  <div className="p-6 border-b border-black bg-black text-white text-center">
                    <p className="font-['Inter'] uppercase tracking-[0.25em] text-[11px] font-bold">
                      Optimal Formulation Match // {bestMatch.score}% Proximity
                    </p>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2">
                    {/* Left: Product Grayscale Image */}
                    <div className="relative h-[300px] md:h-[450px] bg-neutral-100 border-b md:border-b-0 md:border-r border-black overflow-hidden">
                      {bestMatch.product.images[0] && (
                        <Image
                          src={bestMatch.product.images[0]}
                          alt={bestMatch.product.name}
                          fill
                          sizes="(max-width: 768px) 100vw, 50vw"
                          className="object-cover grayscale"
                        />
                      )}
                    </div>

                    {/* Right: Product narrative details */}
                    <div className="p-8 md:p-12 flex flex-col justify-center bg-white">
                      <div>
                        {bestMatch.product.collection && (
                          <p className="font-['Inter'] uppercase tracking-[0.2em] text-[10px] text-[#4c4546] mb-3">
                            {bestMatch.product.collection}
                          </p>
                        )}
                        <h2 className="text-[28px] md:text-[36px] tracking-[-0.03em] leading-none uppercase font-light text-black mb-6">
                          {bestMatch.product.name}
                        </h2>
                        <p className="text-[14px] leading-[1.6] text-black font-['Inter'] font-light mb-8">
                          {bestMatch.product.description}
                        </p>
                      </div>

                      {/* Olfactory profile display */}
                      <OlfactoryProfile
                        topNote={bestMatch.product.topNote}
                        heartNote={bestMatch.product.heartNote}
                        baseNote={bestMatch.product.baseNote}
                        variant="compact"
                        className="mb-8 border-t border-neutral-200 pt-6"
                      />

                      <div className="flex flex-col sm:flex-row gap-3">
                        <button
                          onClick={() => handleAddToCart(bestMatch.product)}
                          className="flex-grow border border-black bg-black text-white py-3.5 px-6 font-['Inter'] uppercase tracking-[0.15em] text-[11px] font-semibold hover:bg-white hover:text-black transition-none"
                        >
                          Acquire // {formatPrice(bestMatch.product.price)}
                        </button>
                        <Link
                          href={`/products/${bestMatch.product.slug}`}
                          className="border border-black bg-white text-black py-3.5 px-6 font-['Inter'] uppercase tracking-[0.15em] text-[11px] font-semibold hover:bg-black hover:text-white transition-none text-center"
                        >
                          Explore Details
                        </Link>
                      </div>
                    </div>
                  </div>
                </section>
              )}

              {/* Secondary Matches Grid */}
              {secondaryMatches.length > 0 && (
                <section
                  ref={gridRef}
                  className={`p-8 md:p-12 transition-[opacity,transform] duration-700 ease-out ${
                    gridVisible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-6"
                  }`}
                >
                  <h3 className="font-['Inter'] uppercase tracking-[0.15em] text-[11px] font-bold text-black border-b border-black pb-2 mb-8">
                    Alternative Proximity Formulations
                  </h3>

                  <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-0 border-t border-l border-black">
                    {secondaryMatches.map(({ product, score }) => (
                      <ProductCard
                        key={product.id}
                        product={product}
                        badge={`${score}% Match`}
                      />
                    ))}
                  </div>
                </section>
              )}
            </div>
          )}
        </main>
      </div>
    </div>
  );
}
