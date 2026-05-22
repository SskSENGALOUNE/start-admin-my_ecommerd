import { Header } from "@/app/layout/Header";
import { Main } from "@/app/layout/Main";
import { useActionPermission } from "@/modules/auth/presentation/model/useActionPermission";
import { Button, Input } from "@devhop/ui";
import { PlusIcon, SearchIcon } from "lucide-react";
import { useState } from "react";
import { useNavigate } from "@tanstack/react-router";
import { useDeleteProduct, useProductsQuery } from "../api/queries";
import { ProductTable } from "../ui/ProductTable";
import type { ProductListResult } from "../api/client";

type ProductRow = ProductListResult["data"][number];

export function ProductsPage() {
  const nav = useNavigate();
  const [offset, setOffset] = useState(0);
  const [limit, setLimit] = useState(20);
  const [search, setSearch] = useState("");
  const [searchInput, setSearchInput] = useState("");

  const list = useProductsQuery({ offset, limit, search: search || undefined });
  const deleteMutation = useDeleteProduct();
  const canCreate = useActionPermission(["products:create"]);

  function handleSearch(e: React.FormEvent) {
    e.preventDefault();
    setSearch(searchInput);
    setOffset(0);
  }

  function handleEdit(p: ProductRow) {
    nav({ to: "/app/products/$id", params: { id: p.id } });
  }

  return (
    <>
      <Header />
      <Main>
        {/* Toolbar */}
        <div className="mb-4 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h1 className="text-xl font-semibold">ສິນຄ້າ</h1>
            <p className="text-sm text-muted-foreground">ຈັດການສິນຄ້າ, Variant ແລະ Stock</p>
          </div>
          {canCreate && (
            <Button onClick={() => nav({ to: "/app/products/create" })}>
              <PlusIcon className="mr-2 h-4 w-4" />
              ເພີ່ມສິນຄ້າ
            </Button>
          )}
        </div>

        {/* Search */}
        <form onSubmit={handleSearch} className="mb-4 flex gap-2">
          <div className="relative flex-1">
            <SearchIcon className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
            <Input
              value={searchInput}
              onChange={(e) => setSearchInput(e.target.value)}
              placeholder="ຄົ້ນຫາຊື່ສິນຄ້າ..."
              className="pl-9"
            />
          </div>
          <Button type="submit" variant="outline">ຄົ້ນຫາ</Button>
        </form>

        {/* Table */}
        <div className="rounded-xl border bg-card">
          <ProductTable
            data={list.data?.data ?? []}
            isLoading={list.isLoading}
            totalCount={list.data?.meta?.total ?? 0}
            offset={offset}
            limit={limit}
            onPaginationChange={(o, l) => { setOffset(o); setLimit(l); }}
            onEdit={handleEdit}
            onDelete={(id) => deleteMutation.run(id)}
          />
        </div>
      </Main>
    </>
  );
}
