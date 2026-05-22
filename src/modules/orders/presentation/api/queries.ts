import { toast } from "@devhop/ui";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import type { OrderQueryDTO, UpdateOrderStatusDTO } from "../../domain/contracts/order.contract";
import { ordersApi } from "./client";

export const ordersKeys = {
  all: ["orders"] as const,
  list: (q?: Partial<OrderQueryDTO>) => ["orders", "list", q] as const,
  detail: (id: string) => ["orders", "detail", id] as const,
};

export function useOrdersQuery(query: Partial<OrderQueryDTO> = {}) {
  return useQuery({
    queryKey: ordersKeys.list(query),
    queryFn: () => ordersApi.list(query),
  });
}

export function useOrderQuery(id: string) {
  return useQuery({
    queryKey: ordersKeys.detail(id),
    queryFn: () => ordersApi.get(id),
    enabled: !!id,
  });
}

export function useUpdateOrderStatus(id: string) {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (input: UpdateOrderStatusDTO) => ordersApi.updateStatus(id, input),
    onSuccess: () => {
      toast.success("ອັບເດດສະຖານະສຳເລັດ");
      qc.invalidateQueries({ queryKey: ordersKeys.all });
    },
    onError: () => toast.error("ອັບເດດສະຖານະລົ້ມເຫຼວ"),
  });
}

export function useCancelOrder() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => ordersApi.cancel(id),
    onSuccess: () => {
      toast.success("ຍົກເລີກຄຳສັ່ງຊື້ສຳເລັດ");
      qc.invalidateQueries({ queryKey: ordersKeys.all });
    },
    onError: () => toast.error("ຍົກເລີກຄຳສັ່ງຊື້ລົ້ມເຫຼວ"),
  });
}
