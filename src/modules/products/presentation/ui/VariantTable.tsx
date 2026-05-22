import { usePermissions } from "@/modules/auth/presentation/model/usePermissions";
import type { RowAction } from "@/shared/ui/RowActions";
import { RowActions } from "@/shared/ui/RowActions";
import { Badge, confirm, createSortableColumn, DataTable, type TanstackReactTable } from "@devhop/ui";
import { EditIcon, TrashIcon } from "lucide-react";
import type { VariantDTO } from "../../domain/contracts/variant.contract";

const COLOR_LABELS: Record<string, string> = {
  RED: "ແດງ", GREEN: "ຂຽວ", BLUE: "ຟ້າ", YELLOW: "ເຫຼືອງ",
  BLACK: "ດຳ", WHITE: "ຂາວ", GRAY: "ຂີ້ເຖົ່າ", PURPLE: "ມ່ວງ",
  ORANGE: "ສົ້ມ", PINK: "ບົວ", BROWN: "ນ້ຳຕານ", GOLD: "ທອງ", SILVER: "ເງິນ",
};

type Props = {
  data: VariantDTO[];
  isLoading?: boolean;
  basePrice: string;
  onEdit: (v: VariantDTO) => void;
  onDelete: (id: string) => void;
};

export function VariantTable({ data, isLoading, basePrice, onEdit, onDelete }: Props) {
  const { has } = usePermissions();

  const columns: TanstackReactTable.ColumnDef<VariantDTO>[] = [
    createSortableColumn<VariantDTO>("colorName", "ສີ", {
      size: 100,
      cell: ({ row }) => (
        <span>{COLOR_LABELS[row.original.colorName ?? ""] ?? row.original.colorName ?? "—"}</span>
      ),
    }),
    createSortableColumn<VariantDTO>("size", "ໄຊ", {
      size: 80,
      cell: ({ row }) => <span>{row.original.size ?? "—"}</span>,
    }),
    createSortableColumn<VariantDTO>("sku", "SKU", {
      size: 140,
      cell: ({ row }) => (
        <span className="font-mono text-xs">{row.original.sku ?? "—"}</span>
      ),
    }),
    createSortableColumn<VariantDTO>("price", "ລາຄາ", {
      size: 120,
      cell: ({ row }) => (
        <span>
          {row.original.price
            ? Number(row.original.price).toLocaleString() + " ₭"
            : `${Number(basePrice).toLocaleString()} ₭ (ຫຼັກ)`}
        </span>
      ),
    }),
    createSortableColumn<VariantDTO>("isActive", "ສະຖານະ", {
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
                    title: "ລຶບ Variant",
                    description: `ລຶບ Variant ສີ ${row.original.colorName ?? ""} ໄຊ ${row.original.size ?? "—"}?`,
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
      enableSorting={false}
      enablePagination={false}
    />
  );
}
