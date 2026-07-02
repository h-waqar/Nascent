import mongoose, { Schema, type Model } from "mongoose";
import type { ReviewStatus } from "@/types/models";

export interface ReviewDoc {
  _id: mongoose.Types.ObjectId;
  productId: mongoose.Types.ObjectId;
  productSlug: string;
  productName: string;
  userId: string;
  authorName: string;
  authorImageUrl?: string;
  rating: number;
  title?: string;
  body: string;
  status: ReviewStatus;
  moderationReason?: string;
  moderatedBy?: string;
  moderatedAt?: Date;
  isFeatured: boolean;
  featuredRank?: number | null;
  createdAt: Date;
  updatedAt: Date;
}

const ReviewSchema = new Schema<ReviewDoc>(
  {
    productId: { type: Schema.Types.ObjectId, ref: "Product", required: true, index: true },
    productSlug: { type: String, required: true },
    productName: { type: String, required: true },
    userId: { type: String, required: true, index: true },
    authorName: { type: String, required: true, default: "Nascent customer" },
    authorImageUrl: { type: String, maxlength: 500 },
    rating: { type: Number, required: true, min: 1, max: 5 },
    title: { type: String, maxlength: 120 },
    body: { type: String, required: true, minlength: 10, maxlength: 2000 },
    status: {
      type: String,
      enum: ["pending", "approved", "rejected"],
      required: true,
      default: "approved",
      index: true,
    },
    moderationReason: { type: String, maxlength: 500 },
    moderatedBy: { type: String },
    moderatedAt: { type: Date },
    isFeatured: { type: Boolean, required: true, default: false, index: true },
    featuredRank: { type: Number, min: 1, max: 999, default: null },
  },
  { timestamps: true }
);

ReviewSchema.index({ userId: 1, productId: 1 }, { unique: true });
ReviewSchema.index({ productId: 1, status: 1, createdAt: -1 });
ReviewSchema.index({ status: 1, isFeatured: 1, featuredRank: 1, updatedAt: -1 });
ReviewSchema.index({ isFeatured: 1, createdAt: -1 });

export const ReviewModel: Model<ReviewDoc> =
  (mongoose.models.Review as Model<ReviewDoc>) ||
  mongoose.model<ReviewDoc>("Review", ReviewSchema);
