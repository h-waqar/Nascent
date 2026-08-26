import React from "react";
import Link from "next/link";

export interface EmptyStateProps {
  message: string;
  description?: string;
  actionHref?: string;
  actionLabel?: string;
  className?: string;
}

export function EmptyState({
  message,
  description,
  actionHref,
  actionLabel,
  className = "",
}: EmptyStateProps) {
  return (
    <div
      className={`flex flex-col items-center justify-center p-12 text-center bg-white ${className}`}
    >
      <p className="font-['Inter'] uppercase tracking-[0.15em] text-[11px] text-[#4c4546]">
        {message}
      </p>
      {description && (
        <p className="font-['Inter'] text-[13px] text-black mt-2 max-w-[400px]">
          {description}
        </p>
      )}
      {actionHref && actionLabel && (
        <Link
          href={actionHref}
          className="mt-6 border border-black bg-black text-white py-3 px-8 text-[11px] uppercase tracking-[0.15em] font-semibold hover:bg-white hover:text-black transition-none"
        >
          {actionLabel}
        </Link>
      )}
    </div>
  );
}
