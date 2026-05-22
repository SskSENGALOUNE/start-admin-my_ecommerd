import { toast } from "@devhop/ui";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import type {
  CreateShipmentDTO,
  UpdateTrackingDTO,
} from "../../domain/contracts/shipment.contract";
import { shipmentsApi } from "./client";

export const shipmentsKeys = {
  all: ["shipments"] as const,
  byOrder: (orderId: string) => ["shipments", "order", orderId] as const,
};

export function useShipmentByOrderQuery(orderId: string) {
  return useQuery({
    queryKey: shipmentsKeys.byOrder(orderId),
    queryFn: () => shipmentsApi.getByOrder(orderId),
    enabled: !!orderId,
    retry: false, // 404 = no shipment yet, don't retry
  });
}

export function useCreateShipment() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (input: CreateShipmentDTO) => shipmentsApi.create(input),
    onSuccess: (_, variables) => {
      toast.success("ສ້າງ Shipment ສຳເລັດ");
      qc.invalidateQueries({ queryKey: shipmentsKeys.byOrder(variables.orderId) });
      qc.invalidateQueries({ queryKey: ["orders"] });
    },
    onError: () => toast.error("ສ້າງ Shipment ລົ້ມເຫຼວ"),
  });
}

export function useUpdateTracking(orderId: string) {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ id, input }: { id: string; input: UpdateTrackingDTO }) =>
      shipmentsApi.updateTracking(id, input),
    onSuccess: () => {
      toast.success("ອັບເດດ Tracking ສຳເລັດ — ສະຖານະ SHIPPED ແລ້ວ");
      qc.invalidateQueries({ queryKey: shipmentsKeys.byOrder(orderId) });
      qc.invalidateQueries({ queryKey: ["orders"] });
    },
    onError: () => toast.error("ອັບເດດ Tracking ລົ້ມເຫຼວ"),
  });
}

export function useMarkDelivered(orderId: string) {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => shipmentsApi.markDelivered(id),
    onSuccess: () => {
      toast.success("ຢືນຢັນການຮັບສິນຄ້າສຳເລັດ — ສະຖານະ DELIVERED ແລ້ວ");
      qc.invalidateQueries({ queryKey: shipmentsKeys.byOrder(orderId) });
      qc.invalidateQueries({ queryKey: ["orders"] });
    },
    onError: () => toast.error("ຢືນຢັນການຮັບລົ້ມເຫຼວ"),
  });
}
