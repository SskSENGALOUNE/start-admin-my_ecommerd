import { useQuery } from "@tanstack/react-query";
import { shopApi } from "./client";

export const shopKeys = {
  banners: ["shop", "banners"] as const,
  categories: ["shop", "categories"] as const,
  products: (p?: object) => ["shop", "products", p] as const,
  product: (id: string) => ["shop", "product", id] as const,
};

export function useShopBanners() {
  return useQuery({
    queryKey: shopKeys.banners,
    queryFn: () => shopApi.listBanners(),
    staleTime: 1000 * 60 * 5,
  });
}

export function useShopCategories() {
  return useQuery({
    queryKey: shopKeys.categories,
    queryFn: () => shopApi.listCategories(),
    staleTime: 1000 * 60 * 10,
  });
}

export function useShopProducts(params: {
  limit?: number;
  offset?: number;
  search?: string;
  categoryId?: string;
} = {}) {
  return useQuery({
    queryKey: shopKeys.products(params),
    queryFn: () => shopApi.listProducts(params),
    staleTime: 1000 * 60 * 2,
  });
}

export function useShopProduct(id: string) {
  return useQuery({
    queryKey: shopKeys.product(id),
    queryFn: () => shopApi.getProduct(id),
    enabled: !!id,
  });
}
