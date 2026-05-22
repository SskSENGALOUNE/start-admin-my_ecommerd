import type { ProductQueryDTO } from "../../domain/contracts/product.contract";
import type { CreateVariantDTO, UpdateVariantDTO } from "../../domain/contracts/variant.contract";
import { toast } from "@devhop/ui";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import type { CreateProductDTO, UpdateProductDTO } from "../../domain/contracts/product.contract";
import { productsApi } from "./client";

export const productsKeys = {
  all: ["products"] as const,
  list: (q: Partial<ProductQueryDTO>) => ["products", "list", q] as const,
  detail: (id: string) => ["products", "detail", id] as const,
  variants: (productId: string) => ["products", productId, "variants"] as const,
  colors: ["colors"] as const,
};

// ── Colors ────────────────────────────────────────────────────────────────────
export function useColorsQuery() {
  return useQuery({
    queryKey: productsKeys.colors,
    queryFn: () => productsApi.listColors(),
    staleTime: 1000 * 60 * 10, // colors ไม่ค่อยเปลี่ยน cache 10 min
  });
}

// ── Products ──────────────────────────────────────────────────────────────────
export function useProductsQuery(query: Partial<ProductQueryDTO> = {}) {
  return useQuery({
    queryKey: productsKeys.list(query),
    queryFn: () => productsApi.list(query),
  });
}

export function useProductQuery(id: string) {
  return useQuery({
    queryKey: productsKeys.detail(id),
    queryFn: () => productsApi.get(id),
    enabled: !!id,
  });
}

export function useCreateProduct() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (input: CreateProductDTO) => productsApi.create(input),
    onSuccess: () => {
      toast.success("ສ້າງສິນຄ້າສຳເລັດ");
      qc.invalidateQueries({ queryKey: productsKeys.all });
    },
    onError: () => toast.error("ສ້າງສິນຄ້າບໍ່ສຳເລັດ"),
  });
}

export function useUpdateProduct(id: string) {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (input: UpdateProductDTO) => productsApi.update(id, input),
    onSuccess: () => {
      toast.success("ແກ້ໄຂສິນຄ້າສຳເລັດ");
      qc.invalidateQueries({ queryKey: productsKeys.detail(id) });
      qc.invalidateQueries({ queryKey: productsKeys.all });
    },
    onError: () => toast.error("ແກ້ໄຂສິນຄ້າບໍ່ສຳເລັດ"),
  });
}

export function useDeleteProduct() {
  const qc = useQueryClient();
  const base = useMutation({
    mutationFn: (id: string) => productsApi.remove(id),
    onSuccess: () => {
      toast.success("ລຶບສິນຄ້າສຳເລັດ");
      qc.invalidateQueries({ queryKey: productsKeys.all });
    },
    onError: () => toast.error("ລຶບສິນຄ້າບໍ່ສຳເລັດ"),
  });
  const run = (id: string) =>
    new Promise<void>((resolve, reject) =>
      base.mutate(id, { onSuccess: () => resolve(), onError: reject }),
    );
  return { ...base, run };
}

// ── Images ────────────────────────────────────────────────────────────────────
export function useAddProductImage(productId: string) {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (url: string) => productsApi.addImage(productId, url),
    onSuccess: () => qc.invalidateQueries({ queryKey: productsKeys.detail(productId) }),
    onError: () => toast.error("ເພີ່ມຮູບບໍ່ສຳເລັດ"),
  });
}

export function useDeleteProductImage(productId: string) {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (imageId: string) => productsApi.deleteImage(productId, imageId),
    onSuccess: () => qc.invalidateQueries({ queryKey: productsKeys.detail(productId) }),
    onError: () => toast.error("ລຶບຮູບບໍ່ສຳເລັດ"),
  });
}

// ── Variants ──────────────────────────────────────────────────────────────────
export function useVariantsQuery(productId: string) {
  return useQuery({
    queryKey: productsKeys.variants(productId),
    queryFn: () => productsApi.listVariants(productId),
    enabled: !!productId,
  });
}

export function useCreateVariant(productId: string) {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (input: CreateVariantDTO) =>
      productsApi.createVariant(productId, input),
    onSuccess: () => {
      toast.success("ເພີ່ມ Variant ສຳເລັດ");
      qc.invalidateQueries({ queryKey: productsKeys.variants(productId) });
    },
    onError: (e: Error) =>
      toast.error(e.message ?? "ເພີ່ມ Variant ບໍ່ສຳເລັດ"),
  });
}

export function useUpdateVariant(productId: string, variantId: string) {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (input: UpdateVariantDTO) =>
      productsApi.updateVariant(productId, variantId, input),
    onSuccess: () => {
      toast.success("ແກ້ໄຂ Variant ສຳເລັດ");
      qc.invalidateQueries({ queryKey: productsKeys.variants(productId) });
    },
    onError: () => toast.error("ແກ້ໄຂ Variant ບໍ່ສຳເລັດ"),
  });
}

export function useDeleteVariant(productId: string) {
  const qc = useQueryClient();
  const base = useMutation({
    mutationFn: (variantId: string) =>
      productsApi.deleteVariant(productId, variantId),
    onSuccess: () => {
      toast.success("ລຶບ Variant ສຳເລັດ");
      qc.invalidateQueries({ queryKey: productsKeys.variants(productId) });
    },
    onError: () => toast.error("ລຶບ Variant ບໍ່ສຳເລັດ"),
  });
  const run = (variantId: string) =>
    new Promise<void>((resolve, reject) =>
      base.mutate(variantId, { onSuccess: () => resolve(), onError: reject }),
    );
  return { ...base, run };
}
