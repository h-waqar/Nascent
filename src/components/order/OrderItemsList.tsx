import React from "react";
import Image from "next/image";
import type { OrderItem } from "@/types/models";
import { formatPrice } from "@/lib/currency";

export interface OrderItemsListProps {
  items: OrderItem[];
  variant?: "summary" | "simple";
  className?: string;
}

export function OrderItemsList({
  items,
  variant = "summary",
  className = "",
}: OrderItemsListProps) {
  if (variant === "simple") {
    return (
      <div className={`space-y-4 ${className}`}>
        {items.map((item) => (
          <div key={item.productId} className="flex justify-between border-b border-[#e0e0e0] pb-4">
            <div>
              <p className="text-[13px] uppercase tracking-[0.05em] font-medium text-black">
                {item.name}
              </p>
              <p className="text-[11px] text-[#4c4546] mt-0.5">Qty: {item.quantity}</p>
            </div>
            <p className="text-[13px] font-semibold text-black">
              {formatPrice(item.price * item.quantity)}
            </p>
          </div>
        ))}
      </div>
    );
  }

  return (
    <div className={`space-y-6 ${className}`}>
      {items.map((item) => (
        <div key={item.productId} className="flex gap-4">
          <div className="relative w-16 h-20 flex-shrink-0 border border-black overflow-hidden bg-white">
            {item.image ? (
              <Image
                src={item.image}
                alt={item.name}
                fill
                sizes="64px"
                className="object-cover grayscale"
              />
            ) : (
              <div className="w-full h-full bg-[#e8e0e1]" />
            )}
            <span className="absolute -top-2 -right-2 w-5 h-5 bg-black text-white text-[10px] flex items-center justify-center font-semibold">
              {item.quantity}
            </span>
          </div>
          <div className="flex-1 flex flex-col justify-center">
            <p className="text-[13px] uppercase tracking-[0.05em] font-medium text-black">
              {item.name}
            </p>
            <p className="text-[11px] text-[#4c4546] mt-1">50ml Extrait de Parfum</p>
          </div>
          <p className="text-[13px] font-semibold text-black self-center">
            {formatPrice(item.price * item.quantity)}
          </p>
        </div>
      ))}
    </div>
  );
}
