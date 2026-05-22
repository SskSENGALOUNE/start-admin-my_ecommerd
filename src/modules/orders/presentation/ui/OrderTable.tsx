import { usePermissions } from "@/modules/auth/presentation/model/usePermissions";
import type { RowAction } from "@/shared/ui/RowActions";
import { RowActions } from "@/shared/ui/RowActions";
import { Badge, confirm, createSortableColumn, DataTable, type TanstackReactTable } from "@devhop/ui";
import { BanIcon, EyeIcon } from "lucide-react";
import { formatDistanceToNow } from "date-fns";
import type { OrderDTO } from "../../domain/contracts/order.contract";
import { OrderStatusBadge } from "./OrderStatusBadge";

type Props = {
  data: OrderDTO[];
  isLoading?: boolean;
  totalCount: number;
  offset: number;
  limit: number;
  onPaginationChange: (offset: number, limit: number) => void;
  onView: (order: OrderDTO) => void;
  onCancel: (id: string) => void;
};

export function OrderTable({
  data,
  isLoading,
  totalCount,
  offset,
  limit,
  onPaginationChange,
  onView,
  onCancel,
}: Props) {
  const { has } = usePermissions();
  const canUpdate = has("orders:update");

  const formatPrice = (v: string) =>
    Number(v).toLocaleString("lo-LA") + " ກີບ";

  const columns: TanstackReactTable.ColumnDef<OrderDTO>[] = [
    {
      accessorKey: "orderNumber",
      header: "ເລກທີ",
      cell: ({ row }) => (
        <span className="font-mono text-sm font-medium text-primary">
          {row.original.orderNumber}
        </span>
      ),
    },
    {
      id: "customer",
      header: "ລູກຄ້າ",
      cell: ({ row }) => (
        <div>
          <p className="font-medium">{row.original.customerName ?? "-"}</p>
          <p className="text-xs text-muted-foreground">
            {row.original.customerPhone ?? row.original.customerEmail ?? ""}
          </p>
        </div>
      ),
    },
    {
      accessorKey: "status",
      header: "ສະຖານະ",
      cell: ({ row }) => <OrderStatusBadge status={row.original.status} />,
    },
    {
      id: "shipping",
      header: "ຂົນສົ່ງ",
      cell: ({ row }) => (
        <Badge variant="outline" className="text-xs">
          {row.original.shippingName.replace(/_/g, " ")}
        </Badge>
      ),
    },
    {
      accessorKey: "totalAmount",
      header: "ຍອດລວມ",
      cell: ({ row }) => (
        <span className="font-medium">{formatPrice(row.original.totalAmount)}</span>
      ),
    },
    {
      accessorKey: "createdAt",
      header: "ວັນທີ",
      cell: ({ row }) => (
        <span className="text-sm text-muted-foreground">
          {formatDistanceToNow(new Date(row.original.createdAt), { addSuffix: true })}
        </span>
      ),
    },
    {
      id: "actions",
      header: "",
      size: 60,
      cell: ({ row }) => {
        const order = row.original;
        const canCancel =
          canUpdate &&
          (order.status === "PENDING" || order.status === "CONFIRMED");

        const actions: RowAction[] = [
          {
            label: "ເບິ່ງລາຍລະອຽດ",
            icon: <EyeIcon className="h-4 w-4" />,
            onClick: () => onView(order),
          },
          ...(canCancel
            ? [
                {
                  label: "ຍົກເລີກຄຳສັ່ງຊື້",
                  icon: <BanIcon className="h-4 w-4" />,
                  variant: "destructive" as const,
                  onClick: async () => {
                    const ok = await confirm({
                      title: "ຍົກເລີກຄຳສັ່ງຊື້?",
                      description: `ຕ້ອງການຍົກເລີກ ${order.orderNumber} ແທ້ບໍ?`,
                      actionText: "ຍົກເລີກຄຳສັ່ງຊື້",
                      ActionProps: { variant: "destructive" },
                    });
                    if (ok) onCancel(order.id);
                  },
                },
              ]
            : []),
        ];

        return <RowActions actions={actions} />;
      },
    },
  ];

  return (
    <DataTable
      columns={columns}
      data={data}
      loading={isLoading}
      manualPagination
      totalRows={totalCount}
      pageIndex={Math.floor(offset / limit)}
      pageSize={limit}
      onPaginationChange={(pageIndex, pageSize) => {
        onPaginationChange(pageIndex * pageSize, pageSize);
      }}
    />
  );
}
