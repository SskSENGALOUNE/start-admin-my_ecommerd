import { config } from "@/shared/lib/config";
import { fetcher } from "@/shared/lib/fetcher";
import type { OrderDTO, OrderDetailDTO, OrderQueryDTO, UpdateOrderStatusDTO } from "../../domain/contracts/order.contract";

export interface OrderListResult {
  data: OrderDTO[];
  meta: { total: number; limit: number; offset: number };
}

export const ordersApi = {
  async list(query: Partial<OrderQueryDTO> = {}): Promise<OrderListResult> {
    const url = new URL(`${config.apiUrl}/orders`);
    url.searchParams.set("limit", String(query.limit ?? 20));
    url.searchParams.set("offset", String(query.offset ?? 0));
    if (query.status) url.searchParams.set("status", query.status);
    if (query.search) url.searchParams.set("search", query.search);
    if (query.dateFrom)
      url.searchParams.set("dateFrom", query.dateFrom.toISOString());
    if (query.dateTo)
      url.searchParams.set("dateTo", query.dateTo.toISOString());
    return fetcher.get<OrderListResult>(url.toString());
  },

  async get(id: string): Promise<OrderDetailDTO> {
    return fetcher.get<OrderDetailDTO>(`${config.apiUrl}/orders/${id}`);
  },

  async updateStatus(id: string, input: UpdateOrderStatusDTO): Promise<OrderDTO> {
    return fetcher.patch<OrderDTO>(`${config.apiUrl}/orders/${id}/status`, input);
  },

  async cancel(id: string): Promise<OrderDTO> {
    return fetcher.post<OrderDTO>(`${config.apiUrl}/orders/${id}/cancel`, {});
  },
};
