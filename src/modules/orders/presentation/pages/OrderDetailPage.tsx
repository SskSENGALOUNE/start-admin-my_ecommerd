import { Header } from "@/app/layout/Header";
import { Main } from "@/app/layout/Main";
import { QueryState } from "@/shared/ui/QueryState";
import {
  Badge,
  Button,
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  confirm,
} from "@devhop/ui";
import { ArrowLeftIcon, BanIcon, CheckCircleIcon, PackageIcon, TruckIcon } from "lucide-react";
import { useNavigate, useParams } from "@tanstack/react-router";
import type { OrderStatus } from "../../domain/contracts/order.contract";
import {
  useCancelOrder,
  useOrderQuery,
  useUpdateOrderStatus,
} from "../api/queries";
import { ShipmentCard } from "@/modules/shipments/presentation/ui/ShipmentCard";
import { useActionPermission } from "@/modules/auth/presentation/model/useActionPermission";
import { OrderItemsTable } from "../ui/OrderItemsTable";
import { OrderStatusBadge } from "../ui/OrderStatusBadge";
import { OrderStatusFlow } from "../ui/OrderStatusFlow";

const NEXT_STATUS: Partial<Record<OrderStatus, { status: OrderStatus; label: string; icon: React.ReactNode }[]>> = {
  PENDING: [
    { status: "CONFIRMED", label: "ຢືນຢັນຄຳສັ່ງຊື້", icon: <CheckCircleIcon className="h-4 w-4" /> },
  ],
  CONFIRMED: [
    { status: "PROCESSING", label: "ເລີ່ມດຳເນີນ", icon: <PackageIcon className="h-4 w-4" /> },
  ],
  PROCESSING: [
    { status: "SHIPPED", label: "ສ່ງແລ້ວ", icon: <TruckIcon className="h-4 w-4" /> },
  ],
  SHIPPED: [
    { status: "DELIVERED", label: "ຢືນຢັນສົ່ງຮອດ", icon: <CheckCircleIcon className="h-4 w-4" /> },
  ],
  DELIVERED: [
    { status: "REFUNDED", label: "ຄືນເງິນ", icon: <BanIcon className="h-4 w-4" /> },
  ],
};

export function OrderDetailPage() {
  const nav = useNavigate();
  const { id } = useParams({ from: "/app/orders/$id" });

  const orderQuery = useOrderQuery(id);
  const order = orderQuery.data;

  const updateStatus = useUpdateOrderStatus(id);
  const cancelMutation = useCancelOrder();
  const canManageShipment = useActionPermission(["shipments:update"]);

  const formatPrice = (v: string) =>
    Number(v).toLocaleString("lo-LA") + " ກີບ";

  const nextActions = order ? NEXT_STATUS[order.status] ?? [] : [];
  const canCancel =
    order?.status === "PENDING" || order?.status === "CONFIRMED";

  async function handleStatusUpdate(status: OrderStatus) {
    const ok = await confirm({
      title: "ອັບເດດສະຖານະ?",
      description: `ຕ້ອງການອັບເດດສະຖານະ ${order?.orderNumber} ແທ້ບໍ?`,
      actionText: "ຢືນຢັນ",
    });
    if (!ok) return;
    await updateStatus.mutateAsync({ status });
  }

  async function handleCancel() {
    const ok = await confirm({
      title: "ຍົກເລີກຄຳສັ່ງຊື້?",
      description: `ຕ້ອງການຍົກເລີກ ${order?.orderNumber} ແທ້ບໍ?`,
      actionText: "ຍົກເລີກຄຳສັ່ງຊື້",
      ActionProps: { variant: "destructive" },
    });
    if (!ok) return;
    await cancelMutation.mutateAsync(id);
  }

  return (
    <>
      <Header />
      <Main>
        {/* Back Button */}
        <button
          type="button"
          onClick={() => nav({ to: "/app/orders" })}
          className="mb-4 flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground"
        >
          <ArrowLeftIcon className="h-4 w-4" />
          ກັບໄປລາຍການ
        </button>

        <QueryState query={orderQuery}>
          {order && (
            <div className="space-y-6">
              {/* Header */}
              <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                <div>
                  <h1 className="text-xl font-semibold font-mono">
                    {order.orderNumber}
                  </h1>
                  <p className="text-sm text-muted-foreground">
                    {new Date(order.createdAt).toLocaleDateString("lo-LA", {
                      year: "numeric",
                      month: "long",
                      day: "numeric",
                      hour: "2-digit",
                      minute: "2-digit",
                    })}
                  </p>
                </div>
                <div className="flex items-center gap-2">
                  <OrderStatusBadge status={order.status} />
                  {nextActions.map((action) => (
                    <Button
                      key={action.status}
                      size="sm"
                      onClick={() => handleStatusUpdate(action.status)}
                      disabled={updateStatus.isPending}
                    >
                      {action.icon}
                      <span className="ml-1">{action.label}</span>
                    </Button>
                  ))}
                  {canCancel && (
                    <Button
                      size="sm"
                      variant="destructive"
                      onClick={handleCancel}
                      disabled={cancelMutation.isPending}
                    >
                      <BanIcon className="h-4 w-4" />
                      <span className="ml-1">ຍົກເລີກ</span>
                    </Button>
                  )}
                </div>
              </div>

              {/* Status Flow */}
              <Card>
                <CardContent className="pt-6">
                  <OrderStatusFlow status={order.status} />
                </CardContent>
              </Card>

              {/* Main Grid */}
              <div className="grid gap-6 lg:grid-cols-3">
                {/* Left: Items + Summary */}
                <div className="space-y-6 lg:col-span-2">
                  {/* Order Items */}
                  <Card>
                    <CardHeader>
                      <CardTitle className="text-base">ລາຍການສິນຄ້າ</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <OrderItemsTable items={order.items} />

                      {/* Summary */}
                      <div className="mt-4 space-y-2 border-t pt-4 text-sm">
                        <div className="flex justify-between">
                          <span className="text-muted-foreground">ລວມສິນຄ້າ</span>
                          <span>{formatPrice(order.subtotal)}</span>
                        </div>
                        {Number(order.discount) > 0 && (
                          <div className="flex justify-between text-green-600">
                            <span>
                              ສ່ວນຫຼຸດ
                              {order.couponCode && (
                                <Badge variant="outline" className="ml-2 text-xs">
                                  {order.couponCode}
                                </Badge>
                              )}
                            </span>
                            <span>- {formatPrice(order.discount)}</span>
                          </div>
                        )}
                        <div className="flex justify-between">
                          <span className="text-muted-foreground">ຄ່າຈັດສົ່ງ</span>
                          <span>{formatPrice(order.shippingCost)}</span>
                        </div>
                        <div className="flex justify-between border-t pt-2 text-base font-bold">
                          <span>ລວມທັງໝົດ</span>
                          <span>{formatPrice(order.totalAmount)}</span>
                        </div>
                      </div>
                    </CardContent>
                  </Card>

                  {/* Shipment Card */}
                  <ShipmentCard
                    orderId={order.id}
                    orderStatus={order.status}
                    defaultShippingType={order.shippingName}
                    shipment={order.shipment}
                    canManage={canManageShipment}
                  />
                </div>

                {/* Right: Customer + Payment */}
                <div className="space-y-6">
                  {/* Customer Info */}
                  <Card>
                    <CardHeader>
                      <CardTitle className="text-base">ຂໍ້ມູນລູກຄ້າ</CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-2 text-sm">
                      <p className="font-medium">{order.customerName ?? "-"}</p>
                      {order.customerEmail && (
                        <p className="text-muted-foreground">{order.customerEmail}</p>
                      )}
                      {order.customerPhone && (
                        <p className="text-muted-foreground">{order.customerPhone}</p>
                      )}
                    </CardContent>
                  </Card>

                  {/* Shipping Info */}
                  <Card>
                    <CardHeader>
                      <CardTitle className="text-base">ຂໍ້ມູນຈັດສົ່ງ</CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-2 text-sm">
                      <div className="flex justify-between">
                        <span className="text-muted-foreground">ຂົນສົ່ງ</span>
                        <span>{order.shippingName.replace(/_/g, " ")}</span>
                      </div>
                      {order.note && (
                        <div>
                          <span className="text-muted-foreground">ໝາຍເຫດ:</span>
                          <p className="mt-1 text-foreground">{order.note}</p>
                        </div>
                      )}
                    </CardContent>
                  </Card>

                  {/* Payment Info */}
                  {order.transaction && (
                    <Card>
                      <CardHeader>
                        <CardTitle className="text-base">ການຊຳລະເງິນ</CardTitle>
                      </CardHeader>
                      <CardContent className="space-y-2 text-sm">
                        <div className="flex justify-between">
                          <span className="text-muted-foreground">ວິທີຊຳລະ</span>
                          <Badge variant="outline">
                            {order.transaction.paymentMethod}
                          </Badge>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-muted-foreground">ທະນາຄານ</span>
                          <span>{order.transaction.bankType}</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-muted-foreground">ສະຖານະ</span>
                          <Badge
                            variant={
                              order.transaction.status === "COMPLETED"
                                ? "default"
                                : order.transaction.status === "FAILED"
                                  ? "destructive"
                                  : "secondary"
                            }
                          >
                            {order.transaction.status === "COMPLETED"
                              ? "ສຳເລັດ"
                              : order.transaction.status === "FAILED"
                                ? "ລົ້ມເຫຼວ"
                                : "ລໍຖ້າ"}
                          </Badge>
                        </div>
                        <div className="flex justify-between font-medium">
                          <span className="text-muted-foreground">ຍອດ</span>
                          <span>{formatPrice(order.transaction.amount)}</span>
                        </div>
                        {order.transaction.slipUrl && (
                          <div className="pt-2">
                            <p className="mb-1 text-muted-foreground">ສລິບ</p>
                            <img
                              src={order.transaction.slipUrl}
                              alt="slip"
                              className="w-full rounded-md border object-contain"
                            />
                          </div>
                        )}
                      </CardContent>
                    </Card>
                  )}
                </div>
              </div>
            </div>
          )}
        </QueryState>
      </Main>
    </>
  );
}
