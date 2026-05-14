import { NextRequest, NextResponse } from "next/server";
import { requireAdmin } from "@/lib/requireAdmin";
import connectToDatabase from "@/lib/db";
import { ProductModel } from "@/models";
import { CreateProductSchema } from "@/lib/schemas";
import { generateSlug } from "@/lib/slug";

export async function GET(_req: NextRequest) {
  const deny = await requireAdmin();
  if (deny) return deny;
  try {
    await connectToDatabase();
    const products = await ProductModel.find({}).sort({ createdAt: -1 }).lean();
    return NextResponse.json({
      products: products.map((p) => ({
        ...p,
        id: p._id.toString(),
        _id: undefined,
        createdAt: (p as { createdAt?: Date }).createdAt
          ? ((p as { createdAt: Date }).createdAt).toISOString()
          : undefined,
        updatedAt: (p as { updatedAt?: Date }).updatedAt
          ? ((p as { updatedAt: Date }).updatedAt).toISOString()
          : undefined,
      })),
    });
  } catch (e) {
    console.error("GET /api/admin/products:", e);
    return NextResponse.json({ error: "Failed to fetch products" }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  const deny = await requireAdmin();
  if (deny) return deny;

  let body: unknown;
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON" }, { status: 400 });
  }

  // Derive slug from name if not supplied.
  if (body && typeof body === "object" && !("slug" in body) && "name" in body) {
    (body as Record<string, unknown>).slug = generateSlug(
      String((body as Record<string, unknown>).name)
    );
  }

  const parsed = CreateProductSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ error: parsed.error.issues }, { status: 422 });
  }

  try {
    await connectToDatabase();
    const existing = await ProductModel.findOne({ slug: parsed.data.slug }).lean();
    if (existing) {
      return NextResponse.json(
        { error: "A product with that slug already exists" },
        { status: 409 }
      );
    }
    const created = await ProductModel.create(parsed.data);
    const obj = created.toObject ? created.toObject() : created;
    return NextResponse.json(
      {
        product: {
          ...obj,
          id: obj._id.toString(),
          _id: undefined,
          createdAt: obj.createdAt ? new Date(obj.createdAt).toISOString() : undefined,
          updatedAt: obj.updatedAt ? new Date(obj.updatedAt).toISOString() : undefined,
        },
      },
      { status: 201 }
    );
  } catch (e) {
    console.error("POST /api/admin/products:", e);
    return NextResponse.json({ error: "Failed to create product" }, { status: 500 });
  }
}
