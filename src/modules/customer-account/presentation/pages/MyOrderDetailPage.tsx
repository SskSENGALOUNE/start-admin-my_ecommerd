import { useNavigate, useParams } from "@tanstack/react-router";
import { Button, Badge, Skeleton, confirm } from "@devhop/ui";
import {
  ArrowLeftIcon,
  MapPinIcon,
  PackageIcon,
  TruckIcon,
  WalletIcon,
} from "lucide-react";
import { CustomerAuthGuard } from "@/modules/customer-auth/presentation/ui/CustomerAuthGuard";
import { ShopNavbar } from "@/modules/shop/presentation/ui/ShopNavbar";
import { AppImage } from "@/shared/ui/AppImage";
import { OrderStatusBadge } from "@/modules/orders/presentation/ui/OrderStatusBadge";
import type { OrderStatus } from "@/modules/orders/domain/contracts/order.contract";
import { useMyOrderQuery, useCancelMyOrder } from "../api/queries";

// ─── Helpers ──────────────────────────────────────────────────────────────────

function fmt(v: string | number) {
  return `${Number(v).toLocaleString("lo-LA")} ກີບ`;
}

function fmtDate(d: string | Date | null | undefined) {
  if (!d) return "—";
  return new Date(d).toLocaleDateString("lo-LA", {
    year: "numeric",
    month: "short",
    day: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
}

const SHIPPING_LABELS: Record<string, string> = {
  RAIDER: "Raider",
  ANOUSITH_EXPRESS: "Anousith Express",
  HOUNGALOUN_EXPRESS: "Houngaloun Express",
  MIXAY_EXPRESS: "Mixay Express",
  UNITEL_EXPRESS: "Unitel Express",
};

const SHIPMENT_STATUS_LABELS: Record<string, string> = {
  PREPARING: "ກຳລັງຈັດກຽມ",
  SHIPPED: "ຈັດສົ່ງແລ້ວ",
  DELIVERED: "ສົ່ງຮອດແລ້ວ",
};

const PAYMENT_METHOD_LABELS: Record<string, string> = {
  QR: "QR / ໂອນເງິນ",
  COD: "ຈ່າຍເງິນສົດ (COD)",
};

const TRANSACTION_STATUS_LABELS: Record<string, string> = {
  PENDING: "ລໍຖ້າຢືນຢັນ",
  COMPLETED: "ຊຳລະແລ້ວ",
  FAILED: "ລົ້ມເຫຼວ",
};

// ─── Section wrapper ──────────────────────────────────────────────────────────

function Section({
  icon,
  title,
  children,
}: {
  icon: React.ReactNode;
  title: string;
  children: React.ReactNode;
}) {
  return (
    <div className="rounded-xl border p-5">
      <h3 className="mb-4 flex items-center gap-2 font-semibold">
        <span className="flex h-7 w-7 items-center justify-center rounded-lg bg-primary/10 text-primary">
          {icon}
        </span>
        {title}
      </h3>
      {children}
    </div>
  );
}

// ─── Page ─────────────────────────────────────────────────────────────────────

export function MyOrderDetailPage() {
  const nav = useNavigate();
  const { id } = useParams({ from: "/account/orders/$id" });
  const orderQuery = useMyOrderQuery(id);
  const cancelMutation = useCancelMyOrder();
  const order = orderQuery.data;

  const canCancel =
    order?.status === "PENDING" || order?.status === "CONFIRMED";

  async function handleCancel() {
    const ok = await confirm({
      title: "ຍົກເລີກຄຳສັ່ງຊື້?",
      description: `ຕ້ອງການຍົກເລີກຄຳສັ່ງຊື້ ${order?.orderNumber} ແທ້ບໍ?`,
      actionText: "ຍົກເລີກຄຳສັ່ງຊື້",
      ActionProps: { variant: "destructive" },
    });
    if (!ok) return;
    await cancelMutation.mutateAsync(id);
  }

  return (
    <CustomerAuthGuard>
      <div className="min-h-screen bg-background">
        <ShopNavbar />

        <div className="mx-auto max-w-3xl px-4 py-8">
          {/* Back */}
          <button
            type="button"
            onClick={() => nav({ to: "/account" })}
            className="mb-5 flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground"
          >
            <ArrowLeftIcon className="h-4 w-4" />
            ກັບໄປລາຍການຄຳສັ່ງຊື້
          </button>

          {/* Loading */}
          {orderQuery.isLoading && (
            <div className="space-y-4">
              {Array.from({ length: 4 }).map((_, i) => (
                <Skeleton key={`sk-${i}`} className="h-32 w-full rounded-xl" />
              ))}
            </div>
          )}

          {/* Error */}
          {orderQuery.isError && (
            <div className="rounded-xl border border-destructive/30 bg-destructive/5 p-6 text-center text-destructive">
              ບໍ່ສາມາດໂຫຼດຂໍ້ມູນຄຳສັ່ງຊື້ໄດ້
            </div>
          )}

          {order && (
            <div className="space-y-4">
              {/* Order header */}
              <div className="flex flex-col gap-3 rounded-xl border p-5 sm:flex-row sm:items-start sm:justify-between">
                <div>
                  <p className="font-mono text-lg font-bold text-primary">
                    {order.orderNumber}
                  </p>
                  <p className="mt-0.5 text-sm text-muted-foreground">
                    {fmtDate(order.createdAt)}
                  </p>
                </div>
                <div className="flex items-center gap-3">
                  <OrderStatusBadge status={order.status as OrderStatus} />
                  {canCancel && (
                    <Button
                      size="sm"
                      variant="destructive"
                      onClick={handleCancel}
                      disabled={cancelMutation.isPending}
                    >
                      {cancelMutation.isPending ? "ກຳລັງຍົກເລີກ..." : "ຍົກເລີກຄຳສັ່ງຊື້"}
                    </Button>
                  )}
                </div>
              </div>

              {/* Items */}
              <Section icon={<PackageIcon className="h-4 w-4" />} title="ສິນຄ້າ">
                <div className="divide-y">
                  {order.items.map((item) => (
                    <div key={item.id} className="flex gap-3 py-3 first:pt-0 last:pb-0">
                      <div className="h-16 w-16 shrink-0 overflow-hidden rounded-lg border bg-muted">
                        <AppImage
                          src={item.productImage}
                          alt={item.productName}
                          className="h-full w-full"
                          fit="cover"
                        />
                      </div>
                      <div className="flex flex-1 items-start justify-between gap-2 min-w-0">
                        <div className="min-w-0">
                          <p className="truncate font-medium">{item.productName}</p>
                          {(item.colorName || item.size) && (
                            <p className="text-xs text-muted-foreground">
                              {[item.colorName, item.size].filter(Boolean).join(" · ")}
                            </p>
                          )}
                          {item.variantSku && (
                            <p className="font-mono text-xs text-muted-foreground">
                              {item.variantSku}
                            </p>
                          )}
                          <p className="mt-1 text-sm text-muted-foreground">
                            {fmt(item.unitPrice)} × {item.quantity}
                          </p>
                        </div>
                        <p className="shrink-0 font-semibold">{fmt(item.subtotal)}</p>
                      </div>
                    </div>
                  ))}
                </div>

                {/* Price summary */}
                <div className="mt-4 space-y-1.5 border-t pt-4 text-sm">
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">ລາຄາສິນຄ້າ</span>
                    <span>{fmt(order.subtotal)}</span>
                  </div>
                  {Number(order.discount) > 0 && (
                    <div className="flex justify-between text-green-600">
                      <span>ສ່ວນຫຼຸດ</span>
                      <span>−{fmt(order.discount)}</span>
                    </div>
                  )}
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">ຄ່າຂົນສົ່ງ</span>
                    <span>{fmt(order.shippingCost)}</span>
                  </div>
                  <div className="flex justify-between border-t pt-2 text-base font-bold">
                    <span>ລວມທັງໝົດ</span>
                    <span className="text-primary">{fmt(order.totalAmount)}</span>
                  </div>
                </div>
              </Section>

              {/* Shipping address */}
              {order.shippingAddress && (
                <Section icon={<MapPinIcon className="h-4 w-4" />} title="ທີ່ຢູ່ຈັດສົ່ງ">
                  <div className="text-sm space-y-0.5">
                    <p className="font-medium">{order.shippingAddress.recipientName}</p>
                    <p className="text-muted-foreground">{order.shippingAddress.recipientPhone}</p>
                    <p className="text-muted-foreground">
                      {[
                        order.shippingAddress.address,
                        order.shippingAddress.village,
                        order.shippingAddress.district,
                        order.shippingAddress.province,
                      ]
                        .filter(Boolean)
                        .join(", ")}
                    </p>
                  </div>
                </Section>
              )}

              {/* Shipment */}
              <Section icon={<TruckIcon className="h-4 w-4" />} title="ການຂົນສົ່ງ">
                <div className="text-sm space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="text-muted-foreground">ຜູ້ໃຫ້ບໍລິການ</span>
                    <span className="font-medium">
                      {SHIPPING_LABELS[order.shippingName] ?? order.shippingName}
                    </span>
                  </div>
                  {order.shipment ? (
                    <>
                      <div className="flex items-center justify-between">
                        <span className="text-muted-foreground">ສະຖານະ</span>
                        <Badge variant="secondary">
                          {SHIPMENT_STATUS_LABELS[order.shipment.status] ?? order.shipment.status}
                        </Badge>
                      </div>
                      {order.shipment.trackingNumber && (
                        <div className="flex items-center justify-between">
                          <span className="text-muted-foreground">ເລກຕິດຕາມ</span>
                          <span className="font-mono font-medium">
                            {order.shipment.trackingNumber}
                          </span>
                        </div>
                      )}
                      {order.shipment.shippedAt && (
                        <div className="flex items-center justify-between">
                          <span className="text-muted-foreground">ວັນຈັດສົ່ງ</span>
                          <span>{fmtDate(order.shipment.shippedAt)}</span>
                        </div>
                      )}
                      {order.shipment.deliveredAt && (
                        <div className="flex items-center justify-between">
                          <span className="text-muted-foreground">ວັນທີ່ຮັບ</span>
                          <span>{fmtDate(order.shipment.deliveredAt)}</span>
                        </div>
                      )}
                    </>
                  ) : (
                    <p className="text-muted-foreground">ຍັງບໍ່ໄດ້ສ້າງຂໍ້ມູນຂົນສົ່ງ</p>
                  )}
                </div>
              </Section>

              {/* Payment */}
              {order.transaction && (
                <Section icon={<WalletIcon className="h-4 w-4" />} title="ການຊຳລະເງິນ">
                  <div className="text-sm space-y-2">
                    <div className="flex items-center justify-between">
                      <span className="text-muted-foreground">ວິທີຊຳລະ</span>
                      <span className="font-medium">
                        {PAYMENT_METHOD_LABELS[order.transaction.paymentMethod] ??
                          order.transaction.paymentMethod}
                      </span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-muted-foreground">ສະຖານະ</span>
                      <Badge
                        variant={
                          order.transaction.status === "COMPLETED"
                            ? "success"
                            : order.transaction.status === "FAILED"
                              ? "destructive"
                              : "warning"
                        }
                      >
                        {TRANSACTION_STATUS_LABELS[order.transaction.status] ??
                          order.transaction.status}
                      </Badge>
                    </div>
                    {order.transaction.bankType && (
                      <div className="flex items-center justify-between">
                        <span className="text-muted-foreground">ທະນາຄານ</span>
                        <span>{order.transaction.bankType}</span>
                      </div>
                    )}
                    {order.transaction.verifiedAt && (
                      <div className="flex items-center justify-between">
                        <span className="text-muted-foreground">ຢືນຢັນເມື່ອ</span>
                        <span>{fmtDate(order.transaction.verifiedAt)}</span>
                      </div>
                    )}
                    {order.transaction.slipUrl && (
                      <div className="mt-3">
                        <p className="mb-2 text-muted-foreground">ໃບຮັບເງິນ</p>
                        <a
                          href={order.transaction.slipUrl}
                          target="_blank"
                          rel="noreferrer"
                          className="block overflow-hidden rounded-lg border"
                        >
                          <img
                            src={order.transaction.slipUrl}
                            alt="ໃບຮັບເງິນ"
                            className="w-full max-w-xs object-contain"
                          />
                        </a>
                      </div>
                    )}
                  </div>
                </Section>
              )}
            </div>
          )}
        </div>
      </div>
    </CustomerAuthGuard>
  );
}
