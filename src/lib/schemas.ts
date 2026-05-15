import { z } from "zod";
import { ORDER_STATUSES } from "@/lib/orderStatus";

export const CreateProductSchema = z.object({
  name: z.string().min(1),
  slug: z.string().min(1).regex(/^[a-z0-9-]+$/, "Slug must be lowercase alphanumeric with hyphens"),
  description: z.string().min(1),
  price: z.number().positive(),
  stock: z.number().int().min(0),
  images: z.array(z.string().url()).default([]),
  scentNotes: z.array(z.string()).default([]),
  categoryId: z.string().optional(),
  collection: z.string().optional(),
  isFeatured: z.boolean().default(false),
  topNote: z.string().optional(),
  heartNote: z.string().optional(),
  baseNote: z.string().optional(),
  volume: z.string().optional(),
  intensity: z.enum(["Subtle", "Light", "Moderate", "Strong", "Intense"]).optional(),
});

export const UpdateProductSchema = CreateProductSchema.partial();

export const UpdateOrderStatusSchema = z.object({
  status: z.enum(ORDER_STATUSES as [string, ...string[]]),
  adminNote: z.string().max(1000).optional(),
});

export const UpdateSettingsSchema = z.object({
  accountName: z.string().max(200).optional(),
  accountNumber: z.string().max(50).optional(),
  sortCode: z.string().max(20).optional(),
  bankName: z.string().max(200).optional(),
  codEnabled: z.boolean().optional(),
  bankTransferEnabled: z.boolean().optional(),
});

export type CreateProductInput = z.infer<typeof CreateProductSchema>;
export type UpdateProductInput = z.infer<typeof UpdateProductSchema>;
export type UpdateOrderStatusInput = z.infer<typeof UpdateOrderStatusSchema>;
export type UpdateSettingsInput = z.infer<typeof UpdateSettingsSchema>;
