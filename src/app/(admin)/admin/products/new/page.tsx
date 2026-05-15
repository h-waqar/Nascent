import { AdminPageHeader } from "@/components/admin/AdminPageHeader";
import { ProductForm } from "@/components/admin/ProductForm";

export default function NewProductPage() {
  return (
    <div className="bg-white min-h-screen">
      <AdminPageHeader title="New Product" />
      <ProductForm mode="new" />
    </div>
  );
}
