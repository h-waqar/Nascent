import { NextRequest, NextResponse } from "next/server";
import { auth } from "@clerk/nextjs/server";
import connectToDatabase from "@/lib/db";
import { SettingsModel } from "@/models";

const DEFAULT_PUBLIC = {
  codEnabled: true,
  bankTransferEnabled: true,
};

const DEFAULT_AUTHENTICATED = {
  bankName: "",
  accountName: "",
  accountNumber: "",
  iban: "",
  codEnabled: true,
  bankTransferEnabled: true,
};

export async function GET(_req: NextRequest) {
  // Determine whether the caller has an active session.
  // Unauthenticated callers only receive the payment-method toggle flags;
  // bank account details are withheld to reduce unauthenticated exposure.
  const { userId } = await auth();

  try {
    await connectToDatabase();
    const doc = await SettingsModel.findOne({}).lean();

    const codEnabled = doc
      ? typeof (doc as Record<string, unknown>).codEnabled === "boolean"
        ? ((doc as Record<string, unknown>).codEnabled as boolean)
        : true
      : true;
    const bankTransferEnabled = doc
      ? typeof (doc as Record<string, unknown>).bankTransferEnabled === "boolean"
        ? ((doc as Record<string, unknown>).bankTransferEnabled as boolean)
        : true
      : true;

    if (!userId) {
      // Return only the payment-method flags to unauthenticated callers.
      return NextResponse.json({ settings: { codEnabled, bankTransferEnabled } });
    }

    // Authenticated caller — return full settings including bank details.
    if (!doc) {
      return NextResponse.json({ settings: { ...DEFAULT_AUTHENTICATED } });
    }
    const d = doc as Record<string, unknown>;
    return NextResponse.json({
      settings: {
        bankName: (d.bankName as string) ?? "",
        accountName: (d.accountName as string) ?? "",
        accountNumber: (d.accountNumber as string) ?? "",
        iban: (d.iban as string) ?? "",
        codEnabled,
        bankTransferEnabled,
      },
    });
  } catch (e) {
    console.error("GET /api/settings:", e);
    // Degrade gracefully — return only the public fields on error.
    if (!userId) {
      return NextResponse.json({ settings: { ...DEFAULT_PUBLIC } });
    }
    return NextResponse.json({ settings: { ...DEFAULT_AUTHENTICATED } });
  }
}
