import { config } from "@/shared/lib/config";
import { fetcher } from "@/shared/lib/fetcher";
import type { UpdateProfileDTO, ChangePasswordDTO, AddressUpsertDTO, MyOrderQueryDTO } from "../../domain/contracts/customer-account.contract";

// ─── Response types ───────────────────────────────────────────────────────────

export interface MyOrderListItem {
  id: string;
  orderNumber: string;
  status: string;
  subtotal: string;
  discount: string;
  shippingCost: string;
  totalAmount: string;
  shippingName: string;
  createdAt: string;
}

export interface MyOrderListResult {
  data: MyOrderListItem[];
  meta: { total: number; limit: number; offset: number };
}

export interface MyOrderItem {
  id: string;
  orderId: string;
  productId: string | null;
  productVariantId: string | null;
  productName: string;
  productImage: string | null;
  variantSku: string | null;
  colorName: string | null;
  size: string | null;
  quantity: number;
  unitPrice: string;
  subtotal: string;
  createdAt: string;
}

export interface MyOrderShipment {
  id: string;
  shippingType: string;
  trackingNumber: string | null;
  status: string;
  shippedAt: string | null;
  deliveredAt: string | null;
  note: string | null;
}

export interface MyOrderTransaction {
  id: string;
  amount: string;
  status: string;
  paymentMethod: string;
  bankType: string | null;
  slipUrl: string | null;
  verifiedAt: string | null;
  createdAt: string;
}

export interface MyOrderAddress {
  id: string;
  recipientName: string;
  recipientPhone: string;
  province: string;
  district: string;
  village: string | null;
  address: string;
  label: string | null;
}

export interface MyOrderDetail extends MyOrderListItem {
  couponCode: string | null;
  note: string | null;
  items: MyOrderItem[];
  shipment: MyOrderShipment | null;
  transaction: MyOrderTransaction | null;
  shippingAddress: MyOrderAddress | null;
}

export interface MyAddress {
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
  createdAt: string;
  updatedAt: string;
}

export interface MyProfile {
  id: string;
  email: string;
  name: string;
  phone: string | null;
  isActive: boolean;
}

// ─── API client ───────────────────────────────────────────────────────────────

const BASE = `${config.apiUrl}/customer-account`;

export const customerAccountApi = {
  // Orders
  async listOrders(query: Partial<MyOrderQueryDTO> = {}): Promise<MyOrderListResult> {
    const url = new URL(`${BASE}/orders`);
    url.searchParams.set("limit", String(query.limit ?? 10));
    url.searchParams.set("offset", String(query.offset ?? 0));
    if (query.status) url.searchParams.set("status", query.status);
    return fetcher.get<MyOrderListResult>(url.toString());
  },

  async getOrder(id: string): Promise<MyOrderDetail> {
    return fetcher.get<MyOrderDetail>(`${BASE}/orders/${id}`);
  },

  async cancelOrder(id: string): Promise<MyOrderDetail> {
    return fetcher.post<MyOrderDetail>(`${BASE}/orders/${id}/cancel`, {});
  },

  // Profile
  async updateProfile(input: UpdateProfileDTO): Promise<MyProfile> {
    return fetcher.patch<MyProfile>(`${BASE}/profile`, input);
  },

  async changePassword(input: ChangePasswordDTO): Promise<{ ok: boolean }> {
    return fetcher.patch<{ ok: boolean }>(`${BASE}/password`, input);
  },

  // Addresses
  async listAddresses(): Promise<MyAddress[]> {
    return fetcher.get<MyAddress[]>(`${BASE}/addresses`);
  },

  async createAddress(input: AddressUpsertDTO): Promise<MyAddress> {
    return fetcher.post<MyAddress>(`${BASE}/addresses`, input);
  },

  async updateAddress(id: string, input: AddressUpsertDTO): Promise<MyAddress> {
    return fetcher.patch<MyAddress>(`${BASE}/addresses/${id}`, input);
  },

  async deleteAddress(id: string): Promise<{ ok: boolean }> {
    return fetcher.delete<{ ok: boolean }>(`${BASE}/addresses/${id}`);
  },

  async setDefaultAddress(id: string): Promise<MyAddress> {
    return fetcher.patch<MyAddress>(`${BASE}/addresses/${id}/default`, {});
  },
};
