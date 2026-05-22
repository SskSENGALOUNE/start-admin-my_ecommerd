import type { OffsetPageQueryDTO } from "@/shared/contracts/base";
import { config } from "@/shared/lib/config";
import { fetcher } from "@/shared/lib/fetcher";
import type { BannerDTO, CreateBannerDTO, UpdateBannerDTO } from "../../domain/contracts/banner.contract";

export interface BannerListResult {
  data: BannerDTO[];
  meta: { total: number; limit: number; offset: number };
}

export const bannersApi = {
  async list(query: Partial<OffsetPageQueryDTO> = {}): Promise<BannerListResult> {
    const url = new URL(`${config.apiUrl}/banners`);
    url.searchParams.set("limit", String(query.limit ?? 100));
    url.searchParams.set("offset", String(query.offset ?? 0));
    return fetcher.get<BannerListResult>(url.toString());
  },

  async get(id: string): Promise<BannerDTO> {
    return fetcher.get<BannerDTO>(`${config.apiUrl}/banners/${id}`);
  },

  async create(input: CreateBannerDTO): Promise<BannerDTO> {
    return fetcher.post<BannerDTO>(`${config.apiUrl}/banners`, input);
  },

  async update(id: string, input: UpdateBannerDTO): Promise<BannerDTO> {
    return fetcher.patch<BannerDTO>(`${config.apiUrl}/banners/${id}`, input);
  },

  async remove(id: string): Promise<BannerDTO> {
    return fetcher.delete<BannerDTO>(`${config.apiUrl}/banners/${id}`);
  },
};
