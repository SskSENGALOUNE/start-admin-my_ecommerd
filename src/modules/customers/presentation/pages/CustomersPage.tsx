import { Header } from "@/app/layout/Header";
import { Main } from "@/app/layout/Main";
import {
  Button,
  Input,
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@devhop/ui";
import { SearchIcon, XIcon } from "lucide-react";
import { useState } from "react";
import { useNavigate } from "@tanstack/react-router";
import type { CustomerDTO } from "../../domain/contracts/customer.contract";
import {
  useBanCustomer,
  useCustomersQuery,
  useUnbanCustomer,
} from "../api/queries";
import { CustomerTable } from "../ui/CustomerTable";

type StatusFilter = "ALL" | "active" | "banned";

export function CustomersPage() {
  const nav = useNavigate();
  const [offset, setOffset] = useState(0);
  const [limit, setLimit] = useState(20);
  const [searchInput, setSearchInput] = useState("");
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState<StatusFilter>("ALL");

  const isActiveParam =
    statusFilter === "active"
      ? true
      : statusFilter === "banned"
        ? false
        : undefined;

  const list = useCustomersQuery({
    offset,
    limit,
    search: search || undefined,
    isActive: isActiveParam,
  });

  const banMutation = useBanCustomer();
  const unbanMutation = useUnbanCustomer();

  function handleSearch(e: React.FormEvent) {
    e.preventDefault();
    setSearch(searchInput);
    setOffset(0);
  }

  function handleClearSearch() {
    setSearchInput("");
    setSearch("");
    setOffset(0);
  }

  function handleView(customer: CustomerDTO) {
    nav({ to: "/app/customers/$id", params: { id: customer.id } });
  }

  return (
    <>
      <Header />
      <Main>
        {/* Toolbar */}
        <div className="mb-4 flex items-center justify-between">
          <div>
            <h1 className="text-xl font-semibold">ລູກຄ້າ</h1>
            <p className="text-sm text-muted-foreground">
              ຈັດການລູກຄ້າທັງໝົດ
            </p>
          </div>
          <div className="text-sm text-muted-foreground">
            ທັງໝົດ {list.data?.meta.total ?? 0} ຄົນ
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
                placeholder="ຄົ້ນຫາຊື່, ອີເມວ, ເບີໂທ..."
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

          <Select
            value={statusFilter}
            onValueChange={(v) => {
              setStatusFilter(v as StatusFilter);
              setOffset(0);
            }}
          >
            <SelectTrigger className="w-full sm:w-44">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="ALL">ທຸກສະຖານະ</SelectItem>
              <SelectItem value="active">ເປີດໃຊ້ງານ</SelectItem>
              <SelectItem value="banned">ຖືກລະງັບ</SelectItem>
            </SelectContent>
          </Select>
        </div>

        {/* Table */}
        <div className="rounded-xl border bg-card">
          <CustomerTable
            data={list.data?.data ?? []}
            isLoading={list.isLoading}
            totalCount={list.data?.meta.total ?? 0}
            offset={offset}
            limit={limit}
            onPaginationChange={(o, l) => {
              setOffset(o);
              setLimit(l);
            }}
            onView={handleView}
            onBan={(id) => banMutation.mutate(id)}
            onUnban={(id) => unbanMutation.mutate(id)}
          />
        </div>
      </Main>
    </>
  );
}
