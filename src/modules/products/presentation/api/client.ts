import { config } from "@/shared/lib/config";
import { fetcher } from "@/shared/lib/fetcher";
import type { ColorDTO, CreateVariantDTO, UpdateVariantDTO, VariantDTO } from "../../domain/contracts/variant.contract";
import type {
  CreateProductDTO,
  ProductDTO,
  ProductQueryDTO,
  UpdateProductDTO,
} from "../../domain/contracts/product.contract";

export interface ProductListResult {
  data: (ProductDTO & { mainImage: { url: string } | null })[];
  meta: { total: number; limit: number; offset: number };
}

export const productsApi = {
  // Colors
  async listColors(): Promise<ColorDTO[]> {
    return fetcher.get<ColorDTO[]>(`${config.apiUrl}/colors`);
  },

  // Products
  async list(query: Partial<ProductQueryDTO> = {}): Promise<ProductListResult> {
    const url = new URL(`${config.apiUrl}/products`);
    url.searchParams.set("limit", String(query.limit ?? 20));
    url.searchParams.set("offset", String(query.offset ?? 0));
    if (query.search) url.searchParams.set("search", query.search);
    if (query.categoryId) url.searchParams.set("categoryId", query.categoryId);
    if (query.isActive !== undefined)
      url.searchParams.set("isActive", String(query.isActive));
    return fetcher.get<ProductListResult>(url.toString());
  },

  async get(id: string): Promise<ProductDTO> {
    return fetcher.get<ProductDTO>(`${config.apiUrl}/products/${id}`);
  },

  async create(input: CreateProductDTO): Promise<ProductDTO> {
    return fetcher.post<ProductDTO>(`${config.apiUrl}/products`, input);
  },

  async update(id: string, input: UpdateProductDTO): Promise<ProductDTO> {
    return fetcher.patch<ProductDTO>(`${config.apiUrl}/products/${id}`, input);
  },

  async remove(id: string): Promise<ProductDTO> {
    return fetcher.delete<ProductDTO>(`${config.apiUrl}/products/${id}`);
  },

  // Images
  async addImage(productId: string, url: string) {
    return fetcher.post(`${config.apiUrl}/products/${productId}/images`, { url });
  },

  async deleteImage(productId: string, imageId: string) {
    return fetcher.delete(`${config.apiUrl}/products/${productId}/images/${imageId}`);
  },

  // Variants
  async listVariants(productId: string): Promise<VariantDTO[]> {
    return fetcher.get<VariantDTO[]>(`${config.apiUrl}/products/${productId}/variants`);
  },

  async createVariant(productId: string, input: CreateVariantDTO): Promise<VariantDTO> {
    return fetcher.post<VariantDTO>(`${config.apiUrl}/products/${productId}/variants`, input);
  },

  async updateVariant(productId: string, variantId: string, input: UpdateVariantDTO): Promise<VariantDTO> {
    return fetcher.patch<VariantDTO>(
      `${config.apiUrl}/products/${productId}/variants/${variantId}`,
      input,
    );
  },

  async deleteVariant(productId: string, variantId: string): Promise<VariantDTO> {
    return fetcher.delete<VariantDTO>(
      `${config.apiUrl}/products/${productId}/variants/${variantId}`,
    );
  },
};
