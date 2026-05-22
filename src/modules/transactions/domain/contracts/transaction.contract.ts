import { z } from "zod";

export const TransactionQuerySchema = z.object({
  limit: z.coerce.number().int().min(1).max(50).default(20),
  offset: z.coerce.number().int().min(0).default(0),
  status: z.enum(["PENDING", "COMPLETED", "FAILED"]).optional(),
  paymentMethod: z.enum(["QR", "COD"]).optional(),
});
export type TransactionQuery = z.infer<typeof TransactionQuerySchema>;

export const TransactionIdParamSchema = z.object({ id: z.string().min(1) });
export type TransactionIdParam = z.infer<typeof TransactionIdParamSchema>;
