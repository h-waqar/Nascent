"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { LayoutDashboard, MessageSquareText, Package, ShoppingBag, Settings } from "lucide-react";
import { cn } from "@/lib/utils";

const ADMIN_LINKS = [
  { href: "/admin", label: "Dashboard", Icon: LayoutDashboard, exact: true },
  { href: "/admin/products", label: "Products", Icon: Package, exact: false },
  { href: "/admin/orders", label: "Orders", Icon: ShoppingBag, exact: false },
  { href: "/admin/reviews", label: "Reviews", Icon: MessageSquareText, exact: false },
  { href: "/admin/settings", label: "Settings", Icon: Settings, exact: false },
] as const;

export function AdminSidebar() {
  const pathname = usePathname();
  return (
    <aside className="fixed top-0 left-0 h-full w-[240px] bg-black text-white flex flex-col border-r border-black z-50">
      <div className="h-[56px] flex items-center px-6 border-b border-white/20">
        <span className="text-[13px] font-semibold tracking-tight uppercase">NASCENT — ADMIN</span>
      </div>
      <nav className="flex flex-col">
        {ADMIN_LINKS.map(({ href, label, Icon, exact }) => {
          const active = exact ? pathname === href : pathname.startsWith(href);
          return (
            <Link
              key={href}
              href={href}
              className={cn(
                "h-[44px] px-6 flex items-center gap-3 text-[11px] font-semibold uppercase tracking-[0.15em] transition-none",
                active ? "bg-white text-black border-l-[3px] border-white" : "text-white hover:bg-white hover:text-black"
              )}
            >
              <Icon className="w-5 h-5" />
              {label}
            </Link>
          );
        })}
      </nav>
    </aside>
  );
}
