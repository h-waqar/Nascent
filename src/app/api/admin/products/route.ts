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
      products: products.map((p) => {
        const raw = p as unknown as Record<string, unknown>;
        return {
          ...raw,
          id: p._id.toString(),
          _id: undefined,
          createdAt: raw.createdAt instanceof Date ? raw.createdAt.toISOString() : undefined,
          updatedAt: raw.updatedAt instanceof Date ? raw.updatedAt.toISOString() : undefined,
        };
      }),
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
    const createData = Object.fromEntries(
      Object.entries(parsed.data).filter(([, v]) => v !== null && v !== undefined)
    );
    const created = await ProductModel.create(createData);
    const rawObj = (created.toObject ? created.toObject() : created) as Record<string, unknown>;
    return NextResponse.json(
      {
        product: {
          ...rawObj,
          id: (rawObj._id as { toString(): string }).toString(),
          _id: undefined,
          createdAt:
            rawObj.createdAt instanceof Date ? rawObj.createdAt.toISOString() : undefined,
          updatedAt:
            rawObj.updatedAt instanceof Date ? rawObj.updatedAt.toISOString() : undefined,
        },
      },
      { status: 201 }
    );
  } catch (e) {
    console.error("POST /api/admin/products:", e);
    return NextResponse.json({ error: "Failed to create product" }, { status: 500 });
  }
}
