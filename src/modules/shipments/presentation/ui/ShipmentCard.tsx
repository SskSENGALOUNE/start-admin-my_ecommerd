import { Badge, Button, Card, CardContent, CardHeader, CardTitle, Modal, confirm } from "@devhop/ui";
import { PackageCheckIcon, TruckIcon } from "lucide-react";
import { useState } from "react";
import type { ShippingType } from "../../domain/contracts/shipment.contract";
import {
  useCreateShipment,
  useMarkDelivered,
  useUpdateTracking,
} from "../api/queries";
import { CreateShipmentForm } from "./CreateShipmentForm";
import { TrackingForm } from "./TrackingForm";

interface ShipmentData {
  id: string;
  orderId: string;
  shippingType: string;
  trackingNumber: string | null;
  status: "PREPARING" | "SHIPPED" | "DELIVERED";
  shippedAt: Date | null;
  deliveredAt: Date | null;
  note: string | null;
}

interface Props {
  orderId: string;
  orderStatus: string;
  defaultShippingType?: ShippingType;
  shipment: ShipmentData | null;
  canManage?: boolean;
}

const STATUS_LABELS: Record<string, { label: string; variant: "default" | "secondary" | "success" | "outline" }> = {
  PREPARING: { label: "ກຳລັງກ່ຽງພ້ອມ", variant: "secondary" },
  SHIPPED: { label: "ຈັດສົ່ງແລ້ວ", variant: "default" },
  DELIVERED: { label: "ສົ່ງຮອດແລ້ວ", variant: "success" },
};

export function ShipmentCard({ orderId, orderStatus, defaultShippingType, shipment, canManage = false }: Props) {
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [showTrackingModal, setShowTrackingModal] = useState(false);

  const createMutation = useCreateShipment();
  const trackingMutation = useUpdateTracking(orderId);
  const deliveredMutation = useMarkDelivered(orderId);

  const canCreate = canManage && orderStatus === "PROCESSING" && !shipment;
  const canAddTracking = canManage && shipment?.status === "PREPARING";
  const canMarkDelivered = canManage && shipment?.status === "SHIPPED";

  async function handleCreate(values: Parameters<typeof createMutation.mutateAsync>[0]) {
    await createMutation.mutateAsync(values);
    setShowCreateModal(false);
  }

  async function handleTracking(values: { trackingNumber: string; note?: string }) {
    if (!shipment) return;
    await trackingMutation.mutateAsync({ id: shipment.id, input: values });
    setShowTrackingModal(false);
  }

  async function handleMarkDelivered() {
    if (!shipment) return;
    const ok = await confirm({
      title: "ຢືນຢັນການຮັບສິນຄ້າ?",
      description: "ລູກຄ້າໄດ້ຮັບສິນຄ້າແລ້ວໃຊ່ບໍ?",
      actionText: "ຢືນຢັນ",
    });
    if (!ok) return;
    await deliveredMutation.mutateAsync(shipment.id);
  }

  return (
    <>
      <Card>
        <CardHeader className="flex flex-row items-center justify-between pb-3">
          <CardTitle className="text-base">ການຈັດສົ່ງ</CardTitle>
          <div className="flex gap-2">
            {canCreate && (
              <Button size="sm" onClick={() => setShowCreateModal(true)}>
                <TruckIcon className="mr-1.5 h-4 w-4" />
                ສ້າງ Shipment
              </Button>
            )}
            {canAddTracking && (
              <Button size="sm" onClick={() => setShowTrackingModal(true)}>
                <TruckIcon className="mr-1.5 h-4 w-4" />
                ໃສ່ Tracking
              </Button>
            )}
            {canMarkDelivered && (
              <Button
                size="sm"
                variant="secondary"
                onClick={handleMarkDelivered}
                disabled={deliveredMutation.isPending}
              >
                <PackageCheckIcon className="mr-1.5 h-4 w-4" />
                ຢືນຢັນຮັບສິນຄ້າ
              </Button>
            )}
          </div>
        </CardHeader>

        <CardContent>
          {!shipment ? (
            <p className="text-sm text-muted-foreground">
              {orderStatus === "PROCESSING"
                ? "ຍັງບໍ່ໄດ້ສ້າງ Shipment — ກົດ \"ສ້າງ Shipment\" ເພື່ອເລີ່ມ"
                : "ຍັງບໍ່ມີຂໍ້ມູນການຈັດສົ່ງ"}
            </p>
          ) : (
            <div className="space-y-2.5 text-sm">
              <div className="flex justify-between">
                <span className="text-muted-foreground">ສະຖານະ</span>
                {(() => {
                  const cfg = STATUS_LABELS[shipment.status];
                  return cfg ? (
                    <Badge variant={cfg.variant as "default"}>{cfg.label}</Badge>
                  ) : null;
                })()}
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">ຂົນສົ່ງ</span>
                <span>{shipment.shippingType.replace(/_/g, " ")}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Tracking</span>
                <span className="font-mono font-medium">
                  {shipment.trackingNumber ?? (
                    <span className="text-muted-foreground italic">ຍັງບໍ່ໄດ້ໃສ່</span>
                  )}
                </span>
              </div>
              {shipment.shippedAt && (
                <div className="flex justify-between">
                  <span className="text-muted-foreground">ວັນທີຈັດສົ່ງ</span>
                  <span>{new Date(shipment.shippedAt).toLocaleDateString("lo-LA")}</span>
                </div>
              )}
              {shipment.deliveredAt && (
                <div className="flex justify-between">
                  <span className="text-muted-foreground">ວັນທີຮັບສິນຄ້າ</span>
                  <span>{new Date(shipment.deliveredAt).toLocaleDateString("lo-LA")}</span>
                </div>
              )}
              {shipment.note && (
                <div>
                  <span className="text-muted-foreground">ໝາຍເຫດ:</span>
                  <p className="mt-0.5">{shipment.note}</p>
                </div>
              )}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Create Shipment Modal */}
      <Modal
        open={showCreateModal}
        onOpenChange={(open) => !open && setShowCreateModal(false)}
        title="ສ້າງ Shipment"
      >
        <CreateShipmentForm
          orderId={orderId}
          defaultShippingType={defaultShippingType}
          onSubmit={handleCreate}
          isLoading={createMutation.isPending}
        />
      </Modal>

      {/* Tracking Form Modal */}
      <Modal
        open={showTrackingModal}
        onOpenChange={(open) => !open && setShowTrackingModal(false)}
        title="ໃສ່ເລກ Tracking"
      >
        <TrackingForm
          onSubmit={handleTracking}
          isLoading={trackingMutation.isPending}
        />
      </Modal>
    </>
  );
}
