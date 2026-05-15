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
    isFeatured: { type: Boolean, default: false },
    collection: { type: String },
    intensity: { type: String, enum: ["Subtle", "Light", "Moderate", "Strong", "Intense"] },
    volume: { type: String },
    topNote: { type: String },
    heartNote: { type: String },
    baseNote: { type: String },
  },
  { timestamps: true }
);

export const ProductModel: Model<ProductDoc> =
  (mongoose.models.Product as Model<ProductDoc>) ||
  mongoose.model<ProductDoc>("Product", ProductSchema);
