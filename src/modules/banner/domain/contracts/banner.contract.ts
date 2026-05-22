import { z } from "zod";

export const BannerSchema = z.object({
  id: z.string(),
  title: z.string(),
  imageUrl: z.string(),
  linkUrl: z.string().nullable(),
  isActive: z.boolean(),
  order: z.number(),
  createdAt: z.coerce.date(),
  updatedAt: z.coerce.date(),
  deletedAt: z.coerce.date().nullable(),
});
export type BannerDTO = z.infer<typeof BannerSchema>;

export const CreateBannerSchema = z.object({
  title: z.string().min(1, "ກະລຸນາໃສ່ຊື່ Banner"),
  imageUrl: z.string().min(1, "ກະລຸນາອັບໂຫຼດຮູບ"),
  linkUrl: z.string().optional(),
  isActive: z.boolean().default(true),
  order: z.number().int().min(0).default(0),
});
export type CreateBannerDTO = z.infer<typeof CreateBannerSchema>;

export const UpdateBannerSchema = z.object({
  title: z.string().min(1, "ກະລຸນາໃສ່ຊື່ Banner").optional(),
  imageUrl: z.string().min(1, "ກະລຸນາອັບໂຫຼດຮູບ").optional(),
  linkUrl: z.string().nullable().optional(),
  isActive: z.boolean().optional(),
  order: z.number().int().min(0).optional(),
});
export type UpdateBannerDTO = z.infer<typeof UpdateBannerSchema>;

export const BannerIdParamSchema = z.object({ id: z.string().min(1) });
export type BannerIdParamDTO = z.infer<typeof BannerIdParamSchema>;
