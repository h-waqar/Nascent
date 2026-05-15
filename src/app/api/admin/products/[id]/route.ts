import { NextRequest, NextResponse } from "next/server";
import mongoose from "mongoose";
import { requireAdmin } from "@/lib/requireAdmin";
import connectToDatabase from "@/lib/db";
import { ProductModel } from "@/models";
import { UpdateProductSchema } from "@/lib/schemas";

function serialize(p: Record<string, unknown> & { _id: { toString(): string } }) {
  return {
    ...p,
    id: p._id.toString(),
    _id: undefined,
    createdAt: p.createdAt
      ? new Date(p.createdAt as string | Date).toISOString()
      : undefined,
    updatedAt: p.updatedAt
      ? new Date(p.updatedAt as string | Date).toISOString()
      : undefined,
  };
}

export async function GET(
  _req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const deny = await requireAdmin();
  if (deny) return deny;
  const { id } = await params;
  if (!mongoose.Types.ObjectId.isValid(id)) {
    return NextResponse.json({ error: "Invalid product ID" }, { status: 400 });
  }
  try {
    await connectToDatabase();
    const product = await ProductModel.findById(id).lean();
    if (!product) {
      return NextResponse.json({ error: "Product not found" }, { status: 404 });
    }
    return NextResponse.json({ product: serialize(product as never) });
  } catch (e) {
    console.error("GET /api/admin/products/[id]:", e);
    return NextResponse.json({ error: "Failed to fetch product" }, { status: 500 });
  }
}

export async function PUT(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const deny = await requireAdmin();
  if (deny) return deny;
  const { id } = await params;
  if (!mongoose.Types.ObjectId.isValid(id)) {
    return NextResponse.json({ error: "Invalid product ID" }, { status: 400 });
  }
  let body: unknown;
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON" }, { status: 400 });
  }
  const parsed = UpdateProductSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ error: parsed.error.issues }, { status: 422 });
  }
  try {
    await connectToDatabase();
    if (parsed.data.slug) {
      const clash = await ProductModel.findOne({
        slug: parsed.data.slug,
        _id: { $ne: id },
      }).lean();
      if (clash) {
        return NextResponse.json(
          { error: "A product with that slug already exists" },
          { status: 409 }
        );
      }
    }
    // Split parsed data into fields to $set vs. null fields to $unset.
    // This allows admins to explicitly clear optional fields (e.g., intensity → null).
    const setFields: Record<string, unknown> = {};
    const unsetFields: Record<string, 1> = {};
    for (const [key, value] of Object.entries(parsed.data)) {
      if (value === null || value === undefined) {
        unsetFields[key] = 1;
      } else {
        setFields[key] = value;
      }
    }
    const updateOp: Record<string, unknown> = {};
    if (Object.keys(setFields).length > 0) updateOp.$set = setFields;
    if (Object.keys(unsetFields).length > 0) updateOp.$unset = unsetFields;

    const updated = await ProductModel.findByIdAndUpdate(
      id,
      updateOp,
      { new: true, runValidators: true }
    ).lean();
    if (!updated) {
      return NextResponse.json({ error: "Product not found" }, { status: 404 });
    }
    return NextResponse.json({ product: serialize(updated as never) });
  } catch (e) {
    console.error("PUT /api/admin/products/[id]:", e);
    return NextResponse.json({ error: "Failed to update product" }, { status: 500 });
  }
}

export async function DELETE(
  _req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const deny = await requireAdmin();
  if (deny) return deny;
  const { id } = await params;
  if (!mongoose.Types.ObjectId.isValid(id)) {
    return NextResponse.json({ error: "Invalid product ID" }, { status: 400 });
  }
  try {
    await connectToDatabase();
    const deleted = await ProductModel.findByIdAndDelete(id);
    if (!deleted) {
      return NextResponse.json({ error: "Product not found" }, { status: 404 });
    }
    return NextResponse.json({ success: true });
  } catch (e) {
    console.error("DELETE /api/admin/products/[id]:", e);
    return NextResponse.json({ error: "Failed to delete product" }, { status: 500 });
  }
}
