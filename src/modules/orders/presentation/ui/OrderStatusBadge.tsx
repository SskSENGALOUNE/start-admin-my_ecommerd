import { Badge } from "@devhop/ui";
import type { OrderStatus } from "../../domain/contracts/order.contract";

const STATUS_CONFIG: Record<
  OrderStatus,
  { label: string; variant: "default" | "secondary" | "destructive" | "outline" | "success" | "warning" }
> = {
  PENDING: { label: "ລໍຖ້າ", variant: "warning" },
  CONFIRMED: { label: "ຢືນຢັນແລ້ວ", variant: "default" },
  PROCESSING: { label: "ກຳລັງດຳເນີນ", variant: "secondary" },
  SHIPPED: { label: "ຈັດສົ່ງແລ້ວ", variant: "default" },
  DELIVERED: { label: "ສົ່ງຮອດແລ້ວ", variant: "success" },
  CANCELLED: { label: "ຍົກເລີກ", variant: "destructive" },
  REFUNDED: { label: "ຄືນເງິນ", variant: "outline" },
};

export function OrderStatusBadge({ status }: { status: OrderStatus }) {
  const config = STATUS_CONFIG[status];
  return <Badge variant={config.variant as "default"}>{config.label}</Badge>;
}

export function getOrderStatusLabel(status: OrderStatus): string {
  return STATUS_CONFIG[status]?.label ?? status;
}
