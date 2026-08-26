import React from "react";
import Link from "next/link";
import Image from "next/image";
import type { Product } from "@/types/models";
import { formatPrice } from "@/lib/currency";

export interface ProductCardProps {
  product: Product;
  badge?: string;
  priority?: boolean;
  className?: string;
}

export function ProductCard({
  product,
  badge,
  priority = false,
  className = "",
}: ProductCardProps) {
  const imageUrl = product.images?.[0];

  return (
    <Link
      href={`/products/${product.slug}`}
      className={`border-b border-r border-black flex flex-col bg-white group overflow-hidden cursor-pointer ${className}`}
    >
      {/* Image area — full bleed with hover VIEW overlay */}
      <div className="relative h-72 bg-[#f0eeee] overflow-hidden">
        {imageUrl ? (
          <Image
            src={imageUrl}
            alt={product.name}
            fill
            priority={priority}
            sizes="(max-width: 768px) 100vw, (max-width: 1024px) 50vw, 33vw"
            className="object-cover grayscale transition-[filter] duration-300 ease-out group-hover:grayscale-0"
          />
        ) : null}

        {/* Optional Badge (e.g. 85% Match for Scent Finder) */}
        {badge && (
          <div className="absolute top-3 left-3 bg-black text-white text-[9px] uppercase tracking-wider px-2 py-1 font-['Inter'] font-semibold z-10">
            {badge}
          </div>
        )}

        {/* View overlay */}
        <div className="absolute inset-0 bg-black/0 group-hover:bg-black/30 transition-[background-color] duration-300 flex items-center justify-center">
          <span className="opacity-0 group-hover:opacity-100 transition-opacity duration-300 border border-white text-white text-[11px] uppercase tracking-[0.2em] font-semibold px-6 py-3 translate-y-2 group-hover:translate-y-0 transition-transform duration-300">
            View
          </span>
        </div>
      </div>

      {/* Info bar */}
      <div className="px-5 py-4 flex flex-col gap-1.5 bg-white text-black border-t border-black group-hover:bg-black group-hover:text-white transition-colors duration-300">
        <div className="flex justify-between items-center">
          <span className="font-['Inter'] uppercase tracking-[0.12em] text-[11px] font-semibold truncate pr-2">
            {product.name}
          </span>
          <span className="font-['Inter'] text-[11px] font-semibold shrink-0">
            {formatPrice(product.price)}
          </span>
        </div>
        <div className="flex items-center justify-between font-['Inter'] text-[10px] uppercase tracking-wider text-[#4c4546] group-hover:text-neutral-300 transition-colors duration-300">
          <div className="flex items-center gap-1.5">
            <span className="text-[11px] leading-none text-black group-hover:text-white">
              {"★".repeat(Math.min(5, Math.max(1, Math.round(product.rating ?? 5))))}
              {"☆".repeat(5 - Math.min(5, Math.max(1, Math.round(product.rating ?? 5))))}
            </span>
            <span className="font-semibold">{typeof product.rating === "number" ? product.rating.toFixed(1) : "5.0"}</span>
          </div>
          {typeof product.ratingCount === "number" && product.ratingCount > 0 ? (
            <span>({product.ratingCount})</span>
          ) : (
            <span className="text-[9px] opacity-70">New</span>
          )}
        </div>
      </div>
    </Link>
  );
}
