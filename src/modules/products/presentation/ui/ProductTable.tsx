import { usePermissions } from "@/modules/auth/presentation/model/usePermissions";
import { AppImage } from "@/shared/ui/AppImage";
import type { RowAction } from "@/shared/ui/RowActions";
import { RowActions } from "@/shared/ui/RowActions";
import { Badge, confirm, createSortableColumn, DataTable, type TanstackReactTable } from "@devhop/ui";
import { EditIcon, TrashIcon } from "lucide-react";
import type { ProductListResult } from "../api/client";
import { StockBadge } from "./StockBadge";

type ProductRow = ProductListResult["data"][number];

type Props = {
  data: ProductRow[];
  isLoading?: boolean;
  totalCount: number;
  offset: number;
  limit: number;
  onPaginationChange: (offset: number, limit: number) => void;
  onEdit: (p: ProductRow) => void;
  onDelete: (id: string) => void;
};

export function ProductTable({
  data,
  isLoading,
  totalCount,
  offset,
  limit,
  onPaginationChange,
  onEdit,
  onDelete,
}: Props) {
  const { has } = usePermissions();

  const columns: TanstackReactTable.ColumnDef<ProductRow>[] = [
    {
      id: "image",
      header: "ຮູບ",
      size: 60,
      cell: ({ row }) => (
        <div className="h-10 w-10 overflow-hidden rounded-md border bg-muted">
          <AppImage
            src={row.original.mainImage?.url ?? null}
            alt={row.original.name}
            className="h-full w-full"
            fit="cover"
          />
        </div>
      ),
    },
    createSortableColumn<ProductRow>("name", "ຊື່ສິນຄ້າ", {
      cell: ({ row }) => (
        <div>
          <p className="font-medium">{row.original.name}</p>
          {row.original.categoryName && (
            <p className="text-muted-foreground text-xs">{row.original.categoryName}</p>
          )}
        </div>
      ),
    }),
    createSortableColumn<ProductRow>("basePrice", "ລາຄາ", {
      size: 120,
      cell: ({ row }) => (
        <span className="font-medium">
          {Number(row.original.basePrice).toLocaleString()} ₭
        </span>
      ),
    }),
    {
      id: "stock",
      header: "Stock",
      size: 110,
      cell: ({ row }) => (
        <StockBadge
          quantity={row.original.quantity}
          reservedQty={row.original.reservedQty}
        />
      ),
    },
    createSortableColumn<ProductRow>("isActive", "ສະຖານະ", {
      size: 100,
      cell: ({ row }) =>
        row.original.isActive ? (
          <Badge variant="success">ເປີດ</Badge>
        ) : (
          <Badge variant="secondary">ປິດ</Badge>
        ),
    }),
    {
      id: "actions",
      header: "",
      size: 80,
      cell: ({ row }) => {
        const actions: RowAction[] = [
          ...(has("products:update")
            ? [{ label: "ແກ້ໄຂ", icon: <EditIcon className="h-3.5 w-3.5" />, onClick: () => onEdit(row.original) } satisfies RowAction]
            : []),
          ...(has("products:delete")
            ? [{
                label: "ລຶບ",
                icon: <TrashIcon className="h-3.5 w-3.5" />,
                variant: "destructive" as const,
                onClick: async () => {
                  const ok = await confirm({
                    title: "ລຶບສິນຄ້າ",
                    description: `ລຶບ "${row.original.name}" ແທ້ບໍ່?`,
                    actionText: "ລຶບ",
                  });
                  if (ok) onDelete(row.original.id);
                },
              } satisfies RowAction]
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
      isLoading={isLoading}
      totalCount={totalCount}
      offset={offset}
      limit={limit}
      enableSorting={false}
      onPaginationChange={(p) => onPaginationChange(p.offset, p.limit)}
    />
  );
}
