import { config } from "@/shared/lib/config";
import { fetcher } from "@/shared/lib/fetcher";

const BASE = `${config.apiUrl}/payment`;

export interface PaymentStatus {
  orderId: string;
  orderNumber: string;
  orderStatus: string;
  paymentStatus: "PENDING" | "COMPLETED" | "FAILED";
  paymentMethod: "QR" | "COD" | null;
  verifiedAt: string | null;
  isPaid: boolean;
}

export const paymentApi = {
  async getPubKey(): Promise<{ subscribeKey: string | null }> {
    return fetcher.get<{ subscribeKey: string | null }>(`${BASE}/pubkey`);
  },

  async getStatus(orderId: string): Promise<PaymentStatus> {
    return fetcher.get<PaymentStatus>(`${BASE}/status/${orderId}`);
  },

  async refreshQr(orderId: string): Promise<{ qrString: string; channelId: string }> {
    return fetcher.post<{ qrString: string; channelId: string }>(`${BASE}/refresh-qr/${orderId}`, {});
  },

  async devSimulate(orderId: string): Promise<{ ok: boolean }> {
    return fetcher.post<{ ok: boolean }>(`${BASE}/dev/simulate/${orderId}`, {});
  },
};
