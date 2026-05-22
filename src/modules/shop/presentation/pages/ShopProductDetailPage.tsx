import { AppImage } from "@/shared/ui/AppImage";
import { QueryState } from "@/shared/ui/QueryState";
import { cn } from "@devhop/ui";
import { ArrowLeftIcon, ShoppingCartIcon } from "lucide-react";
import { useState } from "react";
import { useNavigate, useParams } from "@tanstack/react-router";
import { useCustomerSession } from "@/modules/customer-auth/presentation/model/useCustomerAuth";
import { useAddToCart } from "@/modules/cart/presentation/api/queries";
import { useShopProduct } from "../api/queries";
import { ShopNavbar } from "../ui/ShopNavbar";
import type { ShopProductVariant } from "../api/client";

export function ShopProductDetailPage() {
  const nav = useNavigate();
  const { id } = useParams({ from: "/shop/$id" });
  const productQuery = useShopProduct(id);
  const product = productQuery.data;
  const { data: authData } = useCustomerSession();
  const addToCart = useAddToCart();

  const [selectedImage, setSelectedImage] = useState(0);
  const [selectedVariant, setSelectedVariant] = useState<ShopProductVariant | null>(null);
  const [qty, setQty] = useState(1);

  const formatPrice = (v: string) => `${Number(v).toLocaleString("lo-LA")} ກີບ`;

  const effectivePrice = selectedVariant?.price ?? product?.basePrice ?? "0";
  const isOutOfStock = (product?.availableStock ?? 0) <= 0;

  // Group variants by color
  const colorGroups = product?.variants.reduce<Record<string, ShopProductVariant[]>>(
    (acc, v) => {
      const key = v.colorName ?? "other";
      if (!acc[key]) acc[key] = [];
      acc[key].push(v);
      return acc;
    },
    {},
  );

  async function handleAddToCart() {
    if (!authData?.customer) {
      nav({ to: "/customer/login", search: { returnTo: `/shop/${id}` } });
      return;
    }
    await addToCart.mutateAsync({
      productId: id,
      productVariantId: selectedVariant?.id,
      quantity: qty,
    });
    nav({ to: "/cart" });
  }

  return (
    <div className="min-h-screen bg-background">
      <ShopNavbar />

      <main className="mx-auto max-w-5xl px-4 py-8">
        {/* Back */}
        <button
          type="button"
          onClick={() => nav({ to: "/shop" })}
          className="mb-6 flex items-center gap-1.5 text-sm text-muted-foreground hover:text-foreground"
        >
          <ArrowLeftIcon className="h-4 w-4" />
          ກັບໄປຮ້ານ
        </button>

        <QueryState query={productQuery}>
          {product && (
            <div className="grid gap-8 md:grid-cols-2">
              {/* ── Images ── */}
              <div className="space-y-3">
                {/* Main image */}
                <div className="aspect-square overflow-hidden rounded-2xl border bg-muted">
                  <AppImage
                    src={product.images[selectedImage]?.url ?? null}
                    alt={product.name}
                    className="h-full w-full"
                    fit="cover"
                  />
                </div>
                {/* Thumbnails */}
                {product.images.length > 1 && (
                  <div className="flex gap-2 overflow-x-auto pb-1">
                    {product.images.map((img, i) => (
                      <button
                        key={img.id}
                        type="button"
                        onClick={() => setSelectedImage(i)}
                        className={cn(
                          "h-16 w-16 shrink-0 overflow-hidden rounded-lg border-2 transition-colors",
                          selectedImage === i
                            ? "border-primary"
                            : "border-transparent hover:border-muted-foreground/40",
                        )}
                      >
                        <AppImage src={img.url} alt="" className="h-full w-full" fit="cover" />
                      </button>
                    ))}
                  </div>
                )}
              </div>

              {/* ── Info ── */}
              <div className="space-y-5">
                {product.categoryName && (
                  <p className="text-xs font-semibold uppercase tracking-widest text-muted-foreground">
                    {product.categoryName}
                  </p>
                )}
                <h1 className="text-2xl font-bold leading-snug">{product.name}</h1>

                <p className="text-3xl font-extrabold text-primary">
                  {formatPrice(effectivePrice)}
                </p>

                {product.description && (
                  <p className="leading-relaxed text-muted-foreground">{product.description}</p>
                )}

                {/* Color variants */}
                {colorGroups && Object.keys(colorGroups).length > 0 && (
                  <div className="space-y-2">
                    <p className="text-sm font-semibold">ສີ / ຂະໜາດ</p>
                    {Object.entries(colorGroups).map(([color, variants]) => (
                      <div key={color} className="space-y-1.5">
                        <p className="text-xs text-muted-foreground">{color}</p>
                        <div className="flex flex-wrap gap-2">
                          {variants.map((v) => (
                            <button
                              key={v.id}
                              type="button"
                              onClick={() => setSelectedVariant(v)}
                              className={cn(
                                "rounded-lg border px-3 py-1.5 text-sm font-medium transition-colors",
                                selectedVariant?.id === v.id
                                  ? "border-primary bg-primary text-primary-foreground"
                                  : "hover:border-primary/50",
                              )}
                            >
                              {v.size ?? color}
                              {v.price && v.price !== product.basePrice && (
                                <span className="ml-1 text-xs opacity-70">
                                  +{formatPrice(String(Number(v.price) - Number(product.basePrice)))}
                                </span>
                              )}
                            </button>
                          ))}
                        </div>
                      </div>
                    ))}
                  </div>
                )}

                {/* Qty */}
                <div className="flex items-center gap-3">
                  <p className="text-sm font-semibold">ຈຳນວນ</p>
                  <div className="flex items-center gap-2 rounded-lg border px-2 py-1">
                    <button
                      type="button"
                      onClick={() => setQty((q) => Math.max(1, q - 1))}
                      className="h-7 w-7 rounded text-lg font-bold hover:bg-muted"
                    >
                      −
                    </button>
                    <span className="w-8 text-center font-semibold">{qty}</span>
                    <button
                      type="button"
                      onClick={() => setQty((q) => Math.min(product.availableStock, q + 1))}
                      disabled={qty >= product.availableStock}
                      className="h-7 w-7 rounded text-lg font-bold hover:bg-muted disabled:opacity-40"
                    >
                      +
                    </button>
                  </div>
                  <span className="text-xs text-muted-foreground">
                    ເຫຼືອ {product.availableStock} ຊິ້ນ
                  </span>
                </div>

                {/* Add to cart */}
                <button
                  type="button"
                  onClick={handleAddToCart}
                  disabled={isOutOfStock}
                  className={cn(
                    "flex w-full items-center justify-center gap-2 rounded-xl py-3.5 text-base font-bold transition-opacity",
                    isOutOfStock
                      ? "cursor-not-allowed bg-muted text-muted-foreground"
                      : "bg-primary text-primary-foreground hover:opacity-90",
                  )}
                >
                  <ShoppingCartIcon className="h-5 w-5" />
                  {isOutOfStock ? "ໝົດສະຕ໋ອກ" : authData?.customer ? "ເພີ່ມໃສ່ກະຕ່າ" : "ເຂົ້າສູ່ລະບົບເພື່ອຊື້"}
                </button>

                {!authData?.customer && !isOutOfStock && (
                  <p className="text-center text-xs text-muted-foreground">
                    ຕ້ອງ{" "}
                    <button
                      type="button"
                      onClick={() => nav({ to: "/customer/login", search: { returnTo: `/shop/${id}` } })}
                      className="font-medium text-primary hover:underline"
                    >
                      ເຂົ້າສູ່ລະບົບ
                    </button>{" "}
                    ກ່ອນເພີ່ມໃສ່ກະຕ່າ
                  </p>
                )}
              </div>
            </div>
          )}
        </QueryState>
      </main>
    </div>
  );
}
