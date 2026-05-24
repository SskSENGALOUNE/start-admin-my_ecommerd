import { useEffect, useRef, useState } from "react";
import { useNavigate } from "@tanstack/react-router";
import {
  ChevronLeftIcon,
  ChevronRightIcon,
  HeartIcon,
  SearchIcon,
  ShoppingCartIcon,
  UserIcon,
} from "lucide-react";
import { Skeleton } from "@devhop/ui";
import { AppImage } from "@/shared/ui/AppImage";
import { useCustomerSession } from "@/modules/customer-auth/presentation/model/useCustomerAuth";
import { useCart } from "@/modules/cart/presentation/api/queries";
import {
  useShopBanners,
  useShopCategories,
  useShopProducts,
} from "@/modules/shop/presentation/api/queries";
import { ProductCard } from "@/modules/shop/presentation/ui/ProductCard";

// ─── Banner Slider ────────────────────────────────────────────────────────────

function BannerSlider({
  banners,
}: {
  banners: { id: string; title: string; imageUrl: string; linkUrl: string | null }[];
}) {
  const [current, setCurrent] = useState(0);
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const reset = () => {
    if (timerRef.current) clearInterval(timerRef.current);
    timerRef.current = setInterval(
      () => setCurrent((c) => (c + 1) % banners.length),
      5000,
    );
  };

  useEffect(() => {
    if (banners.length === 0) return;
    reset();
    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [banners.length]);

  if (banners.length === 0) {
    return (
      <div className="flex h-72 w-full items-center justify-center rounded-lg bg-muted text-sm text-muted-foreground">
        ບໍ່ມີ Banner
      </div>
    );
  }

  const prev = () => {
    setCurrent((c) => (c - 1 + banners.length) % banners.length);
    reset();
  };
  const next = () => {
    setCurrent((c) => (c + 1) % banners.length);
    reset();
  };

  const banner = banners[current];

  return (
    <div className="relative overflow-hidden rounded-lg bg-muted">
      <div className="aspect-[16/6] w-full">
        {banner && (
          banner.linkUrl ? (
            <a href={banner.linkUrl} target="_blank" rel="noreferrer" className="block h-full w-full">
              <AppImage src={banner.imageUrl} alt={banner.title} className="h-full w-full" fit="cover" />
            </a>
          ) : (
            <AppImage src={banner.imageUrl} alt={banner.title} className="h-full w-full" fit="cover" />
          )
        )}
      </div>

      {banners.length > 1 && (
        <>
          <button
            type="button"
            onClick={prev}
            className="absolute left-2 top-1/2 -translate-y-1/2 rounded-full bg-black/30 p-1.5 text-white backdrop-blur-sm transition-colors hover:bg-black/50"
          >
            <ChevronLeftIcon className="h-5 w-5" />
          </button>
          <button
            type="button"
            onClick={next}
            className="absolute right-2 top-1/2 -translate-y-1/2 rounded-full bg-black/30 p-1.5 text-white backdrop-blur-sm transition-colors hover:bg-black/50"
          >
            <ChevronRightIcon className="h-5 w-5" />
          </button>

          <div className="absolute bottom-3 left-1/2 flex -translate-x-1/2 gap-1.5">
            {banners.map((b, i) => (
              <button
                key={b.id}
                type="button"
                onClick={() => {
                  setCurrent(i);
                  reset();
                }}
                className={`h-2 rounded-full transition-all ${i === current ? "w-6 bg-white" : "w-2 bg-white/50"
                  }`}
              />
            ))}
          </div>
        </>
      )}
    </div>
  );
}

// ─── Horizontal Product Scroll ────────────────────────────────────────────────

function ProductScroll({
  title,
  products,
  isLoading,
  onViewAll,
}: {
  title: string;
  products: Parameters<typeof ProductCard>[0]["product"][];
  isLoading: boolean;
  onViewAll?: () => void;
}) {
  const scrollRef = useRef<HTMLDivElement>(null);

  const scroll = (dir: "left" | "right") => {
    if (!scrollRef.current) return;
    scrollRef.current.scrollBy({ left: dir === "left" ? -300 : 300, behavior: "smooth" });
  };

  return (
    <section className="py-6">
      <div className="mb-4 flex items-center justify-between">
        <h2 className="text-lg font-bold sm:text-xl">{title}</h2>
        {onViewAll && (
          <button
            type="button"
            onClick={onViewAll}
            className="text-sm font-medium text-primary hover:underline"
          >
            ສະແດງທັງໝົດ →
          </button>
        )}
      </div>

      <div className="relative">
        <button
          type="button"
          onClick={() => scroll("left")}
          className="absolute -left-3 top-1/2 z-10 -translate-y-1/2 rounded-full border bg-background p-1.5 shadow-md transition-shadow hover:shadow-lg"
        >
          <ChevronLeftIcon className="h-4 w-4" />
        </button>

        <div
          ref={scrollRef}
          className="flex gap-3 overflow-x-auto scroll-smooth pb-2 [-ms-overflow-style:none] [scrollbar-width:none] [&::-webkit-scrollbar]:hidden"
        >
          {isLoading
            ? Array.from({ length: 6 }).map((_, i) => (
              // biome-ignore lint/suspicious/noArrayIndexKey: skeleton
              <div key={i} className="w-44 flex-shrink-0 overflow-hidden rounded-xl border">
                <Skeleton className="aspect-square w-full" />
                <div className="space-y-2 p-2">
                  <Skeleton className="h-3 w-3/4" />
                  <Skeleton className="h-4 w-1/2" />
                </div>
              </div>
            ))
            : products.map((p) => (
              <div key={p.id} className="w-44 flex-shrink-0">
                <ProductCard product={p} />
              </div>
            ))}
        </div>

        <button
          type="button"
          onClick={() => scroll("right")}
          className="absolute -right-3 top-1/2 z-10 -translate-y-1/2 rounded-full border bg-background p-1.5 shadow-md transition-shadow hover:shadow-lg"
        >
          <ChevronRightIcon className="h-4 w-4" />
        </button>
      </div>
    </section>
  );
}

// ─── HomePage ─────────────────────────────────────────────────────────────────

export function HomePage() {
  const nav = useNavigate();
  const [search, setSearch] = useState("");
  const [selectedCategory, setSelectedCategory] = useState<string | undefined>();

  const { data: auth } = useCustomerSession();
  const { data: cartData } = useCart();
  const banners = useShopBanners();
  const categories = useShopCategories();
  const featuredProducts = useShopProducts({ limit: 12 });
  const newProducts = useShopProducts({ limit: 12 });

  const cartCount =
    cartData?.items?.reduce((sum: number, item: { quantity: number }) => sum + item.quantity, 0) ?? 0;

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    nav({ to: "/shop", search: { q: search } as Record<string, string> });
  };

  const goToShopWithCategory = (categoryId?: string) => {
    nav({ to: "/shop", search: categoryId ? { categoryId } : {} as Record<string, string> });
  };

  return (
    <div className="min-h-screen bg-background text-foreground">

      {/* ── Top Navbar ── */}
      <header className="sticky top-0 z-50 bg-[#1a1f36] text-white shadow-md">
        <div className="mx-auto flex max-w-7xl items-center gap-3 px-4 py-3">

          {/* Logo */}
          <button
            type="button"
            onClick={() => nav({ to: "/" })}
            className="flex-shrink-0 text-xl font-extrabold tracking-tight text-white"
          >
            LaoShop
          </button>

          {/* Search */}
          <form onSubmit={handleSearch} className="relative flex-1">
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="ຄົ້ນຫາສິນຄ້າ..."
              className="w-full rounded-lg bg-white py-2 pl-4 pr-10 text-sm text-foreground placeholder:text-muted-foreground outline-none focus:ring-2 focus:ring-primary/50"
            />
            <button
              type="submit"
              className="absolute right-2 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-primary"
            >
              <SearchIcon className="h-4 w-4" />
            </button>
          </form>

          {/* Icons */}
          <div className="flex items-center gap-3">
            <button type="button" className="hidden text-white/80 hover:text-white sm:block">
              <HeartIcon className="h-5 w-5" />
            </button>

            <button
              type="button"
              onClick={() => nav({ to: "/cart" })}
              className="relative text-white/80 hover:text-white"
            >
              <ShoppingCartIcon className="h-5 w-5" />
              {cartCount > 0 && (
                <span className="absolute -right-2 -top-2 flex h-4 w-4 items-center justify-center rounded-full bg-red-500 text-[10px] font-bold text-white">
                  {cartCount > 99 ? "99+" : cartCount}
                </span>
              )}
            </button>

            {auth?.customer ? (
              <button
                type="button"
                onClick={() => nav({ to: "/shop" })}
                className="flex items-center gap-1.5 rounded-lg bg-primary px-3 py-1.5 text-xs font-semibold text-white transition-opacity hover:opacity-90"
              >
                <UserIcon className="h-3.5 w-3.5" />
                <span className="hidden max-w-[80px] truncate sm:block">{auth.customer.name}</span>
              </button>
            ) : (
              <button
                type="button"
                onClick={() => nav({ to: "/customer/login" })}
                className="rounded-lg bg-primary px-3 py-1.5 text-xs font-semibold text-white transition-opacity hover:opacity-90"
              >
                ເຂົ້າສູ່ລະບົບ
              </button>
            )}
          </div>
        </div>
      </header>

      {/* ── Category Nav Bar ── */}
      <nav className="border-b bg-background shadow-sm">
        <div className="mx-auto max-w-7xl px-4">
          <div className="flex items-center gap-1 overflow-x-auto py-2 [-ms-overflow-style:none] [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
            <button
              type="button"
              onClick={() => {
                setSelectedCategory(undefined);
                nav({ to: "/shop" });
              }}
              className="flex-shrink-0 rounded-md px-3 py-1.5 text-xs font-semibold text-foreground transition-colors hover:bg-primary/10 hover:text-primary"
            >
              ໝວດໝູ່
            </button>

            {categories.data?.data.map((cat) => (
              <button
                key={cat.id}
                type="button"
                onClick={() => {
                  setSelectedCategory(cat.id);
                  goToShopWithCategory(cat.id);
                }}
                className={`flex-shrink-0 rounded-md px-3 py-1.5 text-xs font-medium transition-colors hover:bg-primary/10 hover:text-primary ${selectedCategory === cat.id
                  ? "bg-primary/10 text-primary"
                  : "text-muted-foreground"
                  }`}
              >
                {cat.name}
              </button>
            ))}
          </div>
        </div>
      </nav>

      {/* ── Main Body ── */}
      <div className="mx-auto max-w-7xl px-4 py-4">
        <div className="flex gap-4">

          {/* Sidebar */}
          <aside className="hidden w-56 flex-shrink-0 lg:block">
            <div className="rounded-xl border bg-card">
              <div className="border-b bg-muted/50 px-4 py-2.5 text-sm font-bold">ໝວດໝູ່</div>
              <div className="py-1">
                {categories.isLoading
                  ? Array.from({ length: 6 }).map((_, i) => (
                    // biome-ignore lint/suspicious/noArrayIndexKey: skeleton
                    <div key={i} className="px-4 py-2">
                      <Skeleton className="h-4 w-3/4" />
                    </div>
                  ))
                  : categories.data?.data.map((cat) => (
                    <button
                      key={cat.id}
                      type="button"
                      onClick={() => goToShopWithCategory(cat.id)}
                      className="flex w-full items-center justify-between px-4 py-2 text-left text-sm transition-colors hover:bg-primary/5 hover:text-primary"
                    >
                      <span>{cat.name}</span>
                      <ChevronRightIcon className="h-3.5 w-3.5 text-muted-foreground" />
                    </button>
                  ))}
              </div>
            </div>
          </aside>

          {/* Content */}
          <div className="min-w-0 flex-1">
            {/* Banner */}
            {banners.isLoading ? (
              <Skeleton className="aspect-[16/6] w-full rounded-lg" />
            ) : (
              <BannerSlider banners={banners.data?.data ?? []} />
            )}

            {/* Category Icons */}
            <div className="mt-4">
              <div className="relative">
                <div className="flex gap-3 overflow-x-auto py-2 [-ms-overflow-style:none] [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
                  {categories.data?.data.slice(0, 10).map((cat) => (
                    <button
                      key={cat.id}
                      type="button"
                      onClick={() => goToShopWithCategory(cat.id)}
                      className="flex flex-shrink-0 flex-col items-center gap-1.5"
                    >
                      <div className="flex h-14 w-14 items-center justify-center rounded-full border bg-muted text-xs font-semibold text-muted-foreground transition-colors hover:border-primary hover:bg-primary/5 hover:text-primary">
                        {cat.name.slice(0, 2).toUpperCase()}
                      </div>
                      <span className="w-16 truncate text-center text-[10px] text-muted-foreground">
                        {cat.name}
                      </span>
                    </button>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* ── Product Sections ── */}
      <div className="mx-auto max-w-7xl px-4 pb-16">
        <div className="rounded-2xl border bg-card p-4">

          <ProductScroll
            title="ສິນຄ້າໂປຣໂມຊັ່ນ 🔥"
            products={featuredProducts.data?.data ?? []}
            isLoading={featuredProducts.isLoading}
            onViewAll={() => nav({ to: "/shop" })}
          />

          <div className="my-2 border-t" />

          <ProductScroll
            title="ສິນຄ້າໃໝ່ ✈️"
            products={newProducts.data?.data ?? []}
            isLoading={newProducts.isLoading}
            onViewAll={() => nav({ to: "/shop" })}
          />

        </div>
      </div>

      {/* ── Footer ── */}
      <footer className="border-t bg-[#1a1f36] text-white">
        <div className="mx-auto max-w-7xl px-4 py-6 text-center text-sm text-white/60">
          <p className="font-semibold text-white">LaoShop</p>
          <p className="mt-1">© {new Date().getFullYear()} LaoShop. ສະຫງວນລິຂະສິດ.</p>
          <button
            type="button"
            onClick={() => nav({ to: "/auth/login" })}
            className="mt-2 text-xs text-white/30 transition-colors hover:text-white/60"
          >
            Admin Panel
          </button>
        </div>
      </footer>

    </div>
  );
}
