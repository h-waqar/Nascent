import mongoose, { Schema, type Model } from "mongoose";

export interface RatingDoc {
  _id: mongoose.Types.ObjectId;
  productId: mongoose.Types.ObjectId;
  productSlug: string;
  visitorId: string;
  rating: number;
  createdAt: Date;
  updatedAt: Date;
}

const RatingSchema = new Schema<RatingDoc>(
  {
    productId: { type: Schema.Types.ObjectId, ref: "Product", required: true, index: true },
    productSlug: { type: String, required: true, index: true },
    visitorId: { type: String, required: true, index: true },
    rating: { type: Number, required: true, min: 1, max: 5 },
  },
  { timestamps: true }
);

RatingSchema.index({ productId: 1, visitorId: 1 }, { unique: true });

export const RatingModel: Model<RatingDoc> =
  (mongoose.models.Rating as Model<RatingDoc>) ||
  mongoose.model<RatingDoc>("Rating", RatingSchema);
