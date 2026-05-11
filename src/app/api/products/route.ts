import { NextRequest, NextResponse } from "next/server";
import connectToDatabase from "@/lib/db";
import { ProductModel } from "@/models";
import { PRODUCTS } from "@/components/dummy-data";

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const category = searchParams.get("category");
  const q = searchParams.get("q");
  const featured = searchParams.get("featured");

  try {
    await connectToDatabase();

    const filter: Record<string, unknown> = {};
    if (category) filter.categoryId = category;
    if (q) filter.scentNotes = { $regex: q, $options: "i" };
    if (featured === "true") filter.isFeatured = true;

    const products = await ProductModel.find(filter).lean();
    if (products.length > 0) {
      return NextResponse.json({ products });
    }
  } catch {
    // Fall through to mock data if DB unavailable
  }

  // Fallback to mock data
  let products = PRODUCTS;
  if (category) products = products.filter((p) => p.categoryId === category);
  if (q)
    products = products.filter(
      (p) =>
        p.scentNotes.some((n) => n.toLowerCase().includes(q.toLowerCase())) ||
        p.name.toLowerCase().includes(q.toLowerCase())
    );
  if (featured === "true") products = products.filter((p) => p.isFeatured);

  return NextResponse.json({ products });
}
