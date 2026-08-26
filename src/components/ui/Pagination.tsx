import React from "react";

export interface PaginationProps {
  page: number;
  pageCount: number;
  totalItems: number;
  itemName?: string;
  onPageChange: (newPage: number) => void;
  className?: string;
}

export function Pagination({
  page,
  pageCount,
  totalItems,
  itemName = "item",
  onPageChange,
  className = "",
}: PaginationProps) {
  const isSingle = totalItems === 1;
  const pluralSuffix = isSingle ? "" : "s";

  return (
    <div className={`flex items-center justify-between ${className}`}>
      <span className="text-[11px] uppercase tracking-[0.1em] text-black">
        Page {page} of {Math.max(1, pageCount)} — {totalItems} {itemName}
        {pluralSuffix}
      </span>
      <div className="flex gap-2">
        <button
          type="button"
          onClick={() => onPageChange(Math.max(1, page - 1))}
          disabled={page <= 1}
          className="border border-black bg-white text-black py-2 px-4 text-[11px] font-semibold uppercase tracking-[0.15em] hover:bg-black hover:text-white transition-none disabled:opacity-50 disabled:cursor-not-allowed"
        >
          &larr; Prev
        </button>
        <button
          type="button"
          onClick={() => onPageChange(Math.min(pageCount, page + 1))}
          disabled={page >= pageCount}
          className="border border-black bg-white text-black py-2 px-4 text-[11px] font-semibold uppercase tracking-[0.15em] hover:bg-black hover:text-white transition-none disabled:opacity-50 disabled:cursor-not-allowed"
        >
          Next &rarr;
        </button>
      </div>
    </div>
  );
}
