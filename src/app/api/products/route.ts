import { NextRequest, NextResponse } from "next/server";
import connectToDatabase from "@/lib/db";
import { ProductModel } from "@/models";

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const category = searchParams.get("category");
  const q = searchParams.get("q");
  const featured = searchParams.get("featured");

  try {
    await connectToDatabase();

    const filter: Record<string, unknown> = { hidden: { $ne: true } };
    if (category) filter.categoryId = category;
    if (q) filter.scentNotes = { $regex: q, $options: "i" };
    if (featured === "true") filter.isFeatured = true;

    const docs = await ProductModel.find(filter).lean();
    const products = docs.map((p) => {
      const raw = p as unknown as Record<string, unknown>;
      return {
        ...raw,
        id: p._id.toString(),
        _id: undefined,
        createdAt: raw.createdAt instanceof Date ? raw.createdAt.toISOString() : undefined,
        updatedAt: raw.updatedAt instanceof Date ? raw.updatedAt.toISOString() : undefined,
      };
    });
    return NextResponse.json({ products });
  } catch (e) {
    console.error("GET /api/products:", e);
    return NextResponse.json({ error: "Failed to fetch products" }, { status: 500 });
  }
}
