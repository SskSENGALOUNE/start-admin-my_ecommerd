import { toast } from "@devhop/ui";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { categoriesApi } from "./client";

export const categoriesKeys = {
  all: ["categories"] as const,
  list: () => ["categories", "list"] as const,
  detail: (id: string) => ["categories", "detail", id] as const,
};

export function useCategoriesQuery() {
  return useQuery({
    queryKey: categoriesKeys.list(),
    queryFn: () => categoriesApi.list(),
  });
}

export function useCategoryQuery(id: string) {
  return useQuery({
    queryKey: categoriesKeys.detail(id),
    queryFn: () => categoriesApi.get(id),
    enabled: !!id,
  });
}

export function useCreateCategory() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (input: { name: string }) => categoriesApi.create(input),
    onSuccess: () => {
      toast.success("ສ້າງໝວດໝູ່ສຳເລັດ");
      qc.invalidateQueries({ queryKey: categoriesKeys.all });
    },
    onError: () => toast.error("ສ້າງໝວດໝູ່ບໍ່ສຳເລັດ"),
  });
}

export function useUpdateCategory(id: string) {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (input: { name: string }) => categoriesApi.update(id, input),
    onSuccess: () => {
      toast.success("ແກ້ໄຂໝວດໝູ່ສຳເລັດ");
      qc.invalidateQueries({ queryKey: categoriesKeys.all });
    },
    onError: () => toast.error("ແກ້ໄຂໝວດໝູ່ບໍ່ສຳເລັດ"),
  });
}

export function useDeleteCategory() {
  const qc = useQueryClient();
  const base = useMutation({
    mutationFn: (id: string) => categoriesApi.remove(id),
    onSuccess: () => {
      toast.success("ລຶບໝວດໝູ່ສຳເລັດ");
      qc.invalidateQueries({ queryKey: categoriesKeys.all });
    },
    onError: () => toast.error("ລຶບໝວດໝູ່ບໍ່ສຳເລັດ"),
  });

  const run = (id: string) =>
    new Promise<void>((resolve, reject) => {
      base.mutate(id, {
        onSuccess: () => resolve(),
        onError: (e) => reject(e),
      });
    });

  return { ...base, run };
}
