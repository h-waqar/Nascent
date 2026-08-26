import { NextRequest, NextResponse } from "next/server";
import connectToDatabase from "@/lib/db";
import { ProductModel } from "@/models";

export async function GET(
  _req: NextRequest,
  { params }: { params: Promise<{ slug: string }> }
) {
  const { slug } = await params;

  try {
    await connectToDatabase();
    const p = await ProductModel.findOne({ slug }).lean();
    if (!p || (p as unknown as Record<string, unknown>).hidden) {
      return NextResponse.json({ error: "Product not found" }, { status: 404 });
    }
    const raw = p as unknown as Record<string, unknown>;
    const product = {
      ...raw,
      id: p._id.toString(),
      _id: undefined,
      rating: typeof raw.rating === "number" ? raw.rating : 5.0,
      ratingCount: typeof raw.ratingCount === "number" ? raw.ratingCount : 0,
      reviewCount: typeof raw.reviewCount === "number" ? raw.reviewCount : 0,
      createdAt: raw.createdAt instanceof Date ? raw.createdAt.toISOString() : undefined,
      updatedAt: raw.updatedAt instanceof Date ? raw.updatedAt.toISOString() : undefined,
    };
    return NextResponse.json({ product });
  } catch (e) {
    console.error(`GET /api/products/${slug}:`, e);
    return NextResponse.json({ error: "Failed to fetch product" }, { status: 500 });
  }
}
