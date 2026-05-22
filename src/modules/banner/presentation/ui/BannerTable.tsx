import { usePermissions } from "@/modules/auth/presentation/model/usePermissions";
import { AppImage } from "@/shared/ui/AppImage";
import type { RowAction } from "@/shared/ui/RowActions";
import { RowActions } from "@/shared/ui/RowActions";
import {
  Badge,
  confirm,
  createSortableColumn,
  DataTable,
  type TanstackReactTable,
} from "@devhop/ui";
import { format } from "date-fns";
import { EditIcon, TrashIcon } from "lucide-react";
import type { BannerDTO } from "../../domain/contracts/banner.contract";

type Props = {
  data: BannerDTO[];
  isLoading?: boolean;
  totalCount: number;
  offset: number;
  limit: number;
  onPaginationChange: (offset: number, limit: number) => void;
  onEdit: (banner: BannerDTO) => void;
  onDelete: (id: string) => void;
};

export function BannerTable({
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

  const columns: TanstackReactTable.ColumnDef<BannerDTO>[] = [
    {
      id: "image",
      header: "ຮູບ",
      size: 120,
      cell: ({ row }) => (
        <div className="h-14 w-24 overflow-hidden rounded-md border bg-muted">
          <AppImage
            src={row.original.imageUrl}
            alt={row.original.title}
            className="size-full"
            fit="cover"
          />
        </div>
      ),
    },
    createSortableColumn<BannerDTO>("title", "ຊື່ Banner", {
      cell: ({ row }) => (
        <div>
          <p className="font-medium">{row.original.title}</p>
          {row.original.linkUrl && (
            <p className="text-muted-foreground text-xs truncate max-w-48">
              {row.original.linkUrl}
            </p>
          )}
        </div>
      ),
    }),
    createSortableColumn<BannerDTO>("order", "ລຳດັບ", {
      size: 80,
      cell: ({ row }) => (
        <span className="text-center font-mono text-sm">{row.original.order}</span>
      ),
    }),
    {
      id: "isActive",
      header: "ສະຖານະ",
      size: 100,
      cell: ({ row }) =>
        row.original.isActive ? (
          <Badge variant="default">ເປີດໃຊ້</Badge>
        ) : (
          <Badge variant="secondary">ປິດ</Badge>
        ),
    },
    createSortableColumn<BannerDTO>("createdAt", "ວັນທີສ້າງ", {
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
      cell: ({ row }) => {
        const actions: RowAction[] = [
          ...(has("banners:update")
            ? [
                {
                  label: "ແກ້ໄຂ",
                  icon: <EditIcon className="h-3.5 w-3.5" />,
                  onClick: () => onEdit(row.original),
                } satisfies RowAction,
              ]
            : []),
          ...(has("banners:delete")
            ? [
                {
                  label: "ລຶບ",
                  icon: <TrashIcon className="h-3.5 w-3.5" />,
                  variant: "destructive" as const,
                  onClick: async () => {
                    const ok = await confirm({
                      title: "ຢືນຢັນລຶບ Banner",
                      description: `ທ່ານຕ້ອງການລຶບ "${row.original.title}" ແທ້ບໍ່?`,
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
