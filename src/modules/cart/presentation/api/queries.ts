import { toast } from "@devhop/ui";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import type { AddCartItemDTO } from "../../domain/contracts/cart.contract";
import { cartApi } from "./client";
import { useCustomerSession } from "@/modules/customer-auth/presentation/model/useCustomerAuth";

export const cartKeys = {
  cart: ["cart"] as const,
};

export function useCart() {
  const { data: auth } = useCustomerSession();
  return useQuery({
    queryKey: cartKeys.cart,
    queryFn: () => cartApi.getCart(),
    enabled: !!auth?.customer, // fetch only when logged in
    staleTime: 1000 * 30,
    retry: false,
  });
}

export function useAddToCart() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (input: AddCartItemDTO) => cartApi.addItem(input),
    onSuccess: (cart) => {
      toast.success(`ເພີ່ມໃສ່ກະຕ່າແລ້ວ ✓`);
      qc.setQueryData(cartKeys.cart, cart);
    },
    onError: (err) => {
      toast.error(err instanceof Error ? err.message : "ເພີ່ມໃສ່ກະຕ່າລົ້ມເຫຼວ");
    },
  });
}

export function useUpdateCartItem() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ itemId, quantity }: { itemId: string; quantity: number }) =>
      cartApi.updateItem(itemId, { quantity }),
    onSuccess: (cart) => qc.setQueryData(cartKeys.cart, cart),
    onError: () => toast.error("ອັບເດດລົ້ມເຫຼວ"),
  });
}

export function useRemoveCartItem() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (itemId: string) => cartApi.removeItem(itemId),
    onSuccess: (cart) => {
      toast.success("ລຶບລາຍການແລ້ວ");
      qc.setQueryData(cartKeys.cart, cart);
    },
    onError: () => toast.error("ລຶບລົ້ມເຫຼວ"),
  });
}

export function useClearCart() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: () => cartApi.clearCart(),
    onSuccess: (cart) => qc.setQueryData(cartKeys.cart, cart),
  });
}
