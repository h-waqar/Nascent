import { NextRequest, NextResponse } from "next/server";
import connectToDatabase from "@/lib/db";
import { ProductModel } from "@/models";

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const category = searchParams.get("category");
  const q = searchParams.get("q");
  const featured = searchParams.get("featured");
  const sort = searchParams.get("sort");

  try {
    await connectToDatabase();

    const filter: Record<string, unknown> = { hidden: { $ne: true } };
    if (category) filter.categoryId = category;
    if (q) filter.scentNotes = { $regex: q, $options: "i" };
    if (featured === "true") filter.isFeatured = true;

    let sortOption: Record<string, 1 | -1> = { createdAt: -1 };
    if (sort === "popular" || sort === "popularity") {
      sortOption = { rating: -1, ratingCount: -1, createdAt: -1 };
    } else if (sort === "price_asc") {
      sortOption = { price: 1 };
    } else if (sort === "price_desc") {
      sortOption = { price: -1 };
    } else if (sort === "name_asc") {
      sortOption = { name: 1 };
    } else if (sort === "name_desc") {
      sortOption = { name: -1 };
    } else if (sort === "newest") {
      sortOption = { createdAt: -1 };
    } else if (sort === "oldest") {
      sortOption = { createdAt: 1 };
    } else if (sort === "featured") {
      sortOption = { isFeatured: -1, createdAt: -1 };
    }

    const docs = await ProductModel.find(filter).sort(sortOption).lean();
    const products = docs.map((p) => {
      const raw = p as unknown as Record<string, unknown>;
      return {
        ...raw,
        id: p._id.toString(),
        _id: undefined,
        rating: typeof raw.rating === "number" ? raw.rating : 5.0,
        ratingCount: typeof raw.ratingCount === "number" ? raw.ratingCount : 0,
        reviewCount: typeof raw.reviewCount === "number" ? raw.reviewCount : 0,
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
