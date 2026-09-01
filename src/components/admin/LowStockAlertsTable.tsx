"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import { AdminTable, AdminTableHeader, AdminTableRow } from "@/components/admin/AdminTable";
import { LowStockBadge } from "@/components/admin/LowStockBadge";
import { Pagination } from "@/components/ui/Pagination";

export interface LowStockItem {
  id: string;
  name: string;
  slug: string;
  stock: number;
  categoryId: string | null;
  collection: string | null;
}

interface LowStockAlertsTableProps {
  lowStock: LowStockItem[];
  pageSize?: number;
}

export function LowStockAlertsTable({
  lowStock,
  pageSize = 5,
}: LowStockAlertsTableProps) {
  const [page, setPage] = useState(1);

  const pageCount = Math.max(1, Math.ceil(lowStock.length / pageSize));
  const currentPage = Math.min(page, pageCount);

  const paginatedItems = useMemo(() => {
    const start = (currentPage - 1) * pageSize;
    return lowStock.slice(start, start + pageSize);
  }, [lowStock, currentPage, pageSize]);

  return (
    <div className="space-y-4">
      <AdminTable>
        <AdminTableHeader>
          <span className="flex-1">PRODUCT</span>
          <span className="w-[140px]">COLLECTION</span>
          <span className="w-[80px]">STOCK</span>
          <span className="w-[100px] text-right">ACTION</span>
        </AdminTableHeader>
        {lowStock.length === 0 ? (
          <div className="px-4 py-3 text-[13px] text-black">All products are well-stocked.</div>
        ) : (
          paginatedItems.map((row) => (
            <AdminTableRow key={row.id}>
              <span className="flex-1 font-semibold">{row.name}</span>
              <span className="w-[140px]">{row.collection ?? "—"}</span>
              <span className="w-[80px]">
                <LowStockBadge stock={row.stock} />
              </span>
              <span className="w-[100px] text-right">
                <Link
                  href={`/admin/products/${row.id}/edit`}
                  className="text-[11px] font-semibold uppercase tracking-[0.1em] hover:underline transition-none"
                >
                  EDIT →
                </Link>
              </span>
            </AdminTableRow>
          ))
        )}
      </AdminTable>

      {lowStock.length > pageSize && (
        <Pagination
          page={currentPage}
          pageCount={pageCount}
          totalItems={lowStock.length}
          itemName="low stock item"
          onPageChange={setPage}
        />
      )}
    </div>
  );
}
