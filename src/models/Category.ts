import mongoose, { Schema, type Model } from "mongoose";
import type { Category } from "@/types/models";

type CategoryDoc = Omit<Category, "id"> & { _id: mongoose.Types.ObjectId };

const CategorySchema = new Schema<CategoryDoc>(
  {
    slug: { type: String, required: true, unique: true, index: true },
    name: { type: String, required: true },
    description: { type: String, required: true },
    imageUrl: { type: String, required: true },
  },
  { timestamps: true }
);

export const CategoryModel: Model<CategoryDoc> =
  (mongoose.models.Category as Model<CategoryDoc>) ||
  mongoose.model<CategoryDoc>("Category", CategorySchema);
