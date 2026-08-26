import React from "react";
import Image from "next/image";
import type { Product } from "@/types/models";
import { OlfactoryProfile } from "@/components/product/OlfactoryProfile";

export interface ScentArchitectureSectionProps {
  product: Product;
  sectionRef?: (node: HTMLElement | null) => void;
  isVisible?: boolean;
}

export function ScentArchitectureSection({
  product,
  sectionRef,
  isVisible = true,
}: ScentArchitectureSectionProps) {
  return (
    <section
      ref={sectionRef}
      className={`py-32 px-16 border-b border-black transition-[opacity,transform] duration-700 ease-out ${
        isVisible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-6"
      }`}
    >
      <div className="max-w-[1440px] mx-auto grid grid-cols-1 md:grid-cols-12 gap-6">
        <div className="md:col-span-4 flex flex-col justify-center gap-8 pr-8 border-r border-black">
          <h3 className="text-[24px] leading-[1.2] tracking-[0.05em] font-medium text-black uppercase">
            Scent Architecture
          </h3>
          <OlfactoryProfile
            topNote={product.topNote}
            heartNote={product.heartNote}
            baseNote={product.baseNote}
            variant="table"
          />
        </div>
        <div className="md:col-span-8 h-[500px] border border-black p-4 relative overflow-hidden">
          <Image
            src="https://images.unsplash.com/photo-1587017539504-67cfbddac569?auto=format&fit=crop&q=80&w=2000"
            alt="Scent notes"
            fill
            sizes="(max-width: 768px) 100vw, 67vw"
            className="object-cover grayscale"
          />
        </div>
      </div>
    </section>
  );
}
