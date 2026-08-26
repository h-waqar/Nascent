import React from "react";
import { ProductCard } from "./ProductCard";
import type { Product } from "@/types/models";

export interface ProductGridProps {
  products?: Product[];
  children?: React.ReactNode;
  cols?: 2 | 3 | 4;
  className?: string;
  gridRef?: React.Ref<HTMLDivElement>;
  isVisible?: boolean;
}

export function ProductGrid({
  products,
  children,
  cols = 3,
  className = "",
  gridRef,
  isVisible = true,
}: ProductGridProps) {
  const colClass =
    cols === 2
      ? "grid-cols-1 sm:grid-cols-2"
      : cols === 4
      ? "grid-cols-1 sm:grid-cols-2 lg:grid-cols-4"
      : "grid-cols-1 sm:grid-cols-2 lg:grid-cols-3";

  return (
    <div
      ref={gridRef}
      className={`grid ${colClass} gap-0 border-t border-l border-black transition-[opacity,transform] duration-700 ease-out ${
        isVisible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-6"
      } ${className}`}
    >
      {products
        ? products.map((product) => <ProductCard key={product.id} product={product} />)
        : children}
    </div>
  );
}
