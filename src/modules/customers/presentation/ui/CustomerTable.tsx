import { usePermissions } from "@/modules/auth/presentation/model/usePermissions";
import type { RowAction } from "@/shared/ui/RowActions";
import { RowActions } from "@/shared/ui/RowActions";
import { confirm, DataTable, type TanstackReactTable } from "@devhop/ui";
import { BanIcon, EyeIcon, ShieldCheckIcon } from "lucide-react";
import { formatDistanceToNow } from "date-fns";
import type { CustomerDTO } from "../../domain/contracts/customer.contract";
import { CustomerStatusBadge } from "./CustomerStatusBadge";

type Props = {
  data: CustomerDTO[];
  isLoading?: boolean;
  totalCount: number;
  offset: number;
  limit: number;
  onPaginationChange: (offset: number, limit: number) => void;
  onView: (customer: CustomerDTO) => void;
  onBan: (id: string) => void;
  onUnban: (id: string) => void;
};

export function CustomerTable({
  data,
  isLoading,
  totalCount,
  offset,
  limit,
  onPaginationChange,
  onView,
  onBan,
  onUnban,
}: Props) {
  const { has } = usePermissions();
  const canUpdate = has("customers:update");

  const columns: TanstackReactTable.ColumnDef<CustomerDTO>[] = [
    {
      id: "customer",
      header: "ລູກຄ້າ",
      cell: ({ row }) => (
        <div>
          <p className="font-medium">{row.original.name}</p>
          <p className="text-xs text-muted-foreground">{row.original.email}</p>
        </div>
      ),
    },
    {
      accessorKey: "phone",
      header: "ເບີໂທ",
      cell: ({ row }) => (
        <span className="text-sm">{row.original.phone ?? "-"}</span>
      ),
    },
    {
      accessorKey: "isActive",
      header: "ສະຖານະ",
      cell: ({ row }) => (
        <CustomerStatusBadge isActive={row.original.isActive} />
      ),
    },
    {
      accessorKey: "createdAt",
      header: "ສະໝັກເມື່ອ",
      cell: ({ row }) => (
        <span className="text-sm text-muted-foreground">
          {formatDistanceToNow(new Date(row.original.createdAt), {
            addSuffix: true,
          })}
        </span>
      ),
    },
    {
      id: "actions",
      header: "",
      size: 60,
      cell: ({ row }) => {
        const c = row.original;
        const actions: RowAction[] = [
          {
            label: "ເບິ່ງລາຍລະອຽດ",
            icon: <EyeIcon className="h-4 w-4" />,
            onClick: () => onView(c),
          },
          ...(canUpdate && c.isActive
            ? [
                {
                  label: "ລະງັບລູກຄ້າ",
                  icon: <BanIcon className="h-4 w-4" />,
                  variant: "destructive" as const,
                  onClick: async () => {
                    const ok = await confirm({
                      title: "ລະງັບລູກຄ້າ?",
                      description: `ຕ້ອງການລະງັບ "${c.name}" ແທ້ບໍ?`,
                      actionText: "ລະງັບ",
                      ActionProps: { variant: "destructive" },
                    });
                    if (ok) onBan(c.id);
                  },
                },
              ]
            : []),
          ...(canUpdate && !c.isActive
            ? [
                {
                  label: "ກູ້ຄືນລູກຄ້າ",
                  icon: <ShieldCheckIcon className="h-4 w-4" />,
                  onClick: async () => {
                    const ok = await confirm({
                      title: "ກູ້ຄືນລູກຄ້າ?",
                      description: `ຕ້ອງການກູ້ຄືນ "${c.name}" ແທ້ບໍ?`,
                      actionText: "ກູ້ຄືນ",
                    });
                    if (ok) onUnban(c.id);
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
