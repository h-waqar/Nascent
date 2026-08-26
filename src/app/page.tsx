"use client";

import { useState, useEffect } from "react";
import { Nav } from "@/components/ui/Nav";
import { Footer } from "@/components/ui/Footer";
import type { Product } from "@/types/models";
import { useScrollReveal } from "@/hooks/useScrollReveal";
import { HomepageReviews } from "@/components/reviews/HomepageReviews";
import { HeroSection } from "@/components/home/HeroSection";
import { FeaturedProductSection } from "@/components/home/FeaturedProductSection";
import { ScentArchitectureSection } from "@/components/home/ScentArchitectureSection";
import { CuratedSelectionSection } from "@/components/home/CuratedSelectionSection";
import { ScentAnatomySection } from "@/components/home/ScentAnatomySection";

export default function Home() {
  const [products, setProducts] = useState<Product[]>([]);

  useEffect(() => {
    fetch("/api/products?featured=true")
      .then((r) => r.json())
      .then((data) => setProducts(data.products ?? []))
      .catch(() => {});
  }, []);

  const featured = products.slice(0, 3);
  const featured1 = products[0];
  const [featuredRef, featuredVisible] = useScrollReveal<HTMLElement>(0.15);
  const [archRef, archVisible] = useScrollReveal<HTMLElement>(0.15);
  const [gridRef, gridVisible] = useScrollReveal<HTMLElement>(0.15);
  const [anatomyRef, anatomyVisible] = useScrollReveal<HTMLElement>(0.15);

  return (
    <div className="min-h-screen bg-white text-black flex flex-col">
      <Nav />

      <main className="flex-1">
        {/* ── Hero ── */}
        <HeroSection />

        {/* ── Featured fragrance ── */}
        {featured1 && (
          <FeaturedProductSection
            product={featured1}
            sectionRef={featuredRef}
            isVisible={featuredVisible}
          />
        )}

        {/* ── Scent architecture ── */}
        {featured1 && (
          <ScentArchitectureSection
            product={featured1}
            sectionRef={archRef}
            isVisible={archVisible}
          />
        )}

        {/* ── Curated product grid ── */}
        <CuratedSelectionSection
          products={featured}
          sectionRef={gridRef}
          isVisible={gridVisible}
        />

        {/* ── Anatomy of a Scent ── */}
        <ScentAnatomySection
          sectionRef={anatomyRef}
          isVisible={anatomyVisible}
        />

        <HomepageReviews />
      </main>

      <Footer />
    </div>
  );
}
