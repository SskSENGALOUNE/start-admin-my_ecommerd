import { Header } from "@/app/layout/Header";
import { Main } from "@/app/layout/Main";
import { useActionPermission } from "@/modules/auth/presentation/model/useActionPermission";
import { QueryState } from "@/shared/ui/QueryState";
import {
  Badge,
  Button,
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  confirm,
} from "@devhop/ui";
import {
  ArrowLeftIcon,
  BanIcon,
  MapPinIcon,
  ShieldCheckIcon,
  ShoppingBagIcon,
} from "lucide-react";
import { useNavigate, useParams } from "@tanstack/react-router";
import { OrderStatusBadge } from "@/modules/orders/presentation/ui/OrderStatusBadge";
import type { OrderStatus } from "@/modules/orders/domain/contracts/order.contract";
import {
  useBanCustomer,
  useCustomerQuery,
  useUnbanCustomer,
} from "../api/queries";
import { CustomerStatusBadge } from "../ui/CustomerStatusBadge";

export function CustomerDetailPage() {
  const nav = useNavigate();
  const { id } = useParams({ from: "/app/customers/$id" });

  const customerQuery = useCustomerQuery(id);
  const customer = customerQuery.data;

  const banMutation = useBanCustomer();
  const unbanMutation = useUnbanCustomer();
  const canUpdate = useActionPermission(["customers:update"]);

  const formatPrice = (v: string) =>
    Number(v).toLocaleString("lo-LA") + " ກີບ";

  async function handleBan() {
    const ok = await confirm({
      title: "ລະງັບລູກຄ້າ?",
      description: `ຕ້ອງການລະງັບ "${customer?.name}" ແທ້ບໍ?`,
      actionText: "ລະງັບ",
      ActionProps: { variant: "destructive" },
    });
    if (!ok) return;
    await banMutation.mutateAsync(id);
  }

  async function handleUnban() {
    const ok = await confirm({
      title: "ກູ້ຄືນລູກຄ້າ?",
      description: `ຕ້ອງການກູ້ຄືນ "${customer?.name}" ແທ້ບໍ?`,
      actionText: "ກູ້ຄືນ",
    });
    if (!ok) return;
    await unbanMutation.mutateAsync(id);
  }

  return (
    <>
      <Header />
      <Main>
        {/* Back */}
        <button
          type="button"
          onClick={() => nav({ to: "/app/customers" })}
          className="mb-4 flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground"
        >
          <ArrowLeftIcon className="h-4 w-4" />
          ກັບໄປລາຍການ
        </button>

        <QueryState query={customerQuery}>
          {customer && (
            <div className="space-y-6">
              {/* Profile Header */}
              <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
                <div className="flex items-center gap-4">
                  {/* Avatar */}
                  <div className="flex h-14 w-14 items-center justify-center rounded-full bg-primary/10 text-xl font-bold text-primary">
                    {customer.name.charAt(0).toUpperCase()}
                  </div>
                  <div>
                    <h1 className="text-xl font-semibold">{customer.name}</h1>
                    <p className="text-sm text-muted-foreground">
                      {customer.email}
                    </p>
                    {customer.phone && (
                      <p className="text-sm text-muted-foreground">
                        {customer.phone}
                      </p>
                    )}
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  <CustomerStatusBadge isActive={customer.isActive} />
                  {canUpdate && customer.isActive && (
                    <Button
                      size="sm"
                      variant="destructive"
                      onClick={handleBan}
                      disabled={banMutation.isPending}
                    >
                      <BanIcon className="mr-1.5 h-4 w-4" />
                      ລະງັບ
                    </Button>
                  )}
                  {canUpdate && !customer.isActive && (
                    <Button
                      size="sm"
                      variant="secondary"
                      onClick={handleUnban}
                      disabled={unbanMutation.isPending}
                    >
                      <ShieldCheckIcon className="mr-1.5 h-4 w-4" />
                      ກູ້ຄືນ
                    </Button>
                  )}
                </div>
              </div>

              {/* Stats */}
              <div className="grid gap-4 sm:grid-cols-3">
                <Card>
                  <CardContent className="pt-5">
                    <p className="text-sm text-muted-foreground">ຄຳສັ່ງຊື້ທັງໝົດ</p>
                    <p className="mt-1 text-2xl font-bold">
                      {customer.totalOrders}
                    </p>
                  </CardContent>
                </Card>
                <Card>
                  <CardContent className="pt-5">
                    <p className="text-sm text-muted-foreground">ຍອດຊື້ທັງໝົດ</p>
                    <p className="mt-1 text-2xl font-bold">
                      {formatPrice(customer.totalSpent)}
                    </p>
                  </CardContent>
                </Card>
                <Card>
                  <CardContent className="pt-5">
                    <p className="text-sm text-muted-foreground">ສະໝັກເມື່ອ</p>
                    <p className="mt-1 text-lg font-semibold">
                      {new Date(customer.createdAt).toLocaleDateString("lo-LA", {
                        year: "numeric",
                        month: "short",
                        day: "numeric",
                      })}
                    </p>
                  </CardContent>
                </Card>
              </div>

              <div className="grid gap-6 lg:grid-cols-2">
                {/* Order History */}
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2 text-base">
                      <ShoppingBagIcon className="h-4 w-4" />
                      ປະຫວັດຄຳສັ່ງຊື້ (10 ລ່າສຸດ)
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    {customer.orders.length === 0 ? (
                      <p className="text-sm text-muted-foreground">
                        ຍັງບໍ່ມີຄຳສັ່ງຊື້
                      </p>
                    ) : (
                      <div className="space-y-2">
                        {customer.orders.map((order) => (
                          <button
                            key={order.id}
                            type="button"
                            onClick={() =>
                              nav({
                                to: "/app/orders/$id",
                                params: { id: order.id },
                              })
                            }
                            className="flex w-full items-center justify-between rounded-lg border px-3 py-2 text-sm transition-colors hover:bg-muted/50"
                          >
                            <div className="flex items-center gap-3">
                              <span className="font-mono font-medium text-primary">
                                {order.orderNumber}
                              </span>
                              <OrderStatusBadge
                                status={order.status as OrderStatus}
                              />
                            </div>
                            <div className="text-right">
                              <p className="font-medium">
                                {formatPrice(order.totalAmount)}
                              </p>
                              <p className="text-xs text-muted-foreground">
                                {new Date(order.createdAt).toLocaleDateString(
                                  "lo-LA",
                                )}
                              </p>
                            </div>
                          </button>
                        ))}
                      </div>
                    )}
                  </CardContent>
                </Card>

                {/* Addresses */}
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2 text-base">
                      <MapPinIcon className="h-4 w-4" />
                      ທີ່ຢູ່ ({customer.addresses.length})
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    {customer.addresses.length === 0 ? (
                      <p className="text-sm text-muted-foreground">
                        ຍັງບໍ່ມີທີ່ຢູ່
                      </p>
                    ) : (
                      <div className="space-y-3">
                        {customer.addresses.map((addr) => (
                          <div
                            key={addr.id}
                            className="rounded-lg border p-3 text-sm"
                          >
                            <div className="mb-1 flex items-center justify-between">
                              <span className="font-medium">
                                {addr.recipientName}
                              </span>
                              <div className="flex items-center gap-1.5">
                                {addr.label && (
                                  <Badge variant="outline" className="text-xs">
                                    {addr.label}
                                  </Badge>
                                )}
                                {addr.isDefault && (
                                  <Badge className="text-xs">ຕັ້ງຕົ້ນ</Badge>
                                )}
                              </div>
                            </div>
                            <p className="text-muted-foreground">
                              {addr.recipientPhone}
                            </p>
                            <p className="text-muted-foreground">
                              {[addr.address, addr.village, addr.district, addr.province]
                                .filter(Boolean)
                                .join(", ")}
                            </p>
                          </div>
                        ))}
                      </div>
                    )}
                  </CardContent>
                </Card>
              </div>
            </div>
          )}
        </QueryState>
      </Main>
    </>
  );
}
