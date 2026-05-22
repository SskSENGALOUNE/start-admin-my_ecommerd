import { Loader } from "@devhop/ui";
import { useNavigate } from "@tanstack/react-router";
import { useEffect } from "react";
import { useCustomerSession } from "../model/useCustomerAuth";

interface Props {
  children: React.ReactNode;
  /** path ที่จะ redirect หลัง login สำเร็จ (default = current path) */
  redirectTo?: string;
}

/**
 * Protect customer-only pages.
 * ถ้ายังไม่ login → redirect ไป /customer/login
 */
export function CustomerAuthGuard({ children, redirectTo }: Props) {
  const { data, isLoading } = useCustomerSession();
  const nav = useNavigate();
  const isAuthenticated = !!data?.customer;

  useEffect(() => {
    if (isLoading) return;
    if (!isAuthenticated) {
      const returnTo = redirectTo ?? window.location.pathname;
      nav({
        to: "/customer/login",
        search: { returnTo },
      });
    }
  }, [isLoading, isAuthenticated, nav, redirectTo]);

  if (isLoading) {
    return (
      <div className="flex min-h-[60vh] items-center justify-center">
        <Loader />
      </div>
    );
  }

  if (!isAuthenticated) return null;

  return <>{children}</>;
}
