import { OrderStatusBadge } from "@/modules/orders/presentation/ui/OrderStatusBadge";
import type { OrderStatus } from "@/modules/orders/domain/contracts/order.contract";
import { Card, CardContent, CardHeader, CardTitle, Skeleton } from "@devhop/ui";
import { ShoppingCartIcon } from "lucide-react";
import { useNavigate } from "@tanstack/react-router";

interface OrderRow {
  id: string;
  orderNumber: string;
  customerName: string | null;
  status: string;
  totalAmount: string;
  createdAt: Date;
}

interface Props {
  orders: OrderRow[];
  isLoading?: boolean;
}

export function RecentOrdersTable({ orders, isLoading }: Props) {
  const nav = useNavigate();
  const formatPrice = (v: string) =>
    `${Number(v).toLocaleString("lo-LA")} ກີບ`;

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between pb-3">
        <CardTitle className="flex items-center gap-2 text-base">
          <ShoppingCartIcon className="h-4 w-4" />
          ຄຳສັ່ງຊື້ລ່າສຸດ
        </CardTitle>
        <button
          type="button"
          onClick={() => nav({ to: "/app/orders" })}
          className="text-xs text-primary hover:underline"
        >
          ເບິ່ງທັງໝົດ →
        </button>
      </CardHeader>
      <CardContent className="p-0">
        {isLoading ? (
          <div className="space-y-3 px-6 pb-4">
            {Array.from({ length: 5 }).map((_, i) => (
              // biome-ignore lint/suspicious/noArrayIndexKey: skeleton loader
              <Skeleton key={i} className="h-12 w-full rounded-lg" />
            ))}
          </div>
        ) : orders.length === 0 ? (
          <p className="px-6 pb-4 text-sm text-muted-foreground">
            ຍັງບໍ່ມີຄຳສັ່ງຊື້
          </p>
        ) : (
          <div className="divide-y">
            {orders.map((order) => (
              <button
                key={order.id}
                type="button"
                onClick={() =>
                  nav({ to: "/app/orders/$id", params: { id: order.id } })
                }
                className="flex w-full items-center gap-3 px-6 py-3 text-sm transition-colors hover:bg-muted/50"
              >
                <div className="min-w-0 flex-1 text-left">
                  <p className="font-mono font-medium text-primary">
                    {order.orderNumber}
                  </p>
                  <p className="truncate text-xs text-muted-foreground">
                    {order.customerName ?? "—"}
                  </p>
                </div>
                <OrderStatusBadge status={order.status as OrderStatus} />
                <div className="text-right">
                  <p className="font-medium">
                    {formatPrice(order.totalAmount)}
                  </p>
                  <p className="text-xs text-muted-foreground">
                    {new Date(order.createdAt).toLocaleDateString("lo-LA", {
                      month: "short",
                      day: "numeric",
                      hour: "2-digit",
                      minute: "2-digit",
                    })}
                  </p>
                </div>
              </button>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  );
}
