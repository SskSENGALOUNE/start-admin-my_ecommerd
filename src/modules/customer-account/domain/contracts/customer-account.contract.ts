import { z } from "zod";

// ─── Profile ──────────────────────────────────────────────────────────────────

export const UpdateProfileSchema = z.object({
  name: z.string().min(2, "ຊື່ຕ້ອງມີຢ່າງໜ້ອຍ 2 ຕົວອັກສອນ"),
  phone: z.string().nullable().optional(),
});
export type UpdateProfileDTO = z.infer<typeof UpdateProfileSchema>;

export const ChangePasswordSchema = z.object({
  currentPassword: z.string().min(1, "ກະລຸນາໃສ່ລະຫັດຜ່ານປັດຈຸບັນ"),
  newPassword: z.string().min(6, "ລະຫັດຜ່ານໃໝ່ຕ້ອງມີຢ່າງໜ້ອຍ 6 ຕົວອັກສອນ"),
});
export type ChangePasswordDTO = z.infer<typeof ChangePasswordSchema>;

// ─── Addresses ────────────────────────────────────────────────────────────────

export const AddressUpsertSchema = z.object({
  label: z.string().nullable().optional(),
  recipientName: z.string().min(1, "ກະລຸນາໃສ່ຊື່ຜູ້ຮັບ"),
  recipientPhone: z.string().min(1, "ກະລຸນາໃສ່ເບີໂທຜູ້ຮັບ"),
  province: z.string().min(1, "ກະລຸນາເລືອກແຂວງ"),
  district: z.string().min(1, "ກະລຸນາໃສ່ເມືອງ"),
  village: z.string().nullable().optional(),
  address: z.string().min(1, "ກະລຸນາໃສ່ທີ່ຢູ່"),
  isDefault: z.boolean().optional().default(false),
});
export type AddressUpsertDTO = z.infer<typeof AddressUpsertSchema>;

// ─── Orders ───────────────────────────────────────────────────────────────────

export const MyOrderQuerySchema = z.object({
  limit: z.coerce.number().int().min(1).max(50).default(10),
  offset: z.coerce.number().int().min(0).default(0),
  status: z
    .enum([
      "PENDING",
      "CONFIRMED",
      "PROCESSING",
      "SHIPPED",
      "DELIVERED",
      "CANCELLED",
      "REFUNDED",
    ])
    .optional(),
});
export type MyOrderQueryDTO = z.infer<typeof MyOrderQuerySchema>;
