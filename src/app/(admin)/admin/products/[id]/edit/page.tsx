import { cookies } from "next/headers";
import { notFound } from "next/navigation";
import type { Product } from "@/types/models";
import { AdminPageHeader } from "@/components/admin/AdminPageHeader";
import { ProductForm } from "@/components/admin/ProductForm";

async function getProduct(id: string): Promise<Product | null> {
  const base = process.env.NEXT_PUBLIC_APP_URL ?? "http://localhost:3000";
  const cookieStore = await cookies();
  const res = await fetch(`${base}/api/admin/products/${id}`, {
    cache: "no-store",
    headers: { cookie: cookieStore.toString() },
  });
  if (!res.ok) return null;
  const data = await res.json();
  return data.product ?? null;
}

export default async function EditProductPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const product = await getProduct(id);
  if (!product) notFound();
  return (
    <div className="bg-white min-h-screen">
      <AdminPageHeader title={`Edit — ${product.name}`} />
      <ProductForm mode="edit" initialProduct={product} />
    </div>
  );
}
