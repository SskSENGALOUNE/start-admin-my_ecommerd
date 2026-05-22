import { config } from "@/shared/lib/config";
import { fetcher } from "@/shared/lib/fetcher";

export interface TransactionListItem {
  id: string;
  transactionId: string;
  amount: string;
  status: "PENDING" | "COMPLETED" | "FAILED";
  paymentMethod: "QR" | "COD";
  bankType: "BCEL" | "JDB" | "LDB" | null;
  slipUrl: string | null;
  orderRef: string;
  orderNumber: string | null;
  customerName: string | null;
  verifiedAt: string | null;
  createdAt: string;
}

export interface TransactionDetail extends TransactionListItem {
  merchantId: string;
  merchantName: string;
  bankRequest: string;
  bankResponse: string;
  postRequest: string;
  verifiedBy: string | null;
  updatedAt: string;
}

export interface TransactionListResult {
  data: TransactionListItem[];
  meta: { total: number; limit: number; offset: number };
}

export interface TransactionQuery {
  limit?: number;
  offset?: number;
  status?: "PENDING" | "COMPLETED" | "FAILED";
  paymentMethod?: "QR" | "COD";
}

export const transactionsApi = {
  async list(query: TransactionQuery = {}): Promise<TransactionListResult> {
    const url = new URL(`${config.apiUrl}/transactions`);
    url.searchParams.set("limit", String(query.limit ?? 20));
    url.searchParams.set("offset", String(query.offset ?? 0));
    if (query.status) url.searchParams.set("status", query.status);
    if (query.paymentMethod)
      url.searchParams.set("paymentMethod", query.paymentMethod);
    return fetcher.get<TransactionListResult>(url.toString());
  },

  async getById(id: string): Promise<TransactionDetail> {
    return fetcher.get<TransactionDetail>(`${config.apiUrl}/transactions/${id}`);
  },
};
