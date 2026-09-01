import { auth, clerkClient } from "@clerk/nextjs/server";
import { redirect } from "next/navigation";
import Link from "next/link";
import { formatPrice } from "@/lib/currency";
import { AdminPageHeader } from "@/components/admin/AdminPageHeader";
import { StatsCard } from "@/components/admin/StatsCard";
import { StatusBadge } from "@/components/admin/StatusBadge";
import { LowStockAlertsTable } from "@/components/admin/LowStockAlertsTable";
import { AdminTable, AdminTableHeader, AdminTableRow } from "@/components/admin/AdminTable";
import { getAdminStats } from "@/lib/adminStats";
import type { Roles } from "@/types/globals";

export default async function AdminDashboardPage() {
  const { userId, sessionClaims } = await auth();
  if (!userId) {
    redirect("/sign-in?redirect_url=/admin");
  }

  let role = sessionClaims?.metadata?.role;
  if (!role) {
    try {
      const client = await clerkClient();
      const user = await client.users.getUser(userId);
      role = (user.publicMetadata as { role?: Roles })?.role;
    } catch (e) {
      console.error("Failed to verify admin status:", e);
    }
  }

  if (role !== "admin") {
    redirect("/");
  }

  const stats = await getAdminStats();

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
            <h2 className="text-[11px] font-semibold uppercase tracking-[0.15em] text-black">
              Low Stock Alerts
            </h2>
            <Link
              href="/admin/products"
              className="text-[11px] font-semibold uppercase tracking-[0.1em] text-black hover:underline transition-none"
            >
              VIEW ALL PRODUCTS →
            </Link>
          </div>
          <LowStockAlertsTable lowStock={stats.lowStock} />
        </div>

        {/* Recent Orders table */}
        <div>
          <h2 className="text-[11px] font-semibold uppercase tracking-[0.15em] text-black mb-4">
            Recent Orders
          </h2>
          <AdminTable>
            <AdminTableHeader>
              <span className="w-[120px]">ORDER ID</span>
              <span className="w-[140px]">DATE</span>
              <span className="flex-1">CUSTOMER</span>
              <span className="w-[100px] text-right">TOTAL</span>
              <span className="w-[140px]">STATUS</span>
              <span className="w-[80px] text-right">ACTION</span>
            </AdminTableHeader>
            {stats.recentOrders.length === 0 ? (
              <div className="px-4 py-3 text-[13px] text-black">No orders yet.</div>
            ) : (
              stats.recentOrders.map((o) => (
                <AdminTableRow key={o.id}>
                  <span className="w-[120px] font-semibold">#{o.id.slice(-4).toUpperCase()}</span>
                  <span className="w-[140px]">
                    {new Date(o.createdAt).toLocaleDateString("en-GB", {
                      day: "2-digit",
                      month: "short",
                      year: "numeric",
                    })}
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
                </AdminTableRow>
              ))
            )}
          </AdminTable>
        </div>

        {/* Top Products list */}
        <div>
          <h2 className="text-[11px] font-semibold uppercase tracking-[0.15em] text-black mb-4">
            Top Products
          </h2>
          <AdminTable>
            <AdminTableHeader>
              <span className="flex-1">PRODUCT NAME</span>
              <span className="w-[120px] text-right">UNITS SOLD</span>
              <span className="w-[120px] text-right">REVENUE</span>
            </AdminTableHeader>
            {stats.topProducts.length === 0 ? (
              <div className="px-4 py-3 text-[13px] text-black">No sales data yet.</div>
            ) : (
              stats.topProducts.map((p) => (
                <AdminTableRow key={p.productId}>
                  <span className="flex-1 font-semibold">{p.name}</span>
                  <span className="w-[120px] text-right">{p.unitsSold}</span>
                  <span className="w-[120px] text-right">{formatPrice(p.revenue)}</span>
                </AdminTableRow>
              ))
            )}
          </AdminTable>
        </div>
      </div>
    </div>
  );
}
