import { config } from "@/shared/lib/config";
import { fetcher } from "@/shared/lib/fetcher";

const BASE = `${config.apiUrl}/shop`;

export interface ShopProduct {
  id: string;
  name: string;
  basePrice: string;
  categoryId: string | null;
  categoryName: string | null;
  availableStock: number;
  mainImage: string | null;
}

export interface ShopProductVariant {
  id: string;
  sku: string | null;
  colorId: string | null;
  colorName: string | null;
  size: string | null;
  price: string | null; // null = use basePrice
  imageUrl: string | null;
  isActive: boolean;
}

export interface ShopProductDetail {
  id: string;
  name: string;
  description: string | null;
  basePrice: string;
  categoryId: string | null;
  categoryName: string | null;
  availableStock: number;
  images: { id: string; url: string; order: number; isMain: boolean }[];
  variants: ShopProductVariant[];
}

export interface ShopCategory {
  id: string;
  name: string;
}

export interface ShopBanner {
  id: string;
  title: string;
  imageUrl: string;
  linkUrl: string | null;
  order: number;
}

export interface ShopProductListResult {
  data: ShopProduct[];
  meta: { total: number; limit: number; offset: number };
}

export const shopApi = {
  async listBanners(): Promise<{ data: ShopBanner[] }> {
    return fetcher.get(`${BASE}/banners`);
  },

  async listCategories(): Promise<{ data: ShopCategory[] }> {
    return fetcher.get(`${BASE}/categories`);
  },

  async listProducts(params: {
    limit?: number;
    offset?: number;
    search?: string;
    categoryId?: string;
  } = {}): Promise<ShopProductListResult> {
    const url = new URL(`${BASE}/products`);
    if (params.limit) url.searchParams.set("limit", String(params.limit));
    if (params.offset) url.searchParams.set("offset", String(params.offset));
    if (params.search) url.searchParams.set("search", params.search);
    if (params.categoryId) url.searchParams.set("categoryId", params.categoryId);
    return fetcher.get(url.toString());
  },

  async getProduct(id: string): Promise<ShopProductDetail> {
    return fetcher.get(`${BASE}/products/${id}`);
  },
};
