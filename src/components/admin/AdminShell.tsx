"use client";

import type { ReactNode } from "react";
import { AdminSidebar } from "@/components/admin/AdminSidebar";

export function AdminShell({ children }: { children: ReactNode }) {
  return (
    <div className="flex min-h-screen bg-white text-black">
      <AdminSidebar />
      <main className="ml-[240px] flex-1 min-h-screen">{children}</main>
    </div>
  );
}
