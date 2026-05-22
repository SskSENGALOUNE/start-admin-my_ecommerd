import { toast } from "@devhop/ui";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { cartKeys } from "@/modules/cart/presentation/api/queries";
import type {
  PlaceOrderDTO,
  PlaceOrderResponse,
  ValidateCouponDTO,
  ValidateCouponResponse,
} from "../../domain/contracts/checkout.contract";
import { checkoutApi } from "./client";

export function usePlaceOrder() {
  const qc = useQueryClient();
  return useMutation<PlaceOrderResponse, Error, PlaceOrderDTO>({
    mutationFn: (input) => checkoutApi.placeOrder(input),
    onSuccess: () => {
      qc.setQueryData(cartKeys.cart, null);
      qc.invalidateQueries({ queryKey: cartKeys.cart });
    },
    onError: (err) => {
      toast.error(err.message || "ສັ່ງຊື້ລົ້ມເຫຼວ");
    },
  });
}

export function useValidateCoupon() {
  return useMutation<ValidateCouponResponse, Error, ValidateCouponDTO>({
    mutationFn: (input) => checkoutApi.validateCoupon(input),
    // errors shown inline — not via toast
  });
}
