import { supabase } from "@/shared/lib/supabase";
import { config } from "@/shared/lib/config";
import { fetcher } from "@/shared/lib/fetcher";
import { useQueryClient } from "@tanstack/react-query";
import { Loader } from "@devhop/ui";
import { useEffect, useRef } from "react";
import { useNavigate, useSearch } from "@tanstack/react-router";
import { customerAuthKeys } from "../model/useCustomerAuth";

/**
 * หน้านี้ทำหน้าที่รับ callback จาก Supabase OAuth
 * URL: /customer/auth/callback
 * Supabase จะ redirect กลับมาพร้อม access_token ใน URL hash
 */
export function CustomerOAuthCallbackPage() {
  const nav = useNavigate();
  const qc = useQueryClient();
  const search = useSearch({ from: "/customer/auth/callback" }) as { returnTo?: string };
  const called = useRef(false);

  useEffect(() => {
    if (called.current) return;
    called.current = true;

    async function handleCallback() {
      try {
        // Supabase ใส่ session ใน URL hash หลัง OAuth redirect
        const { data, error } = await supabase.auth.getSession();

        if (error || !data.session?.access_token) {
          throw new Error("ไม่ได้รับ session จาก Google");
        }

        // ส่ง access_token ไปยัง backend เพื่อ sync กับ customers table
        await fetcher.post(
          `${config.apiUrl}/customer-auth/google`,
          { access_token: data.session.access_token },
        );

        // invalidate session cache → useCustomerSession จะ refetch
        await qc.invalidateQueries({ queryKey: customerAuthKeys.me });

        // redirect ไปหน้าที่ต้องการ หรือ /shop
        nav({ to: (search?.returnTo as string) ?? "/shop", replace: true });
      } catch (err) {
        console.error("OAuth callback error:", err);
        nav({ to: "/customer/login", replace: true });
      }
    }

    handleCallback();
  }, [nav, qc, search]);

  return (
    <div className="flex min-h-screen flex-col items-center justify-center gap-3">
      <Loader />
      <p className="text-sm text-muted-foreground">ກຳລັງເຂົ້າສູ່ລະບົບ...</p>
    </div>
  );
}
