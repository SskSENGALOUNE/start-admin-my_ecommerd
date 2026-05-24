import { useCustomerSession, useCustomerLogout } from "@/modules/customer-auth/presentation/model/useCustomerAuth";
import { useNavigate } from "@tanstack/react-router";
import { LogInIcon, LogOutIcon, ShoppingBagIcon, ShoppingCartIcon, UserIcon } from "lucide-react";

interface Props {
  cartCount?: number;
}

export function ShopNavbar({ cartCount = 0 }: Props) {
  const nav = useNavigate();
  const { data } = useCustomerSession();
  const logout = useCustomerLogout();
  const customer = data?.customer;

  return (
    <header className="sticky top-0 z-50 border-b bg-background/95 backdrop-blur-sm">
      <div className="mx-auto flex max-w-6xl items-center justify-between px-4 py-3">
        {/* Logo */}
        <button
          type="button"
          onClick={() => nav({ to: "/" })}
          className="flex items-center gap-2 text-lg font-bold hover:opacity-80"
        >
          <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary">
            <ShoppingBagIcon className="h-4 w-4 text-primary-foreground" />
          </div>
          LaoShop
        </button>

        {/* Actions */}
        <div className="flex items-center gap-2">
          {/* Cart */}
          <button
            type="button"
            onClick={() => nav({ to: "/cart" })}
            className="relative flex h-9 w-9 items-center justify-center rounded-lg hover:bg-muted"
          >
            <ShoppingCartIcon className="h-5 w-5" />
            {cartCount > 0 && (
              <span className="absolute -right-1 -top-1 flex h-4 w-4 items-center justify-center rounded-full bg-primary text-[10px] font-bold text-primary-foreground">
                {cartCount > 9 ? "9+" : cartCount}
              </span>
            )}
          </button>

          {/* Auth */}
          {customer ? (
            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={() => nav({ to: "/account" })}
                className="flex items-center gap-1.5 rounded-lg px-3 py-1.5 text-sm font-medium hover:bg-muted"
              >
                <UserIcon className="h-4 w-4" />
                <span className="hidden sm:inline">{customer.name}</span>
              </button>
              <button
                type="button"
                onClick={() =>
                  logout.mutate(undefined, {
                    onSuccess: () => nav({ to: "/" }),
                  })
                }
                disabled={logout.isPending}
                className="flex h-9 w-9 items-center justify-center rounded-lg text-muted-foreground hover:bg-muted disabled:opacity-50"
              >
                <LogOutIcon className="h-4 w-4" />
              </button>
            </div>
          ) : (
            <button
              type="button"
              onClick={() => nav({ to: "/customer/login" })}
              className="flex items-center gap-1.5 rounded-lg bg-primary px-4 py-1.5 text-sm font-medium text-primary-foreground hover:opacity-90"
            >
              <LogInIcon className="h-4 w-4" />
              ເຂົ້າສູ່ລະບົບ
            </button>
          )}
        </div>
      </div>
    </header>
  );
}
