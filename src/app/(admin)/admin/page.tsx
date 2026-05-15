import { cookies } from "next/headers";
import Link from "next/link";
import type { OrderStatus } from "@/types/models";
import { formatPrice } from "@/lib/currency";
import { AdminPageHeader } from "@/components/admin/AdminPageHeader";
import { StatsCard } from "@/components/admin/StatsCard";
import { StatusBadge } from "@/components/admin/StatusBadge";
import { LowStockBadge } from "@/components/admin/LowStockBadge";

interface StatsData {
  revenue: { allTime: number; thisMonth: number };
  totalOrders: number;
  statusBreakdown: Record<OrderStatus, number>;
  topProducts: { productId: string; name: string; slug: string; unitsSold: number; revenue: number }[];
  lowStock: { id: string; name: string; slug: string; stock: number; categoryId: string | null; collection: string | null }[];
  recentOrders: { id: string; total: number; status: OrderStatus; createdAt: string; shippingAddress: { fullName: string; line1: string; city: string; postalCode: string; country: string; phone: string } }[];
  activeProducts: number;
  collectionsCount: number;
}

async function getStats(): Promise<StatsData> {
  const base = process.env.NEXT_PUBLIC_APP_URL ?? "http://localhost:3000";
  const cookieStore = await cookies();
  const res = await fetch(`${base}/api/admin/stats`, {
    cache: "no-store",
    headers: { cookie: cookieStore.toString() },
  });
  const data = await res.json();
  return data.stats;
}

export default async function AdminDashboardPage() {
  const stats = await getStats();

  return (
    <div className="bg-white min-h-screen">
      <AdminPageHeader title="Dashboard" />
      <div className="px-8 py-8 space-y-12">

        {/* Stats cards row */}
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-4">
          <StatsCard
            label="TOTAL REVENUE"
            value={formatPrice(stats.revenue.allTime)}
            subLabel={`${formatPrice(stats.revenue.thisMonth)} this month`}
          />
          <StatsCard
            label="TOTAL ORDERS"
            value={String(stats.totalOrders)}
            subLabel={`${stats.statusBreakdown.pending} pending`}
          />
          <StatsCard
            label="LOW STOCK ITEMS"
            value={String(stats.lowStock.length)}
            subLabel={`${stats.lowStock.length} items at 5 or fewer units`}
            emphasized={stats.lowStock.length > 0}
          />
          <StatsCard
            label="ACTIVE PRODUCTS"
            value={String(stats.activeProducts)}
            subLabel={`${stats.collectionsCount} collections`}
          />
        </div>

        {/* Low Stock Alerts section */}
        <div>
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-[11px] font-semibold uppercase tracking-[0.15em] text-black">Low Stock Alerts</h2>
            <Link href="/admin/products" className="text-[11px] font-semibold uppercase tracking-[0.1em] text-black hover:underline transition-none">
              VIEW ALL PRODUCTS →
            </Link>
          </div>
          <div className="border border-black">
            {/* Header row */}
            <div className="bg-black text-white h-[44px] px-4 flex items-center text-[11px] font-semibold uppercase tracking-[0.15em]">
              <span className="flex-1">PRODUCT</span>
              <span className="w-[140px]">COLLECTION</span>
              <span className="w-[80px]">STOCK</span>
              <span className="w-[100px] text-right">ACTION</span>
            </div>
            {stats.lowStock.length === 0 ? (
              <div className="px-4 py-3 text-[13px] text-black">All products are well-stocked.</div>
            ) : (
              stats.lowStock.map((row) => (
                <div
                  key={row.id}
                  className="h-[48px] px-4 py-3 border-b border-black text-[13px] hover:bg-black hover:text-white transition-none flex items-center group"
                >
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
                </div>
              ))
            )}
          </div>
        </div>

        {/* Recent Orders table */}
        <div>
          <h2 className="text-[11px] font-semibold uppercase tracking-[0.15em] text-black mb-4">Recent Orders</h2>
          <div className="border border-black">
            {/* Header row */}
            <div className="bg-black text-white h-[44px] px-4 flex items-center text-[11px] font-semibold uppercase tracking-[0.15em]">
              <span className="w-[120px]">ORDER ID</span>
              <span className="w-[140px]">DATE</span>
              <span className="flex-1">CUSTOMER</span>
              <span className="w-[100px] text-right">TOTAL</span>
              <span className="w-[140px]">STATUS</span>
              <span className="w-[80px] text-right">ACTION</span>
            </div>
            {stats.recentOrders.length === 0 ? (
              <div className="px-4 py-3 text-[13px] text-black">No orders yet.</div>
            ) : (
              stats.recentOrders.map((o) => (
                <div
                  key={o.id}
                  className="h-[48px] px-4 py-3 border-b border-black text-[13px] hover:bg-black hover:text-white transition-none flex items-center"
                >
                  <span className="w-[120px] font-semibold">#{o.id.slice(-4).toUpperCase()}</span>
                  <span className="w-[140px]">
                    {new Date(o.createdAt).toLocaleDateString("en-GB", { day: "2-digit", month: "short", year: "numeric" })}
                  </span>
                  <span className="flex-1">{o.shippingAddress.fullName}</span>
                  <span className="w-[100px] text-right">{formatPrice(o.total)}</span>
                  <span className="w-[140px]">
                    <StatusBadge status={o.status} />
                  </span>
                  <span className="w-[80px] text-right">
                    <Link
                      href={`/admin/orders/${o.id}`}
                      className="text-[11px] font-semibold uppercase tracking-[0.1em] hover:underline transition-none"
                    >
                      VIEW
                    </Link>
                  </span>
                </div>
              ))
            )}
          </div>
        </div>

        {/* Top Products list */}
        <div>
          <h2 className="text-[11px] font-semibold uppercase tracking-[0.15em] text-black mb-4">Top Products</h2>
          <div className="border border-black">
            {/* Header row */}
            <div className="bg-black text-white h-[44px] px-4 flex items-center text-[11px] font-semibold uppercase tracking-[0.15em]">
              <span className="flex-1">PRODUCT NAME</span>
              <span className="w-[120px] text-right">UNITS SOLD</span>
              <span className="w-[120px] text-right">REVENUE</span>
            </div>
            {stats.topProducts.length === 0 ? (
              <div className="px-4 py-3 text-[13px] text-black">No sales data yet.</div>
            ) : (
              stats.topProducts.map((p) => (
                <div
                  key={p.productId}
                  className="h-[48px] px-4 py-3 border-b border-black text-[13px] hover:bg-black hover:text-white transition-none flex items-center"
                >
                  <span className="flex-1 font-semibold">{p.name}</span>
                  <span className="w-[120px] text-right">{p.unitsSold}</span>
                  <span className="w-[120px] text-right">{formatPrice(p.revenue)}</span>
                </div>
              ))
            )}
          </div>
        </div>

      </div>
    </div>
  );
}
