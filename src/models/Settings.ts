import mongoose, { Schema, type Model } from "mongoose";
import type { Settings } from "@/types/models";

type SettingsDoc = Omit<Settings, "id" | "updatedAt"> & {
  _id: mongoose.Types.ObjectId;
  updatedAt: Date;
};

const SettingsSchema = new Schema<SettingsDoc>(
  {
    bankName: { type: String, default: "" },
    accountName: { type: String, default: "" },
    accountNumber: { type: String, default: "" },
    iban: { type: String, default: "" },
    whatsappNumber: { type: String, default: "" },
    shippingCost: { type: Number, default: 0 },
    codEnabled: { type: Boolean, default: true },
    bankTransferEnabled: { type: Boolean, default: true },
  },
  { timestamps: true }
);

export const SettingsModel: Model<SettingsDoc> =
  (mongoose.models.Settings as Model<SettingsDoc>) ||
  mongoose.model<SettingsDoc>("Settings", SettingsSchema);
