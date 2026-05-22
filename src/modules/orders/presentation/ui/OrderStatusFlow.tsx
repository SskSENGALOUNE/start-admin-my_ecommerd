import { cn } from "@devhop/ui";
import { CheckCircleIcon, CircleIcon, XCircleIcon } from "lucide-react";
import type { OrderStatus } from "../../domain/contracts/order.contract";

const FLOW_STEPS: { status: OrderStatus; label: string }[] = [
  { status: "PENDING", label: "ລໍຖ້າ" },
  { status: "CONFIRMED", label: "ຢືນຢັນ" },
  { status: "PROCESSING", label: "ດຳເນີນການ" },
  { status: "SHIPPED", label: "ຈັດສົ່ງ" },
  { status: "DELIVERED", label: "ສົ່ງຮອດ" },
];

const STEP_ORDER: Record<OrderStatus, number> = {
  PENDING: 0,
  CONFIRMED: 1,
  PROCESSING: 2,
  SHIPPED: 3,
  DELIVERED: 4,
  CANCELLED: -1,
  REFUNDED: 5,
};

export function OrderStatusFlow({ status }: { status: OrderStatus }) {
  const currentStep = STEP_ORDER[status];
  const isCancelled = status === "CANCELLED";
  const isRefunded = status === "REFUNDED";

  if (isCancelled) {
    return (
      <div className="flex items-center gap-2 rounded-lg border border-destructive/30 bg-destructive/10 p-3 text-destructive">
        <XCircleIcon className="h-5 w-5 shrink-0" />
        <span className="text-sm font-medium">ຄຳສັ່ງຊື້ຖືກຍົກເລີກ</span>
      </div>
    );
  }

  if (isRefunded) {
    return (
      <div className="flex items-center gap-2 rounded-lg border p-3 text-muted-foreground">
        <CheckCircleIcon className="h-5 w-5 shrink-0" />
        <span className="text-sm font-medium">ຄືນເງິນສຳເລັດ</span>
      </div>
    );
  }

  return (
    <div className="flex items-center gap-0">
      {FLOW_STEPS.map((step, i) => {
        const stepIndex = STEP_ORDER[step.status];
        const isDone = currentStep > stepIndex;
        const isCurrent = currentStep === stepIndex;
        const isLast = i === FLOW_STEPS.length - 1;

        return (
          <div key={step.status} className="flex items-center">
            <div className="flex flex-col items-center gap-1">
              <div
                className={cn(
                  "flex h-8 w-8 items-center justify-center rounded-full border-2 transition-colors",
                  isDone
                    ? "border-primary bg-primary text-primary-foreground"
                    : isCurrent
                      ? "border-primary bg-background text-primary"
                      : "border-muted bg-muted text-muted-foreground",
                )}
              >
                {isDone ? (
                  <CheckCircleIcon className="h-5 w-5" />
                ) : (
                  <CircleIcon className="h-4 w-4" />
                )}
              </div>
              <span
                className={cn(
                  "text-xs",
                  isCurrent ? "font-semibold text-primary" : "text-muted-foreground",
                )}
              >
                {step.label}
              </span>
            </div>
            {!isLast && (
              <div
                className={cn(
                  "mb-4 h-0.5 w-8 sm:w-12 lg:w-16",
                  isDone ? "bg-primary" : "bg-muted",
                )}
              />
            )}
          </div>
        );
      })}
    </div>
  );
}
