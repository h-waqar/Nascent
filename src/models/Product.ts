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
  },
  { timestamps: true }
);

export const ProductModel: Model<ProductDoc> =
  (mongoose.models.Product as Model<ProductDoc>) ||
  mongoose.model<ProductDoc>("Product", ProductSchema);
