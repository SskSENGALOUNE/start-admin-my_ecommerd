import { Header } from "@/app/layout/Header";
import { Main } from "@/app/layout/Main";
import {
  BanknoteIcon,
  ClockIcon,
  ShoppingCartIcon,
  UsersRoundIcon,
} from "lucide-react";
import { useDashboardStats } from "../api/queries";
import { LowStockCard } from "../ui/LowStockCard";
import { OrderStatusChart } from "../ui/OrderStatusChart";
import { RecentOrdersTable } from "../ui/RecentOrdersTable";
import { RevenueChart } from "../ui/RevenueChart";
import { StatCard } from "../ui/StatCard";

function calcTrend(today: number, yesterday: number) {
  if (yesterday === 0) return today > 0 ? 100 : 0;
  return ((today - yesterday) / yesterday) * 100;
}

function formatRevenue(v: string) {
  const n = Number(v);
  if (n >= 1_000_000) return `${(n / 1_000_000).toFixed(1)}M ກີບ`;
  if (n >= 1_000) return `${(n / 1_000).toFixed(0)}K ກີບ`;
  return `${n.toLocaleString("lo-LA")} ກີບ`;
}

export function DashboardPage() {
  const stats = useDashboardStats();
  const d = stats.data;
  const isLoading = stats.isLoading;

  const revenueTrend = d
    ? calcTrend(Number(d.today.revenue), Number(d.yesterday.revenue))
    : 0;
  const orderTrend = d
    ? calcTrend(d.today.orderCount, d.yesterday.orderCount)
    : 0;
  const customerTrend = d
    ? calcTrend(d.today.newCustomers, d.yesterday.newCustomers)
    : 0;

  const now = new Date();
  const dateLabel = now.toLocaleDateString("lo-LA", {
    weekday: "long",
    year: "numeric",
    month: "long",
    day: "numeric",
  });

  return (
    <>
      <Header />
      <Main>
        {/* Title */}
        <div className="mb-6">
          <h1 className="text-2xl font-bold tracking-tight">ແຜງຄວບຄຸມ</h1>
          <p className="text-sm text-muted-foreground">{dateLabel}</p>
        </div>

        {/* Stat Cards */}
        <div className="mb-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          <StatCard
            title="ຍອດຂາຍວັນນີ້"
            value={d ? formatRevenue(d.today.revenue) : "—"}
            icon={BanknoteIcon}
            iconColor="text-green-600"
            trend={
              d
                ? { value: revenueTrend, label: "vs ມື້ວານ" }
                : undefined
            }
            isLoading={isLoading}
          />
          <StatCard
            title="ຄຳສັ່ງຊື້ວັນນີ້"
            value={d ? `${d.today.orderCount} ລາຍການ` : "—"}
            icon={ShoppingCartIcon}
            iconColor="text-blue-600"
            trend={
              d ? { value: orderTrend, label: "vs ມື້ວານ" } : undefined
            }
            isLoading={isLoading}
          />
          <StatCard
            title="ລໍຖ້າດຳເນີນການ"
            value={d ? `${d.pendingOrders} ລາຍການ` : "—"}
            subtitle="PENDING + CONFIRMED"
            icon={ClockIcon}
            iconColor="text-amber-600"
            isLoading={isLoading}
          />
          <StatCard
            title="ລູກຄ້າໃໝ່ວັນນີ້"
            value={d ? `${d.today.newCustomers} ຄົນ` : "—"}
            icon={UsersRoundIcon}
            iconColor="text-purple-600"
            trend={
              d
                ? { value: customerTrend, label: "vs ມື້ວານ" }
                : undefined
            }
            isLoading={isLoading}
          />
        </div>

        {/* Charts Row */}
        <div className="mb-6 grid gap-4 lg:grid-cols-3">
          <div className="lg:col-span-2">
            <RevenueChart
              data={d?.revenueByDay ?? []}
              isLoading={isLoading}
            />
          </div>
          <OrderStatusChart
            data={d?.statusBreakdown ?? []}
            isLoading={isLoading}
          />
        </div>

        {/* Bottom Row */}
        <div className="grid gap-4 lg:grid-cols-3">
          <div className="lg:col-span-2">
            <RecentOrdersTable
              orders={d?.recentOrders ?? []}
              isLoading={isLoading}
            />
          </div>
          <LowStockCard
            products={d?.lowStockProducts ?? []}
            isLoading={isLoading}
          />
        </div>
      </Main>
    </>
  );
}
