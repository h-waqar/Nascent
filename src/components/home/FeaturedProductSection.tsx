import React from "react";
import Link from "next/link";
import Image from "next/image";
import type { Product } from "@/types/models";

export interface FeaturedProductSectionProps {
  product: Product;
  sectionRef?: (node: HTMLElement | null) => void;
  isVisible?: boolean;
}

export function FeaturedProductSection({
  product,
  sectionRef,
  isVisible = true,
}: FeaturedProductSectionProps) {
  const imageUrl = product.images?.[0];

  return (
    <section
      ref={sectionRef}
      className={`py-32 px-16 border-b border-black transition-[opacity,transform] duration-700 ease-out ${
        isVisible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-6"
      }`}
    >
      <div className="max-w-[1440px] mx-auto grid grid-cols-1 md:grid-cols-12 gap-6 items-center">
        <div className="md:col-span-6 border border-black p-4 h-[600px] relative overflow-hidden">
          {imageUrl && (
            <Image
              src={imageUrl}
              alt={product.name}
              fill
              sizes="(max-width: 768px) 100vw, 50vw"
              className="object-cover grayscale"
            />
          )}
        </div>
        <div className="md:col-span-5 md:col-start-8 flex flex-col gap-8">
          {product.collection && (
            <p className="font-['Inter'] uppercase tracking-[0.2em] text-[11px] text-black">
              {product.collection}
            </p>
          )}
          <h2 className="text-[40px] leading-[1.1] tracking-[-0.02em] font-normal text-black uppercase">
            {product.name}
          </h2>
          <p className="text-[18px] leading-[1.6] text-black">{product.description}</p>
          <Link
            href={`/products/${product.slug}`}
            className="self-start border border-black bg-white text-black font-['Inter'] uppercase tracking-[0.15em] text-[11px] font-semibold px-8 py-4 hover:bg-black hover:text-white transition-none"
          >
            Discover
          </Link>
        </div>
      </div>
    </section>
  );
}
