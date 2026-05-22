import { config } from "@/shared/lib/config";
import { fetcher } from "@/shared/lib/fetcher";
import type { CartDTO, AddCartItemDTO, UpdateCartItemDTO } from "../../domain/contracts/cart.contract";

const BASE = `${config.apiUrl}/cart`;

export const cartApi = {
  async getCart(): Promise<CartDTO> {
    return fetcher.get<CartDTO>(BASE);
  },

  async addItem(input: AddCartItemDTO): Promise<CartDTO> {
    return fetcher.post<CartDTO>(`${BASE}/items`, input);
  },

  async updateItem(itemId: string, input: UpdateCartItemDTO): Promise<CartDTO> {
    return fetcher.patch<CartDTO>(`${BASE}/items/${itemId}`, input);
  },

  async removeItem(itemId: string): Promise<CartDTO> {
    return fetcher.delete<CartDTO>(`${BASE}/items/${itemId}`);
  },

  async clearCart(): Promise<CartDTO> {
    return fetcher.delete<CartDTO>(BASE);
  },
};
