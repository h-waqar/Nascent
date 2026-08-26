import React from "react";

export interface AdminTableProps {
  children: React.ReactNode;
  className?: string;
}

export function AdminTable({ children, className = "" }: AdminTableProps) {
  return (
    <div className={`border border-black bg-white overflow-hidden ${className}`}>
      {children}
    </div>
  );
}

export interface AdminTableHeaderProps {
  children: React.ReactNode;
  className?: string;
}

export function AdminTableHeader({ children, className = "" }: AdminTableHeaderProps) {
  return (
    <div
      className={`bg-black text-white h-[44px] px-4 flex items-center text-[11px] font-semibold uppercase tracking-[0.15em] ${className}`}
    >
      {children}
    </div>
  );
}

export interface AdminTableRowProps {
  children: React.ReactNode;
  className?: string;
  onClick?: () => void;
  height?: string;
}

export function AdminTableRow({
  children,
  className = "",
  onClick,
  height = "h-[48px]",
}: AdminTableRowProps) {
  return (
    <div
      onClick={onClick}
      className={`${height} px-4 border-b border-black text-[13px] hover:bg-black hover:text-white transition-none flex items-center ${
        onClick ? "cursor-pointer" : ""
      } ${className}`}
    >
      {children}
    </div>
  );
}
