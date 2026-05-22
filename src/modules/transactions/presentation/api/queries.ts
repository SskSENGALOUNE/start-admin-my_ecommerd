import { toast } from "@devhop/ui";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { config } from "@/shared/lib/config";
import { fetcher } from "@/shared/lib/fetcher";
import type { TransactionQuery } from "./client";
import { transactionsApi } from "./client";

export const transactionKeys = {
  all: ["transactions"] as const,
  list: (q?: TransactionQuery) => ["transactions", "list", q] as const,
  detail: (id: string) => ["transactions", id] as const,
};

export function useTransactionsQuery(query: TransactionQuery = {}) {
  return useQuery({
    queryKey: transactionKeys.list(query),
    queryFn: () => transactionsApi.list(query),
  });
}

export function useTransactionQuery(id: string) {
  return useQuery({
    queryKey: transactionKeys.detail(id),
    queryFn: () => transactionsApi.getById(id),
    enabled: !!id,
  });
}

export function useManualConfirm() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (orderId: string) =>
      fetcher.post(`${config.apiUrl}/payment/admin/confirm/${orderId}`),
    onSuccess: () => {
      toast.success("ຢືນຢັນສຳເລັດ");
      qc.invalidateQueries({ queryKey: transactionKeys.all });
    },
    onError: () => toast.error("ຢືນຢັນລົ້ມເຫຼວ"),
  });
}
