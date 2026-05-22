import { Button, Input, Label } from "@devhop/ui";
import { supabase, OAUTH_REDIRECT_URL } from "@/shared/lib/supabase";
import { ShoppingBagIcon } from "lucide-react";
import { useState } from "react";
import { useNavigate, useSearch } from "@tanstack/react-router";
import { useCustomerLogin } from "../model/useCustomerAuth";

// Google "G" SVG icon
function GoogleIcon() {
  return (
    <svg className="h-4 w-4" viewBox="0 0 24 24" aria-hidden="true">
      <path
        d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
        fill="#4285F4"
      />
      <path
        d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
        fill="#34A853"
      />
      <path
        d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
        fill="#FBBC05"
      />
      <path
        d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
        fill="#EA4335"
      />
    </svg>
  );
}

export function CustomerLoginPage() {
  const nav = useNavigate();
  const search = useSearch({ from: "/customer/login" }) as { returnTo?: string };
  const returnTo = search?.returnTo ?? "/shop";

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [googleLoading, setGoogleLoading] = useState(false);
  const login = useCustomerLogin();
  const isDev = import.meta.env.DEV;

  async function handleQuickLogin() {
    setEmail("test@customer.com");
    setPassword("123456");
    await login.mutateAsync({ email: "test@customer.com", password: "123456" });
    nav({ to: returnTo });
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    await login.mutateAsync({ email, password });
    nav({ to: returnTo });
  }

  async function handleGoogleLogin() {
    setGoogleLoading(true);
    try {
      const { error } = await supabase.auth.signInWithOAuth({
        provider: "google",
        options: {
          redirectTo: `${OAUTH_REDIRECT_URL}${returnTo !== "/shop" ? `?returnTo=${encodeURIComponent(returnTo)}` : ""}`,
          queryParams: { access_type: "offline", prompt: "consent" },
        },
      });
      if (error) throw error;
      // Supabase จะ redirect browser ออกไป Google — ไม่ถึงบรรทัดนี้
    } catch {
      setGoogleLoading(false);
    }
  }

  return (
    <div className="flex min-h-screen items-center justify-center bg-muted/30 px-4">
      <div className="w-full max-w-sm">
        {/* Logo */}
        <div className="mb-8 text-center">
          <button
            type="button"
            onClick={() => nav({ to: "/" })}
            className="inline-flex items-center gap-2 text-xl font-bold hover:opacity-80"
          >
            <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-primary">
              <ShoppingBagIcon className="h-5 w-5 text-primary-foreground" />
            </div>
            LaoShop
          </button>
          <p className="mt-2 text-sm text-muted-foreground">
            ເຂົ້າສູ່ລະບົບເພື່ອສັ່ງຊື້ສິນຄ້າ
          </p>
        </div>

        {/* Card */}
        <div className="rounded-2xl border bg-card p-6 shadow-sm">
          <h1 className="mb-5 text-xl font-bold">ເຂົ້າສູ່ລະບົບ</h1>

          {/* Google OAuth Button */}
          <button
            type="button"
            onClick={handleGoogleLogin}
            disabled={googleLoading}
            className="mb-4 flex w-full items-center justify-center gap-3 rounded-lg border bg-background px-4 py-2.5 text-sm font-medium transition-colors hover:bg-muted disabled:opacity-50"
          >
            <GoogleIcon />
            {googleLoading ? "ກຳລັງໂອນ..." : "ເຂົ້າສູ່ລະບົບດ້ວຍ Google"}
          </button>

          {/* Divider */}
          <div className="relative mb-4">
            <div className="absolute inset-0 flex items-center">
              <div className="w-full border-t" />
            </div>
            <div className="relative flex justify-center">
              <span className="bg-card px-3 text-xs text-muted-foreground">
                ຫຼື ເຂົ້າດ້ວຍອີເມວ
              </span>
            </div>
          </div>

          {/* Email/Password Form */}
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-1.5">
              <Label htmlFor="email">ອີເມວ</Label>
              <Input
                id="email"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="example@email.com"
                required
                autoComplete="email"
              />
            </div>

            <div className="space-y-1.5">
              <Label htmlFor="password">ລະຫັດຜ່ານ</Label>
              <Input
                id="password"
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                required
                autoComplete="current-password"
              />
            </div>

            <Button type="submit" className="w-full" disabled={login.isPending}>
              {login.isPending ? "ກຳລັງເຂົ້າ..." : "ເຂົ້າສູ່ລະບົບ"}
            </Button>
          </form>

          {isDev && (
            <button
              type="button"
              onClick={handleQuickLogin}
              disabled={login.isPending}
              className="mt-3 w-full rounded-lg border border-dashed border-amber-400 bg-amber-50 py-2 text-xs font-medium text-amber-700 hover:bg-amber-100 disabled:opacity-50 dark:bg-amber-950/30 dark:text-amber-400"
            >
              ⚡ Dev: Quick Login (test@customer.com)
            </button>
          )}

          <p className="mt-4 text-center text-sm text-muted-foreground">
            ຍັງບໍ່ມີບັນຊີ?{" "}
            <button
              type="button"
              onClick={() => nav({ to: "/customer/register" })}
              className="font-medium text-primary hover:underline"
            >
              ສະໝັກສະມາຊິກ
            </button>
          </p>
        </div>

        <p className="mt-4 text-center text-xs text-muted-foreground">
          ທ່ານເປັນ Admin?{" "}
          <button
            type="button"
            onClick={() => nav({ to: "/auth/login" })}
            className="hover:underline"
          >
            ເຂົ້າ Admin Panel
          </button>
        </p>
      </div>
    </div>
  );
}
