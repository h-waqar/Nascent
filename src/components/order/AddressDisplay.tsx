import React from "react";
import type { ShippingAddress } from "@/types/models";

export interface AddressDisplayProps {
  address: ShippingAddress;
  title?: string;
  className?: string;
  bordered?: boolean;
}

export function AddressDisplay({
  address,
  title,
  className = "",
  bordered = false,
}: AddressDisplayProps) {
  const content = (
    <div className="text-[13px] text-black leading-[1.8]">
      <p className="font-semibold">{address.fullName}</p>
      {address.phone && <p>{address.phone}</p>}
      <p>{address.line1}</p>
      {address.line2 && <p>{address.line2}</p>}
      <p>
        {address.city}{address.postalCode ? `, ${address.postalCode}` : ""}
      </p>
      {address.country && <p>{address.country}</p>}
    </div>
  );

  if (title || bordered) {
    return (
      <div className={`${bordered ? "border border-black p-6" : ""} ${className}`}>
        {title && (
          <h3 className="text-[11px] font-semibold uppercase tracking-[0.2em] text-black mb-4">
            {title}
          </h3>
        )}
        {content}
      </div>
    );
  }

  return <div className={className}>{content}</div>;
}
