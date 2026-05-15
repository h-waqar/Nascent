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
  categoryId: z.string().nullish(),
  collection: z.string().nullish(),
  isFeatured: z.boolean().default(false),
  topNote: z.string().nullish(),
  heartNote: z.string().nullish(),
  baseNote: z.string().nullish(),
  volume: z.string().nullish(),
  intensity: z.enum(["Subtle", "Light", "Moderate", "Strong", "Intense"]).nullish(),
});

// For updates, optional fields can be explicitly set to null to clear them.
// The API route converts null values into $unset operations so $set doesn't
// leave stale data when an admin clears a field.
export const UpdateProductSchema = CreateProductSchema.partial().extend({
  categoryId: z.string().nullish(),
  topNote: z.string().nullish(),
  heartNote: z.string().nullish(),
  baseNote: z.string().nullish(),
  intensity: z.enum(["Subtle", "Light", "Moderate", "Strong", "Intense"]).nullish(),
  volume: z.string().nullish(),
});

export const UpdateOrderStatusSchema = z.object({
  status: z.enum(ORDER_STATUSES as [string, ...string[]]),
  adminNote: z.string().max(1000).optional(),
});

export const UpdateSettingsSchema = z.object({
  bankName: z.string().max(200).optional(),
  accountName: z.string().max(200).optional(),
  accountNumber: z.string().max(50).optional(),
  iban: z.string().max(34).optional(),
  codEnabled: z.boolean().optional(),
  bankTransferEnabled: z.boolean().optional(),
});

export type CreateProductInput = z.infer<typeof CreateProductSchema>;
export type UpdateProductInput = z.infer<typeof UpdateProductSchema>;
export type UpdateOrderStatusInput = z.infer<typeof UpdateOrderStatusSchema>;
export type UpdateSettingsInput = z.infer<typeof UpdateSettingsSchema>;
