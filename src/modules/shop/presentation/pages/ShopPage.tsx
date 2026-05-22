import { Input, Skeleton } from "@devhop/ui";
import { SearchIcon, XIcon } from "lucide-react";
import { useState } from "react";
import { useCart } from "@/modules/cart/presentation/api/queries";
import { useShopCategories, useShopProducts } from "../api/queries";
import { ProductCard } from "../ui/ProductCard";
import { ShopNavbar } from "../ui/ShopNavbar";
import { cn } from "@devhop/ui";

const LIMIT = 24;

export function ShopPage() {
  const [search, setSearch] = useState("");
  const [searchInput, setSearchInput] = useState("");
  const [categoryId, setCategoryId] = useState<string | undefined>();
  const [offset, setOffset] = useState(0);

  const categories = useShopCategories();
  const products = useShopProducts({ limit: LIMIT, offset, search: search || undefined, categoryId });
  const { data: cart } = useCart();

  const totalPages = Math.ceil((products.data?.meta.total ?? 0) / LIMIT);
  const currentPage = Math.floor(offset / LIMIT) + 1;

  function handleSearch(e: React.FormEvent) {
    e.preventDefault();
    setSearch(searchInput);
    setOffset(0);
  }

  function handleCategory(id: string | undefined) {
    setCategoryId(id);
    setOffset(0);
  }

  return (
    <div className="min-h-screen bg-background">
      <ShopNavbar cartCount={cart?.totalItems} />

      <main className="mx-auto max-w-6xl px-4 py-8">
        {/* Search */}
        <form onSubmit={handleSearch} className="mb-6 flex gap-2">
          <div className="relative flex-1">
            <SearchIcon className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
            <Input
              value={searchInput}
              onChange={(e) => setSearchInput(e.target.value)}
              placeholder="ຄົ້ນຫາສິນຄ້າ..."
              className="pl-9 pr-8"
            />
            {searchInput && (
              <button
                type="button"
                onClick={() => { setSearchInput(""); setSearch(""); setOffset(0); }}
                className="absolute right-2 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
              >
                <XIcon className="h-4 w-4" />
              </button>
            )}
          </div>
          <button
            type="submit"
            className="rounded-lg bg-primary px-5 py-2 text-sm font-medium text-primary-foreground hover:opacity-90"
          >
            ຄົ້ນຫາ
          </button>
        </form>

        {/* Category Filter */}
        <div className="mb-6 flex flex-wrap gap-2">
          <button
            type="button"
            onClick={() => handleCategory(undefined)}
            className={cn(
              "rounded-full border px-4 py-1.5 text-sm font-medium transition-colors",
              !categoryId
                ? "border-primary bg-primary text-primary-foreground"
                : "hover:bg-muted",
            )}
          >
            ທັງໝົດ
          </button>
          {categories.data?.data.map((cat) => (
            <button
              key={cat.id}
              type="button"
              onClick={() => handleCategory(cat.id)}
              className={cn(
                "rounded-full border px-4 py-1.5 text-sm font-medium transition-colors",
                categoryId === cat.id
                  ? "border-primary bg-primary text-primary-foreground"
                  : "hover:bg-muted",
              )}
            >
              {cat.name}
            </button>
          ))}
        </div>

        {/* Result count */}
        {!products.isLoading && (
          <p className="mb-4 text-sm text-muted-foreground">
            {products.data?.meta.total ?? 0} ລາຍການ
            {search && ` ສຳລັບ "${search}"`}
          </p>
        )}

        {/* Product Grid */}
        {products.isLoading ? (
          <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-4">
            {Array.from({ length: 8 }).map((_, i) => (
              // biome-ignore lint/suspicious/noArrayIndexKey: skeleton
              <div key={i} className="overflow-hidden rounded-2xl border">
                <Skeleton className="aspect-square w-full" />
                <div className="space-y-2 p-3">
                  <Skeleton className="h-4 w-3/4" />
                  <Skeleton className="h-5 w-1/2" />
                </div>
              </div>
            ))}
          </div>
        ) : products.data?.data.length === 0 ? (
          <div className="flex flex-col items-center gap-3 py-24 text-center">
            <p className="text-lg font-medium">ບໍ່ພົບສິນຄ້າ</p>
            <p className="text-sm text-muted-foreground">
              ລອງຄົ້ນຫາດ້ວຍຄຳອື່ນ ຫຼື ເລືອກໝວດໝູ່ອື່ນ
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-4">
            {products.data?.data.map((p) => (
              <ProductCard key={p.id} product={p} />
            ))}
          </div>
        )}

        {/* Pagination */}
        {totalPages > 1 && (
          <div className="mt-8 flex items-center justify-center gap-2">
            <button
              type="button"
              disabled={currentPage <= 1}
              onClick={() => setOffset((p) => Math.max(0, p - LIMIT))}
              className="rounded-lg border px-4 py-2 text-sm font-medium disabled:opacity-40 hover:bg-muted"
            >
              ← ກ່ອນ
            </button>
            <span className="text-sm text-muted-foreground">
              ໜ້າ {currentPage} / {totalPages}
            </span>
            <button
              type="button"
              disabled={currentPage >= totalPages}
              onClick={() => setOffset((p) => p + LIMIT)}
              className="rounded-lg border px-4 py-2 text-sm font-medium disabled:opacity-40 hover:bg-muted"
            >
              ຕໍ່ →
            </button>
          </div>
        )}
      </main>

      {/* Footer */}
      <footer className="mt-12 border-t py-6 text-center text-sm text-muted-foreground">
        © {new Date().getFullYear()} LaoShop
      </footer>
    </div>
  );
}
