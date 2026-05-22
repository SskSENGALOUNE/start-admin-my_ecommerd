import { Header } from "@/app/layout/Header";
import { Main } from "@/app/layout/Main";
import { Button, Input, Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@devhop/ui";
import { SearchIcon, XIcon } from "lucide-react";
import { useState } from "react";
import { useNavigate } from "@tanstack/react-router";
import type { OrderDTO, OrderStatus } from "../../domain/contracts/order.contract";
import { useCancelOrder, useOrdersQuery } from "../api/queries";
import { OrderTable } from "../ui/OrderTable";
import { getOrderStatusLabel } from "../ui/OrderStatusBadge";

const STATUS_OPTIONS: { value: OrderStatus | "ALL"; label: string }[] = [
  { value: "ALL", label: "ທຸກສະຖານະ" },
  { value: "PENDING", label: "ລໍຖ້າ" },
  { value: "CONFIRMED", label: "ຢືນຢັນແລ້ວ" },
  { value: "PROCESSING", label: "ກຳລັງດຳເນີນ" },
  { value: "SHIPPED", label: "ຈັດສົ່ງແລ້ວ" },
  { value: "DELIVERED", label: "ສົ່ງຮອດແລ້ວ" },
  { value: "CANCELLED", label: "ຍົກເລີກ" },
  { value: "REFUNDED", label: "ຄືນເງິນ" },
];

export function OrdersPage() {
  const nav = useNavigate();
  const [offset, setOffset] = useState(0);
  const [limit, setLimit] = useState(20);
  const [searchInput, setSearchInput] = useState("");
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState<OrderStatus | "ALL">("ALL");

  const list = useOrdersQuery({
    offset,
    limit,
    search: search || undefined,
    status: statusFilter === "ALL" ? undefined : statusFilter,
  });

  const cancelMutation = useCancelOrder();

  function handleSearch(e: React.FormEvent) {
    e.preventDefault();
    setSearch(searchInput);
    setOffset(0);
  }

  function handleStatusChange(val: string) {
    setStatusFilter(val as OrderStatus | "ALL");
    setOffset(0);
  }

  function handleClearSearch() {
    setSearchInput("");
    setSearch("");
    setOffset(0);
  }

  function handleView(order: OrderDTO) {
    nav({ to: "/app/orders/$id", params: { id: order.id } });
  }

  return (
    <>
      <Header />
      <Main>
        {/* Toolbar */}
        <div className="mb-4 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h1 className="text-xl font-semibold">ຄຳສັ່ງຊື້</h1>
            <p className="text-sm text-muted-foreground">
              ຈັດການຄຳສັ່ງຊື້ ແລະ ຕິດຕາມສະຖານະ
            </p>
          </div>
        </div>

        {/* Filters */}
        <div className="mb-4 flex flex-col gap-2 sm:flex-row">
          <form onSubmit={handleSearch} className="flex flex-1 gap-2">
            <div className="relative flex-1">
              <SearchIcon className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
              <Input
                value={searchInput}
                onChange={(e) => setSearchInput(e.target.value)}
                placeholder="ຄົ້ນຫາເລກທີ ຫຼື ຊື່ລູກຄ້າ..."
                className="pl-9 pr-8"
              />
              {searchInput && (
                <button
                  type="button"
                  onClick={handleClearSearch}
                  className="absolute right-2 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
                >
                  <XIcon className="h-4 w-4" />
                </button>
              )}
            </div>
            <Button type="submit" variant="secondary">
              ຄົ້ນຫາ
            </Button>
          </form>

          <Select value={statusFilter} onValueChange={handleStatusChange}>
            <SelectTrigger className="w-full sm:w-48">
              <SelectValue placeholder="ທຸກສະຖານະ" />
            </SelectTrigger>
            <SelectContent>
              {STATUS_OPTIONS.map((opt) => (
                <SelectItem key={opt.value} value={opt.value}>
                  {opt.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        {/* Table */}
        <div className="rounded-xl border bg-card">
          <OrderTable
            data={list.data?.data ?? []}
            isLoading={list.isLoading}
            totalCount={list.data?.meta?.total ?? 0}
            offset={offset}
            limit={limit}
            onPaginationChange={(o, l) => {
              setOffset(o);
              setLimit(l);
            }}
            onView={handleView}
            onCancel={(id) => cancelMutation.mutate(id)}
          />
        </div>
      </Main>
    </>
  );
}
