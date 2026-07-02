import { z } from "zod";
import { ORDER_STATUSES } from "@/lib/orderStatus";

export const REVIEW_STATUSES = ["pending", "approved", "rejected"] as const;

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
  hidden: z.boolean().optional(),
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
//
// IMPORTANT: Fields that carry .default() in CreateProductSchema must be
// re-declared here as .optional() (no default). If they kept their defaults,
// Zod would inject those defaults ([] or false) for absent keys during
// safeParse, causing the PUT handler's $set to overwrite existing DB data
// with empty values — e.g. a hide/show toggle wiping the images array.
export const UpdateProductSchema = CreateProductSchema.partial().extend({
  images: z.array(z.string().url()).optional(),
  scentNotes: z.array(z.string()).optional(),
  isFeatured: z.boolean().optional(),
  categoryId: z.string().nullish(),
  topNote: z.string().nullish(),
  heartNote: z.string().nullish(),
  baseNote: z.string().nullish(),
  intensity: z.enum(["Subtle", "Light", "Moderate", "Strong", "Intense"]).nullish(),
  volume: z.string().nullish(),
  hidden: z.boolean().optional(),
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
  whatsappNumber: z.string().max(20).optional(),
  shippingCost: z.number().min(0).optional(),
  codEnabled: z.boolean().optional(),
  bankTransferEnabled: z.boolean().optional(),
});

export const UpsertReviewSchema = z.object({
  rating: z.number().int().min(1).max(5),
  title: z.string().trim().max(120).optional(),
  body: z.string().trim().min(10).max(2000),
});

export const UpdateReviewModerationSchema = z
  .object({
    status: z.enum(REVIEW_STATUSES).optional(),
    moderationReason: z.string().trim().max(500).optional(),
    isFeatured: z.boolean().optional(),
    featuredRank: z.number().int().min(1).max(999).nullable().optional(),
  })
  .refine((value) => Object.keys(value).length > 0, {
    message: "At least one moderation field is required",
  });

export type CreateProductInput = z.infer<typeof CreateProductSchema>;
export type UpdateProductInput = z.infer<typeof UpdateProductSchema>;
export type UpdateOrderStatusInput = z.infer<typeof UpdateOrderStatusSchema>;
export type UpdateSettingsInput = z.infer<typeof UpdateSettingsSchema>;
export type UpsertReviewInput = z.infer<typeof UpsertReviewSchema>;
export type UpdateReviewModerationInput = z.infer<typeof UpdateReviewModerationSchema>;
