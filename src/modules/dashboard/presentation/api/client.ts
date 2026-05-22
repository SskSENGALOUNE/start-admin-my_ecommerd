import { config } from "@/shared/lib/config";
import { fetcher } from "@/shared/lib/fetcher";

export interface DashboardStats {
  today: { orderCount: number; revenue: string; newCustomers: number };
  yesterday: { orderCount: number; revenue: string; newCustomers: number };
  pendingOrders: number;
  revenueByDay: { date: string; revenue: string; count: number }[];
  statusBreakdown: { status: string; count: number }[];
  recentOrders: {
    id: string;
    orderNumber: string;
    customerName: string | null;
    status: string;
    totalAmount: string;
    createdAt: Date;
  }[];
  lowStockProducts: {
    id: string;
    name: string;
    quantity: number;
    reservedQty: number;
  }[];
}

export const dashboardApi = {
  async getStats(): Promise<DashboardStats> {
    return fetcher.get<DashboardStats>(`${config.apiUrl}/dashboard/stats`);
  },
};
