import { config } from "@/shared/lib/config";
import { fetcher } from "@/shared/lib/fetcher";
import type { CustomerSession, LoginDTO, RegisterDTO } from "../../domain/contracts/customer-auth.contract";

const BASE = `${config.apiUrl}/customer-auth`;

export interface CustomerAuthResponse {
  customer: CustomerSession;
}

export const customerAuthApi = {
  async register(input: RegisterDTO): Promise<CustomerAuthResponse> {
    return fetcher.post<CustomerAuthResponse>(`${BASE}/register`, input);
  },

  async login(input: LoginDTO): Promise<CustomerAuthResponse> {
    return fetcher.post<CustomerAuthResponse>(`${BASE}/login`, input);
  },

  async logout(): Promise<void> {
    await fetcher.post(`${BASE}/logout`, {});
  },

  async me(): Promise<CustomerAuthResponse | null> {
    try {
      return await fetcher.get<CustomerAuthResponse>(`${BASE}/me`);
    } catch {
      return null;
    }
  },
};
