import mongoose, { Schema, type Model } from "mongoose";
import type { Product } from "@/types/models";

type ProductDoc = Omit<Product, "id"> & { _id: mongoose.Types.ObjectId };

const ProductSchema = new Schema<ProductDoc>(
  {
    slug: { type: String, required: true, unique: true, index: true },
    name: { type: String, required: true },
    description: { type: String, required: true },
    price: { type: Number, required: true, min: 0 },
    images: { type: [String], default: [] },
    scentNotes: { type: [String], default: [] },
    stock: { type: Number, required: true, min: 0, default: 0 },
    // Optional product fields — previously missing from schema (stripped by strict:true)
    categoryId: { type: String },
    hidden: { type: Boolean, default: false },
    isFeatured: { type: Boolean, default: false },
    collection: { type: String },
    intensity: { type: String, enum: ["Subtle", "Light", "Moderate", "Strong", "Intense"] },
    volume: { type: String },
    topNote: { type: String },
    heartNote: { type: String },
    baseNote: { type: String },
    rating: { type: Number, min: 0, max: 5, default: 5.0 },
    ratingCount: { type: Number, min: 0, default: 0 },
    reviewCount: { type: Number, min: 0, default: 0 },
  },
  { timestamps: true, suppressReservedKeysWarning: true }
);

export const ProductModel: Model<ProductDoc> =
  (mongoose.models.Product as Model<ProductDoc>) ||
  mongoose.model<ProductDoc>("Product", ProductSchema);
