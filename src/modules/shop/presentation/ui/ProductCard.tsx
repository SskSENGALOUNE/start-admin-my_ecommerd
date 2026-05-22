import { AppImage } from "@/shared/ui/AppImage";
import { useNavigate } from "@tanstack/react-router";
import { ShoppingCartIcon } from "lucide-react";
import type { ShopProduct } from "../api/client";

interface Props {
  product: ShopProduct;
}

export function ProductCard({ product }: Props) {
  const nav = useNavigate();
  const isOutOfStock = product.availableStock <= 0;

  const formatPrice = (v: string) =>
    `${Number(v).toLocaleString("lo-LA")} ກີບ`;

  return (
    <button
      type="button"
      onClick={() => nav({ to: "/shop/$id", params: { id: product.id } })}
      className="group flex flex-col overflow-hidden rounded-2xl border bg-card text-left transition-shadow hover:shadow-lg"
    >
      {/* Image */}
      <div className="relative aspect-square overflow-hidden bg-muted">
        <AppImage
          src={product.mainImage}
          alt={product.name}
          className="h-full w-full transition-transform duration-300 group-hover:scale-105"
          fit="cover"
        />

        {isOutOfStock && (
          <div className="absolute inset-0 flex items-center justify-center bg-black/50">
            <span className="rounded-full bg-white px-3 py-1 text-xs font-semibold text-black">
              ໝົດສະຕ໋ອກ
            </span>
          </div>
        )}

        {!isOutOfStock && product.availableStock <= 5 && (
          <div className="absolute right-2 top-2 rounded-full bg-amber-500 px-2 py-0.5 text-[10px] font-bold text-white">
            ໃກ້ໝົດ
          </div>
        )}
      </div>

      {/* Info */}
      <div className="flex flex-1 flex-col p-3">
        {product.categoryName && (
          <span className="mb-1 text-[11px] font-medium uppercase tracking-wide text-muted-foreground">
            {product.categoryName}
          </span>
        )}
        <p className="line-clamp-2 flex-1 text-sm font-semibold leading-snug">
          {product.name}
        </p>
        <div className="mt-2 flex items-center justify-between">
          <span className="text-base font-bold text-primary">
            {formatPrice(product.basePrice)}
          </span>
          {!isOutOfStock && (
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary/10 text-primary transition-colors group-hover:bg-primary group-hover:text-primary-foreground">
              <ShoppingCartIcon className="h-4 w-4" />
            </div>
          )}
        </div>
      </div>
    </button>
  );
}
