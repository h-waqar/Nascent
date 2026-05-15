import { NextRequest, NextResponse } from "next/server";
import connectToDatabase from "@/lib/db";
import { SettingsModel } from "@/models";

const DEFAULT_SETTINGS = {
  bankName: "",
  accountName: "",
  accountNumber: "",
  iban: "",
  codEnabled: true,
  bankTransferEnabled: true,
};

export async function GET(_req: NextRequest) {
  try {
    await connectToDatabase();
    const doc = await SettingsModel.findOne({}).lean();
    if (!doc) return NextResponse.json({ settings: { ...DEFAULT_SETTINGS } });
    const d = doc as Record<string, unknown>;
    return NextResponse.json({
      settings: {
        bankName: (d.bankName as string) ?? "",
        accountName: (d.accountName as string) ?? "",
        accountNumber: (d.accountNumber as string) ?? "",
        iban: (d.iban as string) ?? "",
        codEnabled: typeof d.codEnabled === "boolean" ? d.codEnabled : true,
        bankTransferEnabled:
          typeof d.bankTransferEnabled === "boolean"
            ? d.bankTransferEnabled
            : true,
      },
    });
  } catch (e) {
    console.error("GET /api/settings:", e);
    // Public endpoint — degrade gracefully to defaults rather than 500ing the checkout page.
    return NextResponse.json({ settings: { ...DEFAULT_SETTINGS } });
  }
}
