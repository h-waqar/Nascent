import mongoose, { Schema, type Model } from "mongoose";
import type { Settings } from "@/types/models";

type SettingsDoc = Omit<Settings, "id" | "updatedAt"> & {
  _id: mongoose.Types.ObjectId;
  updatedAt: Date;
};

const SettingsSchema = new Schema<SettingsDoc>(
  {
    accountName: { type: String, default: "" },
    accountNumber: { type: String, default: "" },
    sortCode: { type: String, default: "" },
    bankName: { type: String, default: "" },
    codEnabled: { type: Boolean, default: true },
    bankTransferEnabled: { type: Boolean, default: true },
  },
  { timestamps: true }
);

export const SettingsModel: Model<SettingsDoc> =
  (mongoose.models.Settings as Model<SettingsDoc>) ||
  mongoose.model<SettingsDoc>("Settings", SettingsSchema);
