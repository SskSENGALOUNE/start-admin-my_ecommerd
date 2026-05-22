import type { OffsetPageQueryDTO } from "@/shared/contracts/base";
import { config } from "@/shared/lib/config";
import { fetcher } from "@/shared/lib/fetcher";
import type { CategoryDTO } from "../../domain/contracts/category.contract";

export interface CategoryListResult {
  data: CategoryDTO[];
  meta: { total: number; limit: number; offset: number };
}

export const categoriesApi = {
  async list(query: Partial<OffsetPageQueryDTO> = {}): Promise<CategoryListResult> {
    const url = new URL(`${config.apiUrl}/categories`);
    url.searchParams.set("limit", String(query.limit ?? 100));
    url.searchParams.set("offset", String(query.offset ?? 0));
    return fetcher.get<CategoryListResult>(url.toString());
  },

  async get(id: string): Promise<CategoryDTO> {
    return fetcher.get<CategoryDTO>(`${config.apiUrl}/categories/${id}`);
  },

  async create(input: { name: string }): Promise<CategoryDTO> {
    return fetcher.post<CategoryDTO>(`${config.apiUrl}/categories`, input);
  },

  async update(id: string, input: { name: string }): Promise<CategoryDTO> {
    return fetcher.patch<CategoryDTO>(
      `${config.apiUrl}/categories/${id}`,
      input,
    );
  },

  async remove(id: string): Promise<CategoryDTO> {
    return fetcher.delete<CategoryDTO>(`${config.apiUrl}/categories/${id}`);
  },
};
