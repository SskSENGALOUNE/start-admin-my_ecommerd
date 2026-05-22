import { useState } from "react";
import { useNavigate } from "@tanstack/react-router";
import {
  Button,
  FormInput,
  FormPassword,
  FormRoot,
  RHF,
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
  Skeleton,
  confirm,
  zodResolver,
} from "@devhop/ui";
import {
  ChevronRightIcon,
  LockIcon,
  MapPinIcon,
  PackageIcon,
  ShoppingBagIcon,
  UserIcon,
} from "lucide-react";
import { z } from "zod";
import { CustomerAuthGuard } from "@/modules/customer-auth/presentation/ui/CustomerAuthGuard";
import { useCustomerSession } from "@/modules/customer-auth/presentation/model/useCustomerAuth";
import { OrderStatusBadge } from "@/modules/orders/presentation/ui/OrderStatusBadge";
import type { OrderStatus } from "@/modules/orders/domain/contracts/order.contract";
import { ShopNavbar } from "@/modules/shop/presentation/ui/ShopNavbar";
import { AddressCard } from "../ui/AddressCard";
import { AddressFormModal } from "../ui/AddressFormModal";
import type { AddressUpsertDTO, MyOrderQueryDTO } from "../../domain/contracts/customer-account.contract";
import type { MyAddress } from "../api/client";
import {
  useMyOrdersQuery,
  useUpdateProfile,
  useChangePassword,
  useMyAddressesQuery,
  useCreateAddress,
  useUpdateAddress,
  useDeleteAddress,
  useSetDefaultAddress,
} from "../api/queries";

// ─── Helpers ──────────────────────────────────────────────────────────────────

function fmt(v: string | number) {
  return `${Number(v).toLocaleString("lo-LA")} ກີບ`;
}

// ─── Profile Tab ──────────────────────────────────────────────────────────────

const profileSchema = z.object({
  name: z.string().min(2, "ຊື່ຕ້ອງມີຢ່າງໜ້ອຍ 2 ຕົວອັກສອນ"),
  phone: z.string().optional(),
});

const passwordSchema = z
  .object({
    currentPassword: z.string().min(1, "ກະລຸນາໃສ່ລະຫັດຜ່ານປັດຈຸບັນ"),
    newPassword: z.string().min(6, "ລະຫັດຜ່ານໃໝ່ຕ້ອງມີຢ່າງໜ້ອຍ 6 ຕົວອັກສອນ"),
    confirmPassword: z.string().min(1, "ກະລຸນາຢືນຢັນລະຫັດຜ່ານ"),
  })
  .refine((v) => v.newPassword === v.confirmPassword, {
    message: "ລະຫັດຜ່ານບໍ່ກົງກັນ",
    path: ["confirmPassword"],
  });

type ProfileValues = z.infer<typeof profileSchema>;
type PasswordValues = z.infer<typeof passwordSchema>;

function ProfileTab() {
  const { data } = useCustomerSession();
  const customer = data?.customer;
  const updateProfile = useUpdateProfile();
  const changePassword = useChangePassword();

  const profileMethods = RHF.useForm<ProfileValues>({
    resolver: zodResolver(profileSchema) as RHF.Resolver<ProfileValues>,
    values: {
      name: customer?.name ?? "",
      phone: customer?.phone ?? "",
    },
  });

  const passwordMethods = RHF.useForm<PasswordValues>({
    resolver: zodResolver(passwordSchema) as RHF.Resolver<PasswordValues>,
    defaultValues: { currentPassword: "", newPassword: "", confirmPassword: "" },
  });

  async function handleProfileSubmit(values: ProfileValues) {
    await updateProfile.mutateAsync({
      name: values.name,
      phone: values.phone || null,
    });
  }

  async function handlePasswordSubmit(values: PasswordValues) {
    await changePassword.mutateAsync({
      currentPassword: values.currentPassword,
      newPassword: values.newPassword,
    });
    passwordMethods.reset();
  }

  return (
    <div className="space-y-8">
      {/* Edit profile */}
      <section className="rounded-xl border p-5">
        <h2 className="mb-4 flex items-center gap-2 font-semibold">
          <UserIcon className="h-4 w-4 text-primary" />
          ຂໍ້ມູນສ່ວນຕົວ
        </h2>
        <FormRoot<ProfileValues>
          methods={profileMethods}
          onSubmit={handleProfileSubmit}
          className="space-y-4"
        >
          {/* Email — read only */}
          <div className="space-y-1.5">
            <p className="text-sm font-medium">ອີເມວ</p>
            <p className="rounded-lg border bg-muted/50 px-3 py-2 text-sm text-muted-foreground">
              {customer?.email}
            </p>
          </div>
          <div className="grid gap-4 sm:grid-cols-2">
            <FormInput name="name" label="ຊື່" requiredMark placeholder="ຊື່ ແລະ ນາມສະກຸນ" />
            <FormInput name="phone" label="ເບີໂທ" placeholder="020XXXXXXXX" />
          </div>
          <div className="flex justify-end">
            <Button type="submit" disabled={updateProfile.isPending}>
              {updateProfile.isPending ? "ກຳລັງບັນທຶກ..." : "ບັນທຶກ"}
            </Button>
          </div>
        </FormRoot>
      </section>

      {/* Change password — only for non-OAuth */}
      {customer?.hasPassword && (
        <section className="rounded-xl border p-5">
          <h2 className="mb-4 flex items-center gap-2 font-semibold">
            <LockIcon className="h-4 w-4 text-primary" />
            ປ່ຽນລະຫັດຜ່ານ
          </h2>
          <FormRoot<PasswordValues>
            methods={passwordMethods}
            onSubmit={handlePasswordSubmit}
            className="space-y-4"
          >
            <FormPassword
              name="currentPassword"
              label="ລະຫັດຜ່ານປັດຈຸບັນ"
              requiredMark
              placeholder="••••••••"
            />
            <div className="grid gap-4 sm:grid-cols-2">
              <FormPassword
                name="newPassword"
                label="ລະຫັດຜ່ານໃໝ່"
                requiredMark
                placeholder="••••••••"
              />
              <FormPassword
                name="confirmPassword"
                label="ຢືນຢັນລະຫັດຜ່ານໃໝ່"
                requiredMark
                placeholder="••••••••"
              />
            </div>
            <div className="flex justify-end">
              <Button type="submit" disabled={changePassword.isPending}>
                {changePassword.isPending ? "ກຳລັງປ່ຽນ..." : "ປ່ຽນລະຫັດຜ່ານ"}
              </Button>
            </div>
          </FormRoot>
        </section>
      )}
    </div>
  );
}

// ─── Orders Tab ───────────────────────────────────────────────────────────────

const ORDER_STATUS_OPTIONS = [
  { value: "ALL", label: "ທຸກສະຖານະ" },
  { value: "PENDING", label: "ລໍຖ້າ" },
  { value: "CONFIRMED", label: "ຢືນຢັນແລ້ວ" },
  { value: "PROCESSING", label: "ກຳລັງດຳເນີນ" },
  { value: "SHIPPED", label: "ຈັດສົ່ງແລ້ວ" },
  { value: "DELIVERED", label: "ສົ່ງຮອດແລ້ວ" },
  { value: "CANCELLED", label: "ຍົກເລີກ" },
  { value: "REFUNDED", label: "ຄືນເງິນ" },
];

function OrdersTab() {
  const nav = useNavigate();
  const [page, setPage] = useState(0);
  const [statusFilter, setStatusFilter] = useState("ALL");
  const LIMIT = 10;

  const query: Partial<MyOrderQueryDTO> = {
    limit: LIMIT,
    offset: page * LIMIT,
    status: statusFilter !== "ALL" ? (statusFilter as MyOrderQueryDTO["status"]) : undefined,
  };
  const ordersQuery = useMyOrdersQuery(query);
  const orders = ordersQuery.data;

  function handleStatusChange(value: string) {
    setStatusFilter(value);
    setPage(0);
  }

  return (
    <div className="space-y-4">
      {/* Filter */}
      <div className="flex items-center justify-between gap-3">
        <h2 className="flex items-center gap-2 font-semibold">
          <PackageIcon className="h-4 w-4 text-primary" />
          ຄຳສັ່ງຊື້ຂອງຂ້ອຍ
        </h2>
        <Select value={statusFilter} onValueChange={handleStatusChange}>
          <SelectTrigger className="w-44">
            <SelectValue placeholder="ທຸກສະຖານະ" />
          </SelectTrigger>
          <SelectContent>
            {ORDER_STATUS_OPTIONS.map((opt) => (
              <SelectItem key={opt.value} value={opt.value}>
                {opt.label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      {/* List */}
      {ordersQuery.isLoading ? (
        <div className="space-y-3">
          {Array.from({ length: 4 }).map((_, i) => (
            <Skeleton key={`sk-${i}`} className="h-16 w-full rounded-xl" />
          ))}
        </div>
      ) : !orders || orders.data.length === 0 ? (
        <div className="flex min-h-[200px] flex-col items-center justify-center gap-2 rounded-xl border border-dashed text-muted-foreground">
          <ShoppingBagIcon className="h-8 w-8 opacity-40" />
          <p className="text-sm">ຍັງບໍ່ມີຄຳສັ່ງຊື້</p>
        </div>
      ) : (
        <div className="space-y-2">
          {orders.data.map((order) => (
            <button
              key={order.id}
              type="button"
              onClick={() => nav({ to: "/account/orders/$id", params: { id: order.id } })}
              className="flex w-full items-center justify-between gap-4 rounded-xl border px-4 py-3 text-left transition-colors hover:bg-muted/50"
            >
              <div className="flex flex-col gap-1">
                <span className="font-mono text-sm font-semibold text-primary">
                  {order.orderNumber}
                </span>
                <span className="text-xs text-muted-foreground">
                  {new Date(order.createdAt).toLocaleDateString("lo-LA", {
                    year: "numeric",
                    month: "short",
                    day: "numeric",
                  })}
                </span>
              </div>
              <div className="flex items-center gap-3">
                <OrderStatusBadge status={order.status as OrderStatus} />
                <span className="font-semibold">{fmt(order.totalAmount)}</span>
                <ChevronRightIcon className="h-4 w-4 shrink-0 text-muted-foreground" />
              </div>
            </button>
          ))}
        </div>
      )}

      {/* Pagination */}
      {orders && orders.meta.total > LIMIT && (
        <div className="flex items-center justify-between pt-2">
          <p className="text-sm text-muted-foreground">
            {orders.meta.offset + 1}–{Math.min(orders.meta.offset + LIMIT, orders.meta.total)} ຈາກ{" "}
            {orders.meta.total} ລາຍການ
          </p>
          <div className="flex gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => setPage((p) => p - 1)}
              disabled={page === 0}
            >
              ກ່ອນໜ້າ
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={() => setPage((p) => p + 1)}
              disabled={orders.meta.offset + LIMIT >= orders.meta.total}
            >
              ຕໍ່ໄປ
            </Button>
          </div>
        </div>
      )}
    </div>
  );
}

// ─── Addresses Tab ────────────────────────────────────────────────────────────

type AddressModalState =
  | { mode: "closed" }
  | { mode: "create" }
  | { mode: "edit"; address: MyAddress };

function AddressesTab() {
  const [modal, setModal] = useState<AddressModalState>({ mode: "closed" });
  const addressesQuery = useMyAddressesQuery();
  const addresses = addressesQuery.data ?? [];

  const createAddress = useCreateAddress();
  const updateAddress = useUpdateAddress();
  const deleteAddress = useDeleteAddress();
  const setDefault = useSetDefaultAddress();

  function closeModal() {
    setModal({ mode: "closed" });
  }

  async function handleCreate(data: AddressUpsertDTO) {
    await createAddress.mutateAsync(data);
    closeModal();
  }

  async function handleUpdate(data: AddressUpsertDTO) {
    if (modal.mode !== "edit") return;
    await updateAddress.mutateAsync({ id: modal.address.id, input: data });
    closeModal();
  }

  async function handleDelete(address: MyAddress) {
    const ok = await confirm({
      title: "ລຶບທີ່ຢູ່?",
      description: `ຕ້ອງການລຶບທີ່ຢູ່ "${address.recipientName}" ແທ້ບໍ?`,
      actionText: "ລຶບ",
      ActionProps: { variant: "destructive" },
    });
    if (!ok) return;
    await deleteAddress.mutateAsync(address.id);
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h2 className="flex items-center gap-2 font-semibold">
          <MapPinIcon className="h-4 w-4 text-primary" />
          ທີ່ຢູ່ຈັດສົ່ງ
        </h2>
        <Button size="sm" onClick={() => setModal({ mode: "create" })}>
          + ເພີ່ມທີ່ຢູ່
        </Button>
      </div>

      {addressesQuery.isLoading ? (
        <div className="space-y-3">
          {Array.from({ length: 2 }).map((_, i) => (
            <Skeleton key={`sk-${i}`} className="h-20 w-full rounded-xl" />
          ))}
        </div>
      ) : addresses.length === 0 ? (
        <div className="flex min-h-[180px] flex-col items-center justify-center gap-2 rounded-xl border border-dashed text-muted-foreground">
          <MapPinIcon className="h-8 w-8 opacity-40" />
          <p className="text-sm">ຍັງບໍ່ມີທີ່ຢູ່ຈັດສົ່ງ</p>
        </div>
      ) : (
        <div className="space-y-3">
          {addresses.map((addr) => (
            <AddressCard
              key={addr.id}
              address={addr}
              canDelete={addresses.length > 1}
              onEdit={() => setModal({ mode: "edit", address: addr })}
              onDelete={() => handleDelete(addr)}
              onSetDefault={() => setDefault.mutate(addr.id)}
              isDeleting={deleteAddress.isPending}
              isSettingDefault={setDefault.isPending}
            />
          ))}
        </div>
      )}

      {/* Create modal */}
      <AddressFormModal
        open={modal.mode === "create"}
        onClose={closeModal}
        onSubmit={handleCreate}
        isPending={createAddress.isPending}
        title="ເພີ່ມທີ່ຢູ່ໃໝ່"
      />

      {/* Edit modal */}
      <AddressFormModal
        open={modal.mode === "edit"}
        onClose={closeModal}
        initial={modal.mode === "edit" ? modal.address : undefined}
        onSubmit={handleUpdate}
        isPending={updateAddress.isPending}
        title="ແກ້ໄຂທີ່ຢູ່"
      />
    </div>
  );
}

// ─── Tabs config ──────────────────────────────────────────────────────────────

type Tab = "profile" | "orders" | "addresses";

const TABS: { key: Tab; label: string; icon: React.ReactNode }[] = [
  { key: "profile", label: "ໂປຣໄຟລ໌", icon: <UserIcon className="h-4 w-4" /> },
  { key: "orders", label: "ຄຳສັ່ງຊື້", icon: <PackageIcon className="h-4 w-4" /> },
  { key: "addresses", label: "ທີ່ຢູ່", icon: <MapPinIcon className="h-4 w-4" /> },
];

// ─── Page ─────────────────────────────────────────────────────────────────────

export function AccountPage() {
  const [tab, setTab] = useState<Tab>("profile");
  const { data } = useCustomerSession();
  const customer = data?.customer;

  return (
    <CustomerAuthGuard>
      <div className="min-h-screen bg-background">
        <ShopNavbar />

        <div className="mx-auto max-w-3xl px-4 py-8">
          {/* Profile header */}
          <div className="mb-6 flex items-center gap-4">
            <div className="flex h-14 w-14 shrink-0 items-center justify-center rounded-full bg-primary/10 text-xl font-bold text-primary">
              {customer?.name.charAt(0).toUpperCase() ?? "?"}
            </div>
            <div>
              <h1 className="text-lg font-bold">{customer?.name}</h1>
              <p className="text-sm text-muted-foreground">{customer?.email}</p>
            </div>
          </div>

          {/* Tab bar */}
          <div className="mb-6 flex gap-1 rounded-xl border bg-muted/40 p-1">
            {TABS.map((t) => (
              <button
                key={t.key}
                type="button"
                onClick={() => setTab(t.key)}
                className={`flex flex-1 items-center justify-center gap-1.5 rounded-lg px-3 py-2 text-sm font-medium transition-colors ${
                  tab === t.key
                    ? "bg-background text-foreground shadow-sm"
                    : "text-muted-foreground hover:text-foreground"
                }`}
              >
                {t.icon}
                <span className="hidden sm:inline">{t.label}</span>
              </button>
            ))}
          </div>

          {/* Tab content */}
          {tab === "profile" && <ProfileTab />}
          {tab === "orders" && <OrdersTab />}
          {tab === "addresses" && <AddressesTab />}
        </div>
      </div>
    </CustomerAuthGuard>
  );
}
