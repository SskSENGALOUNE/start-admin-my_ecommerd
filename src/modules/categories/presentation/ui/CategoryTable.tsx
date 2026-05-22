import { usePermissions } from "@/modules/auth/presentation/model/usePermissions";
import type { RowAction } from "@/shared/ui/RowActions";
import { RowActions } from "@/shared/ui/RowActions";
import {
  confirm,
  createSortableColumn,
  DataTable,
  type TanstackReactTable,
} from "@devhop/ui";
import { format } from "date-fns";
import { EditIcon, TrashIcon } from "lucide-react";
import type { CategoryDTO } from "../../domain/contracts/category.contract";

type Props = {
  data: CategoryDTO[];
  isLoading?: boolean;
  totalCount: number;
  offset: number;
  limit: number;
  onPaginationChange: (offset: number, limit: number) => void;
  onEdit: (category: CategoryDTO) => void;
  onDelete: (id: string) => void;
};

export function CategoryTable({
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

  const columns: TanstackReactTable.ColumnDef<CategoryDTO>[] = [
    // ต้องใส่ cell ทุก column — DataTable ของ @devhop/ui ไม่รองรับ default TanStack cell ที่ใช้ renderValue
    createSortableColumn<CategoryDTO>("name", "ຊື່ໝວດໝູ່", {
      cell: ({ row }) => (
        <span className="font-medium">{row.original.name}</span>
      ),
    }),
    createSortableColumn<CategoryDTO>("createdAt", "ວັນທີສ້າງ", {
      size: 160,
      cell: ({ row }) => (
        <span className="text-muted-foreground text-sm">
          {format(new Date(row.original.createdAt), "dd/MM/yyyy HH:mm")}
        </span>
      ),
    }),
    {
      id: "actions",
      header: "",
      size: 80,
      // cell ที่ไม่ใช่ accessor column ต้องระบุ cell fn เองเสมอ
      cell: ({ row }) => {
        const actions: RowAction[] = [
          ...(has("categories:update")
            ? [
                {
                  label: "ແກ້ໄຂ",
                  icon: <EditIcon className="h-3.5 w-3.5" />,
                  onClick: () => onEdit(row.original),
                } satisfies RowAction,
              ]
            : []),
          ...(has("categories:delete")
            ? [
                {
                  label: "ລຶບ",
                  icon: <TrashIcon className="h-3.5 w-3.5" />,
                  variant: "destructive" as const,
                  onClick: async () => {
                    const ok = await confirm({
                      title: "ຢືນຢັນລຶບໝວດໝູ່",
                      description: `ທ່ານຕ້ອງການລຶບ "${row.original.name}" ແທ້ບໍ່?`,
                      actionText: "ລຶບ",
                    });
                    if (ok) onDelete(row.original.id);
                  },
                } satisfies RowAction,
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
      isLoading={isLoading}
      totalCount={totalCount}
      offset={offset}
      limit={limit}
      enableSorting={false}
      onPaginationChange={(p) => onPaginationChange(p.offset, p.limit)}
    />
  );
}
