import { NextRequest, NextResponse } from "next/server";
import { requireAdmin } from "@/lib/requireAdmin";
import connectToDatabase from "@/lib/db";
import { SettingsModel } from "@/models";
import { UpdateSettingsSchema } from "@/lib/schemas";

const DEFAULT_SETTINGS = {
  bankName: "",
  accountName: "",
  accountNumber: "",
  iban: "",
  whatsappNumber: "",
  shippingCost: 0,
  codEnabled: true,
  bankTransferEnabled: true,
};

function serialize(doc: Record<string, unknown> | null) {
  if (!doc) return { ...DEFAULT_SETTINGS };
  const d = doc as Record<string, unknown> & {
    _id?: { toString(): string };
    updatedAt?: string | Date;
  };
  return {
    id: d._id ? d._id.toString() : undefined,
    bankName: (d.bankName as string) ?? "",
    accountName: (d.accountName as string) ?? "",
    accountNumber: (d.accountNumber as string) ?? "",
    iban: (d.iban as string) ?? "",
    whatsappNumber: (d.whatsappNumber as string) ?? "",
    shippingCost: typeof d.shippingCost === "number" ? d.shippingCost : 0,
    codEnabled: typeof d.codEnabled === "boolean" ? d.codEnabled : true,
    bankTransferEnabled:
      typeof d.bankTransferEnabled === "boolean" ? d.bankTransferEnabled : true,
    updatedAt: d.updatedAt ? new Date(d.updatedAt).toISOString() : undefined,
  };
}

export async function GET() {
  const deny = await requireAdmin();
  if (deny) return deny;
  try {
    await connectToDatabase();
    const doc = await SettingsModel.findOne({}).lean();
    return NextResponse.json({
      settings: serialize(doc as Record<string, unknown> | null),
    });
  } catch (e) {
    console.error("GET /api/admin/settings:", e);
    return NextResponse.json(
      { error: "Failed to fetch settings" },
      { status: 500 }
    );
  }
}

export async function PUT(req: NextRequest) {
  const deny = await requireAdmin();
  if (deny) return deny;

  let body: unknown;
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON" }, { status: 400 });
  }

  const parsed = UpdateSettingsSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ error: parsed.error.issues }, { status: 422 });
  }

  try {
    await connectToDatabase();
    const updated = await SettingsModel.findOneAndUpdate(
      {},
      { $set: parsed.data },
      { upsert: true, new: true, runValidators: true }
    ).lean();
    return NextResponse.json({
      settings: serialize(updated as Record<string, unknown> | null),
    });
  } catch (e) {
    console.error("PUT /api/admin/settings:", e);
    return NextResponse.json(
      { error: "Failed to update settings" },
      { status: 500 }
    );
  }
}
