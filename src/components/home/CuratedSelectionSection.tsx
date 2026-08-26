import React from "react";
import Link from "next/link";
import type { Product } from "@/types/models";
import { ProductCard } from "@/components/product/ProductCard";

export interface CuratedSelectionSectionProps {
  products: Product[];
  sectionRef?: (node: HTMLElement | null) => void;
  isVisible?: boolean;
}

export function CuratedSelectionSection({
  products,
  sectionRef,
  isVisible = true,
}: CuratedSelectionSectionProps) {
  return (
    <section
      ref={sectionRef}
      className={`py-32 px-16 border-b border-black transition-[opacity,transform] duration-700 ease-out ${
        isVisible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-6"
      }`}
      id="collections"
    >
      <div className="max-w-[1440px] mx-auto">
        <h3 className="text-[40px] leading-[1.1] tracking-[-0.02em] font-normal text-black uppercase mb-16 text-center">
          Curated Selection
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-0 border-t border-l border-black">
          {products.map((product) => (
            <ProductCard key={product.id} product={product} />
          ))}
        </div>
        <div className="mt-16 flex justify-center">
          <Link
            href="/collections"
            className="border border-black bg-white text-black font-['Inter'] uppercase tracking-[0.15em] text-[11px] font-semibold px-12 py-4 hover:bg-black hover:text-white transition-none"
          >
            View All
          </Link>
        </div>
      </div>
    </section>
  );
}
