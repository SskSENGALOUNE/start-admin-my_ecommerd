import { z } from "zod";

export const RegisterSchema = z.object({
  name: z.string().min(2, "ຊື່ຕ້ອງມີຢ່າງໜ້ອຍ 2 ຕົວອັກສອນ"),
  email: z.string().email("ອີເມວບໍ່ຖືກຕ້ອງ"),
  password: z.string().min(6, "ລະຫັດຜ່ານຕ້ອງມີຢ່າງໜ້ອຍ 6 ຕົວອັກສອນ"),
  phone: z.string().optional(),
});
export type RegisterDTO = z.infer<typeof RegisterSchema>;

export const LoginSchema = z.object({
  email: z.string().email("ອີເມວບໍ່ຖືກຕ້ອງ"),
  password: z.string().min(1, "ກະລຸນາໃສ່ລະຫັດຜ່ານ"),
});
export type LoginDTO = z.infer<typeof LoginSchema>;

export const CustomerSessionSchema = z.object({
  id: z.string(),
  email: z.string(),
  name: z.string(),
  phone: z.string().nullable(),
  isActive: z.boolean(),
});
export type CustomerSession = z.infer<typeof CustomerSessionSchema>;
