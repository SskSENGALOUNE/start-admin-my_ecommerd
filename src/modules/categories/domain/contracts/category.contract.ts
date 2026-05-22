import { z } from "zod";

export const CategorySchema = z.object({
  id: z.string(),
  name: z.string(),
  createdAt: z.coerce.date(),
  updatedAt: z.coerce.date(),
  deletedAt: z.coerce.date().nullable(),
});
export type CategoryDTO = z.infer<typeof CategorySchema>;

export const CreateCategorySchema = z.object({
  name: z.string().min(1, "ກະລຸນາໃສ່ຊື່ໝວດໝູ່"),
});
export type CreateCategoryDTO = z.infer<typeof CreateCategorySchema>;

export const UpdateCategorySchema = z.object({
  name: z.string().min(1, "ກະລຸນາໃສ່ຊື່ໝວດໝູ່"),
});
export type UpdateCategoryDTO = z.infer<typeof UpdateCategorySchema>;

export const CategoryIdParamSchema = z.object({ id: z.string().min(1) });
export type CategoryIdParamDTO = z.infer<typeof CategoryIdParamSchema>;
