import { toast } from "@devhop/ui";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { customerAuthKeys } from "@/modules/customer-auth/presentation/model/useCustomerAuth";
import type { MyOrderQueryDTO, UpdateProfileDTO, ChangePasswordDTO, AddressUpsertDTO } from "../../domain/contracts/customer-account.contract";
import { customerAccountApi } from "./client";

// ─── Query keys ───────────────────────────────────────────────────────────────

export const customerAccountKeys = {
  all: ["customer-account"] as const,
  orders: (q?: Partial<MyOrderQueryDTO>) => ["customer-account", "orders", q] as const,
  order: (id: string) => ["customer-account", "order", id] as const,
  addresses: () => ["customer-account", "addresses"] as const,
};

// ─── Orders ───────────────────────────────────────────────────────────────────

export function useMyOrdersQuery(query: Partial<MyOrderQueryDTO> = {}) {
  return useQuery({
    queryKey: customerAccountKeys.orders(query),
    queryFn: () => customerAccountApi.listOrders(query),
  });
}

export function useMyOrderQuery(id: string) {
  return useQuery({
    queryKey: customerAccountKeys.order(id),
    queryFn: () => customerAccountApi.getOrder(id),
    enabled: !!id,
  });
}

export function useCancelMyOrder() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => customerAccountApi.cancelOrder(id),
    onSuccess: (_, id) => {
      toast.success("ຍົກເລີກຄຳສັ່ງຊື້ສຳເລັດ");
      qc.invalidateQueries({ queryKey: customerAccountKeys.orders() });
      qc.invalidateQueries({ queryKey: customerAccountKeys.order(id) });
    },
    onError: () => toast.error("ຍົກເລີກຄຳສັ່ງຊື້ລົ້ມເຫຼວ"),
  });
}

// ─── Profile ──────────────────────────────────────────────────────────────────

export function useUpdateProfile() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (input: UpdateProfileDTO) => customerAccountApi.updateProfile(input),
    onSuccess: () => {
      toast.success("ອັບເດດໂປຣໄຟລ໌ສຳເລັດ");
      // Refresh session so ShopNavbar shows updated name
      qc.invalidateQueries({ queryKey: customerAuthKeys.me });
    },
    onError: () => toast.error("ອັບເດດໂປຣໄຟລ໌ລົ້ມເຫຼວ"),
  });
}

export function useChangePassword() {
  return useMutation({
    mutationFn: (input: ChangePasswordDTO) => customerAccountApi.changePassword(input),
    onSuccess: () => toast.success("ປ່ຽນລະຫັດຜ່ານສຳເລັດ"),
    onError: () => toast.error("ປ່ຽນລະຫັດຜ່ານລົ້ມເຫຼວ"),
  });
}

// ─── Addresses ────────────────────────────────────────────────────────────────

export function useMyAddressesQuery() {
  return useQuery({
    queryKey: customerAccountKeys.addresses(),
    queryFn: () => customerAccountApi.listAddresses(),
  });
}

export function useCreateAddress() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (input: AddressUpsertDTO) => customerAccountApi.createAddress(input),
    onSuccess: () => {
      toast.success("ເພີ່ມທີ່ຢູ່ສຳເລັດ");
      qc.invalidateQueries({ queryKey: customerAccountKeys.addresses() });
    },
    onError: () => toast.error("ເພີ່ມທີ່ຢູ່ລົ້ມເຫຼວ"),
  });
}

export function useUpdateAddress() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ id, input }: { id: string; input: AddressUpsertDTO }) =>
      customerAccountApi.updateAddress(id, input),
    onSuccess: () => {
      toast.success("ແກ້ໄຂທີ່ຢູ່ສຳເລັດ");
      qc.invalidateQueries({ queryKey: customerAccountKeys.addresses() });
    },
    onError: () => toast.error("ແກ້ໄຂທີ່ຢູ່ລົ້ມເຫຼວ"),
  });
}

export function useDeleteAddress() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => customerAccountApi.deleteAddress(id),
    onSuccess: () => {
      toast.success("ລຶບທີ່ຢູ່ສຳເລັດ");
      qc.invalidateQueries({ queryKey: customerAccountKeys.addresses() });
    },
    onError: () => toast.error("ລຶບທີ່ຢູ່ລົ້ມເຫຼວ"),
  });
}

export function useSetDefaultAddress() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => customerAccountApi.setDefaultAddress(id),
    onSuccess: () => {
      toast.success("ຕັ້ງທີ່ຢູ່ຫຼັກສຳເລັດ");
      qc.invalidateQueries({ queryKey: customerAccountKeys.addresses() });
    },
    onError: () => toast.error("ຕັ້ງທີ່ຢູ່ຫຼັກລົ້ມເຫຼວ"),
  });
}
