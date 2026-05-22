import { config } from "@/shared/lib/config";
import { fetcher } from "@/shared/lib/fetcher";
import type {
  PlaceOrderDTO,
  PlaceOrderResponse,
  ValidateCouponDTO,
  ValidateCouponResponse,
} from "../../domain/contracts/checkout.contract";

const BASE = `${config.apiUrl}/checkout`;

export const checkoutApi = {
  async placeOrder(input: PlaceOrderDTO): Promise<PlaceOrderResponse> {
    return fetcher.post<PlaceOrderResponse>(BASE, input);
  },

  async validateCoupon(input: ValidateCouponDTO): Promise<ValidateCouponResponse> {
    return fetcher.post<ValidateCouponResponse>(`${BASE}/validate-coupon`, input);
  },
};
