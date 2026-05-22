import { config } from "@/shared/lib/config";
import { fetcher } from "@/shared/lib/fetcher";
import type {
  CustomerDTO,
  CustomerQueryDTO,
} from "../../domain/contracts/customer.contract";

export interface CustomerListResult {
  data: CustomerDTO[];
  meta: { total: number; limit: number; offset: number };
}

export interface CustomerDetail extends CustomerDTO {
  totalOrders: number;
  totalSpent: string;
  orders: {
    id: string;
    orderNumber: string;
    status: string;
    totalAmount: string;
    createdAt: Date;
  }[];
  addresses: {
    id: string;
    customerId: string;
    label: string | null;
    recipientName: string;
    recipientPhone: string;
    province: string;
    district: string;
    village: string | null;
    address: string;
    isDefault: boolean;
    createdAt: Date;
  }[];
}

export const customersApi = {
  async list(query: Partial<CustomerQueryDTO> = {}): Promise<CustomerListResult> {
    const url = new URL(`${config.apiUrl}/customers`);
    url.searchParams.set("limit", String(query.limit ?? 20));
    url.searchParams.set("offset", String(query.offset ?? 0));
    if (query.search) url.searchParams.set("search", query.search);
    if (query.isActive !== undefined)
      url.searchParams.set("isActive", String(query.isActive));
    return fetcher.get<CustomerListResult>(url.toString());
  },

  async get(id: string): Promise<CustomerDetail> {
    return fetcher.get<CustomerDetail>(`${config.apiUrl}/customers/${id}`);
  },

  async ban(id: string): Promise<CustomerDTO> {
    return fetcher.post<CustomerDTO>(`${config.apiUrl}/customers/${id}/ban`, {});
  },

  async unban(id: string): Promise<CustomerDTO> {
    return fetcher.post<CustomerDTO>(`${config.apiUrl}/customers/${id}/unban`, {});
  },
};
