import { NextResponse } from "next/server";
import connectToDatabase from "@/lib/db";
import { CategoryModel } from "@/models";

export async function GET() {
  try {
    await connectToDatabase();
    const docs = await CategoryModel.find({}).lean();
    const categories = docs.map((c) => {
      const raw = c as unknown as Record<string, unknown>;
      return { ...raw, id: c._id.toString(), _id: undefined };
    });
    return NextResponse.json({ categories });
  } catch (e) {
    console.error("GET /api/categories:", e);
    return NextResponse.json({ error: "Failed to fetch categories" }, { status: 500 });
  }
}
