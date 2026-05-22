import { toast } from "@devhop/ui";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import type { CustomerQueryDTO } from "../../domain/contracts/customer.contract";
import { customersApi } from "./client";

export const customersKeys = {
  all: ["customers"] as const,
  list: (q?: Partial<CustomerQueryDTO>) => ["customers", "list", q] as const,
  detail: (id: string) => ["customers", "detail", id] as const,
};

export function useCustomersQuery(query: Partial<CustomerQueryDTO> = {}) {
  return useQuery({
    queryKey: customersKeys.list(query),
    queryFn: () => customersApi.list(query),
  });
}

export function useCustomerQuery(id: string) {
  return useQuery({
    queryKey: customersKeys.detail(id),
    queryFn: () => customersApi.get(id),
    enabled: !!id,
  });
}

export function useBanCustomer() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => customersApi.ban(id),
    onSuccess: () => {
      toast.success("ລະງັບລູກຄ້າສຳເລັດ");
      qc.invalidateQueries({ queryKey: customersKeys.all });
    },
    onError: () => toast.error("ລະງັບລູກຄ້າລົ້ມເຫຼວ"),
  });
}

export function useUnbanCustomer() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => customersApi.unban(id),
    onSuccess: () => {
      toast.success("ກູ້ຄືນລູກຄ້າສຳເລັດ");
      qc.invalidateQueries({ queryKey: customersKeys.all });
    },
    onError: () => toast.error("ກູ້ຄືນລູກຄ້າລົ້ມເຫຼວ"),
  });
}
