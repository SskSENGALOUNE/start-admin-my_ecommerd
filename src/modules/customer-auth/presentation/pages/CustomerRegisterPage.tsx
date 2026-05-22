import { Button, Input, Label } from "@devhop/ui";
import { ShoppingBagIcon } from "lucide-react";
import { useState } from "react";
import { useNavigate } from "@tanstack/react-router";
import { useCustomerRegister } from "../model/useCustomerAuth";

export function CustomerRegisterPage() {
  const nav = useNavigate();
  const register = useCustomerRegister();

  const [form, setForm] = useState({
    name: "",
    email: "",
    password: "",
    confirmPassword: "",
    phone: "",
  });
  const [errors, setErrors] = useState<Record<string, string>>({});

  function set(field: string, value: string) {
    setForm((prev) => ({ ...prev, [field]: value }));
    setErrors((prev) => ({ ...prev, [field]: "" }));
  }

  function validate() {
    const e: Record<string, string> = {};
    if (!form.name.trim()) e.name = "ກະລຸນາໃສ່ຊື່";
    if (!form.email.trim()) e.email = "ກະລຸນາໃສ່ອີເມວ";
    if (form.password.length < 6) e.password = "ລະຫັດຜ່ານຕ້ອງ 6 ຕົວອັກສອນຂຶ້ນໄປ";
    if (form.password !== form.confirmPassword) e.confirmPassword = "ລະຫັດຜ່ານບໍ່ຕົງກັນ";
    return e;
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    const errs = validate();
    if (Object.keys(errs).length > 0) { setErrors(errs); return; }

    await register.mutateAsync({
      name: form.name.trim(),
      email: form.email.trim(),
      password: form.password,
      phone: form.phone.trim() || undefined,
    });
    nav({ to: "/shop" });
  }

  return (
    <div className="flex min-h-screen items-center justify-center bg-muted/30 px-4 py-8">
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
            ສ້າງບັນຊີໃໝ່ ຟຣີ!
          </p>
        </div>

        {/* Card */}
        <div className="rounded-2xl border bg-card p-6 shadow-sm">
          <h1 className="mb-5 text-xl font-bold">ສະໝັກສະມາຊິກ</h1>

          <form onSubmit={handleSubmit} className="space-y-4">
            {/* Name */}
            <div className="space-y-1.5">
              <Label htmlFor="name">ຊື່ - ນາມສະກຸນ *</Label>
              <Input
                id="name"
                value={form.name}
                onChange={(e) => set("name", e.target.value)}
                placeholder="ທ. ສົມຊາຍ"
              />
              {errors.name && <p className="text-xs text-destructive">{errors.name}</p>}
            </div>

            {/* Email */}
            <div className="space-y-1.5">
              <Label htmlFor="email">ອີເມວ *</Label>
              <Input
                id="email"
                type="email"
                value={form.email}
                onChange={(e) => set("email", e.target.value)}
                placeholder="example@email.com"
                autoComplete="email"
              />
              {errors.email && <p className="text-xs text-destructive">{errors.email}</p>}
            </div>

            {/* Phone */}
            <div className="space-y-1.5">
              <Label htmlFor="phone">ເບີໂທ (ຖ້າມີ)</Label>
              <Input
                id="phone"
                type="tel"
                value={form.phone}
                onChange={(e) => set("phone", e.target.value)}
                placeholder="020xxxxxxxx"
              />
            </div>

            {/* Password */}
            <div className="space-y-1.5">
              <Label htmlFor="password">ລະຫັດຜ່ານ *</Label>
              <Input
                id="password"
                type="password"
                value={form.password}
                onChange={(e) => set("password", e.target.value)}
                placeholder="ຢ່າງໜ້ອຍ 6 ຕົວ"
                autoComplete="new-password"
              />
              {errors.password && <p className="text-xs text-destructive">{errors.password}</p>}
            </div>

            {/* Confirm Password */}
            <div className="space-y-1.5">
              <Label htmlFor="confirmPassword">ຢືນຢັນລະຫັດຜ່ານ *</Label>
              <Input
                id="confirmPassword"
                type="password"
                value={form.confirmPassword}
                onChange={(e) => set("confirmPassword", e.target.value)}
                placeholder="ໃສ່ລະຫັດຜ່ານອີກຄັ້ງ"
                autoComplete="new-password"
              />
              {errors.confirmPassword && <p className="text-xs text-destructive">{errors.confirmPassword}</p>}
            </div>

            <Button type="submit" className="w-full" disabled={register.isPending}>
              {register.isPending ? "ກຳລັງສ້າງບັນຊີ..." : "ສ້າງບັນຊີ"}
            </Button>
          </form>

          <p className="mt-4 text-center text-sm text-muted-foreground">
            ມີບັນຊີແລ້ວ?{" "}
            <button
              type="button"
              onClick={() => nav({ to: "/customer/login" })}
              className="font-medium text-primary hover:underline"
            >
              ເຂົ້າສູ່ລະບົບ
            </button>
          </p>
        </div>
      </div>
    </div>
  );
}
