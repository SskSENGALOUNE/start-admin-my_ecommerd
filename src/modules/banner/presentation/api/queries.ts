import { toast } from "@devhop/ui";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import type { CreateBannerDTO, UpdateBannerDTO } from "../../domain/contracts/banner.contract";
import { bannersApi } from "./client";

export const bannersKeys = {
  all: ["banners"] as const,
  list: () => ["banners", "list"] as const,
  detail: (id: string) => ["banners", "detail", id] as const,
};

export function useBannersQuery() {
  return useQuery({
    queryKey: bannersKeys.list(),
    queryFn: () => bannersApi.list(),
  });
}

export function useBannerQuery(id: string) {
  return useQuery({
    queryKey: bannersKeys.detail(id),
    queryFn: () => bannersApi.get(id),
    enabled: !!id,
  });
}

export function useCreateBanner() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (input: CreateBannerDTO) => bannersApi.create(input),
    onSuccess: () => {
      toast.success("ສ້າງ Banner ສຳເລັດ");
      qc.invalidateQueries({ queryKey: bannersKeys.all });
    },
    onError: () => toast.error("ສ້າງ Banner ບໍ່ສຳເລັດ"),
  });
}

export function useUpdateBanner(id: string) {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (input: UpdateBannerDTO) => bannersApi.update(id, input),
    onSuccess: () => {
      toast.success("ແກ້ໄຂ Banner ສຳເລັດ");
      qc.invalidateQueries({ queryKey: bannersKeys.all });
    },
    onError: () => toast.error("ແກ້ໄຂ Banner ບໍ່ສຳເລັດ"),
  });
}

export function useDeleteBanner() {
  const qc = useQueryClient();
  const base = useMutation({
    mutationFn: (id: string) => bannersApi.remove(id),
    onSuccess: () => {
      toast.success("ລຶບ Banner ສຳເລັດ");
      qc.invalidateQueries({ queryKey: bannersKeys.all });
    },
    onError: () => toast.error("ລຶບ Banner ບໍ່ສຳເລັດ"),
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

export function useToggleBannerActive(id: string) {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (isActive: boolean) => bannersApi.update(id, { isActive }),
    onSuccess: () => {
      toast.success("ອັບເດດສະຖານະ Banner ສຳເລັດ");
      qc.invalidateQueries({ queryKey: bannersKeys.all });
    },
    onError: () => toast.error("ອັບເດດສະຖານະ Banner ບໍ່ສຳເລັດ"),
  });
}
