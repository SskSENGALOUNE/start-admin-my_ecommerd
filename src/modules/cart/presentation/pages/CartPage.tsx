import { CustomerAuthGuard } from "@/modules/customer-auth/presentation/ui/CustomerAuthGuard";
import { ShopNavbar } from "@/modules/shop/presentation/ui/ShopNavbar";
import { Skeleton } from "@devhop/ui";
import { ArrowLeftIcon, ShoppingBagIcon } from "lucide-react";
import { useNavigate } from "@tanstack/react-router";
import { useCart } from "../api/queries";
import { CartItemRow } from "../ui/CartItemRow";

function CartContent() {
  const nav = useNavigate();
  const { data: cart, isLoading } = useCart();
  const fmt = (v: string) => `${Number(v).toLocaleString("lo-LA")} ກີບ`;

  return (
    <div className="min-h-screen bg-background">
      <ShopNavbar cartCount={cart?.totalItems} />

      <main className="mx-auto max-w-3xl px-4 py-8">
        {/* Header */}
        <div className="mb-6 flex items-center gap-3">
          <button
            type="button"
            onClick={() => nav({ to: "/shop" })}
            className="flex items-center gap-1.5 text-sm text-muted-foreground hover:text-foreground"
          >
            <ArrowLeftIcon className="h-4 w-4" />
            ໄປຊື້ຕໍ່
          </button>
          <h1 className="text-xl font-bold">ກະຕ່າສິນຄ້າ</h1>
          {cart && cart.totalItems > 0 && (
            <span className="rounded-full bg-primary/10 px-2.5 py-0.5 text-sm font-medium text-primary">
              {cart.totalItems} ລາຍການ
            </span>
          )}
        </div>

        {isLoading ? (
          <div className="space-y-4">
            {[1, 2, 3].map((i) => (
              <Skeleton key={i} className="h-24 w-full rounded-2xl" />
            ))}
          </div>
        ) : !cart || cart.items.length === 0 ? (
          /* Empty cart */
          <div className="flex flex-col items-center gap-4 py-24 text-center">
            <div className="flex h-20 w-20 items-center justify-center rounded-full bg-muted">
              <ShoppingBagIcon className="h-10 w-10 text-muted-foreground" />
            </div>
            <p className="text-lg font-semibold">ກະຕ່າຍັງວ່າງຢູ່</p>
            <p className="text-sm text-muted-foreground">
              ເລືອກສິນຄ້າທີ່ທ່ານຕ້ອງການ ແລ້ວເພີ່ມໃສ່ກະຕ່າ
            </p>
            <button
              type="button"
              onClick={() => nav({ to: "/shop" })}
              className="rounded-xl bg-primary px-6 py-2.5 text-sm font-semibold text-primary-foreground hover:opacity-90"
            >
              ໄປເລືອກສິນຄ້າ →
            </button>
          </div>
        ) : (
          <div className="grid gap-6 lg:grid-cols-3">
            {/* Items list */}
            <div className="lg:col-span-2">
              <div className="rounded-2xl border bg-card">
                <div className="divide-y px-4">
                  {cart.items.map((item) => (
                    <CartItemRow key={item.id} item={item} />
                  ))}
                </div>
              </div>
            </div>

            {/* Summary */}
            <div className="space-y-3">
              <div className="rounded-2xl border bg-card p-5 space-y-3">
                <h2 className="font-bold text-base">ສຳຫຼວດລາຍການ</h2>
                <div className="space-y-2 text-sm">
                  {cart.items.map((item) => (
                    <div key={item.id} className="flex justify-between gap-2">
                      <span className="text-muted-foreground truncate flex-1">
                        {item.productName} ×{item.quantity}
                      </span>
                      <span className="shrink-0">{fmt(item.subtotal)}</span>
                    </div>
                  ))}
                </div>
                <div className="border-t pt-3 flex justify-between font-bold text-base">
                  <span>ລວມທັງໝົດ</span>
                  <span className="text-primary">{fmt(cart.totalAmount)}</span>
                </div>
              </div>

              <button
                type="button"
                onClick={() => nav({ to: "/checkout" })}
                className="w-full rounded-xl bg-primary py-3.5 text-base font-bold text-primary-foreground hover:opacity-90"
              >
                ສັ່ງຊື້ເລີຍ →
              </button>

              <button
                type="button"
                onClick={() => nav({ to: "/shop" })}
                className="w-full rounded-xl border py-3 text-sm font-medium hover:bg-muted"
              >
                ໄປຊື້ຕໍ່
              </button>
            </div>
          </div>
        )}
      </main>
    </div>
  );
}

export function CartPage() {
  return (
    <CustomerAuthGuard redirectTo="/cart">
      <CartContent />
    </CustomerAuthGuard>
  );
}
