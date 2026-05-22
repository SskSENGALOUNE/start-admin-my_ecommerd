import { config } from "@/shared/lib/config";
import { fetcher } from "@/shared/lib/fetcher";

const BASE = `${config.apiUrl}/payment`;

export interface PaymentStatus {
  orderId: string;
  orderStatus: string;
  paymentStatus: "PENDING" | "COMPLETED" | "FAILED";
  paymentMethod: "QR" | "COD" | null;
  verifiedAt: string | null;
  isPaid: boolean;
}

export const paymentApi = {
  async getStatus(orderId: string): Promise<PaymentStatus> {
    return fetcher.get<PaymentStatus>(`${BASE}/status/${orderId}`);
  },
};
