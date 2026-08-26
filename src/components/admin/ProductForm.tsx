"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import type { Product, Category } from "@/types/models";
import { generateSlug } from "@/lib/slug";
import { AdminToggle } from "@/components/admin/AdminToggle";
import { ProductImageUpload } from "@/components/admin/ProductImageUpload";

type Mode = "new" | "edit";

export interface ProductFormProps {
  mode: Mode;
  /** In edit mode, the existing product to pre-fill from */
  initialProduct?: Product;
}

const INTENSITY_OPTIONS = ["Subtle", "Light", "Moderate", "Strong", "Intense"] as const;
const SCENT_NOTE_OPTIONS = ["Floral", "Woody", "Oriental", "Fresh", "Citrus", "Spicy", "Musk", "Aquatic"] as const;

interface FormState {
  name: string;
  slug: string;
  slugDirty: boolean;     // true once admin has manually edited the slug — stop auto-syncing from name
  price: string;          // string for the input, parsed to number on submit
  stock: string;
  description: string;
  topNote: string;
  heartNote: string;
  baseNote: string;
  intensity: string;      // "" or one of INTENSITY_OPTIONS
  volume: string;
  collection: string;     // display label e.g. "SIGNATURE COLLECTION // 001"
  categoryId: string;     // FK to Category document
  isFeatured: boolean;
  scentNotes: string[];
}

function fromProduct(p: Product | undefined): FormState {
  return {
    name: p?.name ?? "",
    slug: p?.slug ?? "",
    slugDirty: !!p?.slug,
    price: p?.price !== undefined ? String(p.price) : "",
    stock: p?.stock !== undefined ? String(p.stock) : "",
    description: p?.description ?? "",
    topNote: p?.topNote ?? "",
    heartNote: p?.heartNote ?? "",
    baseNote: p?.baseNote ?? "",
    intensity: (p?.intensity && (INTENSITY_OPTIONS as readonly string[]).includes(p.intensity)) ? p.intensity : "",
    volume: p?.volume ?? "",
    collection: p?.collection ?? "",
    categoryId: p?.categoryId ?? "",
    isFeatured: !!p?.isFeatured,
    scentNotes: p?.scentNotes ?? [],
  };
}

export function ProductForm({ mode, initialProduct }: ProductFormProps) {
  const router = useRouter();
  const [form, setForm] = useState<FormState>(() => fromProduct(initialProduct));
  const [categories, setCategories] = useState<Category[]>([]);
  const [existingImages, setExistingImages] = useState<string[]>(initialProduct?.images ?? []);
  const [newImageFiles, setNewImageFiles] = useState<File[]>([]);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Load collections for the dropdown
  useEffect(() => {
    fetch("/api/categories")
      .then((r) => r.json())
      .then((d) => setCategories(d.categories ?? []))
      .catch(() => setCategories([]));
  }, []);

  // Auto-fill slug from name until the admin manually edits the slug
  function handleNameChange(value: string) {
    setForm((f) => ({
      ...f,
      name: value,
      slug: f.slugDirty ? f.slug : generateSlug(value),
    }));
  }

  function handleSlugChange(value: string) {
    setForm((f) => ({ ...f, slug: value, slugDirty: true }));
  }

  async function uploadImage(file: File): Promise<string> {
    const fd = new FormData();
    fd.append("file", file);
    const res = await fetch("/api/admin/upload", { method: "POST", body: fd });
    if (!res.ok) {
      const body = await res.json().catch(() => ({}));
      throw new Error(body.error ?? "Image upload failed");
    }
    const { url } = await res.json();
    return url as string;
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setSubmitting(true);
    setError(null);
    try {
      // 1. Upload all new files in parallel
      const uploadedUrls = await Promise.all(newImageFiles.map(uploadImage));
      const allImages = [...existingImages, ...uploadedUrls];

      // 2. Build the payload — convert numeric strings, omit empty optionals
      const payload: Record<string, unknown> = {
        name: form.name.trim(),
        slug: form.slug.trim() || generateSlug(form.name),
        description: form.description.trim(),
        price: Number(form.price),
        stock: Number(form.stock),
        images: allImages,
        scentNotes: form.scentNotes,
        isFeatured: form.isFeatured,
      };
      // CR-05: Always include optional fields so $unset can clear them in edit mode.
      // null means "clear the field"; a non-empty string means "set the field".
      payload.categoryId = form.categoryId || null;
      payload.collection = form.collection.trim() || null;
      payload.topNote = form.topNote.trim() || null;
      payload.heartNote = form.heartNote.trim() || null;
      payload.baseNote = form.baseNote.trim() || null;
      payload.intensity = form.intensity || null;
      payload.volume = form.volume.trim() || null;

      const url = mode === "new" ? "/api/admin/products" : `/api/admin/products/${initialProduct!.id}`;
      const method = mode === "new" ? "POST" : "PUT";
      const res = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
      if (!res.ok) {
        const body = await res.json().catch(() => ({}));
        const detail = Array.isArray(body.error)
          ? body.error.map((i: { message?: string }) => i.message).join(", ")
          : (body.error ?? `HTTP ${res.status}`);
        throw new Error(String(detail));
      }
      router.push("/admin/products");
      router.refresh();
    } catch (e) {
      setError(e instanceof Error ? e.message : "Submit failed");
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <form onSubmit={handleSubmit} className="max-w-[800px] mx-auto px-8 py-8 space-y-12">
      {error && (
        <div className="border border-black px-4 py-3 text-[11px] uppercase tracking-[0.1em] text-black">
          {error}
        </div>
      )}

      {/* SECTION 1 — Basic Info */}
      <section className="space-y-6">
        <h2 className="text-[13px] font-semibold uppercase tracking-[0.15em] text-black border-b border-black pb-2">Basic Info</h2>
        <div>
          <label className="text-[11px] font-semibold uppercase tracking-[0.15em] text-black mb-2 block">Name</label>
          <input
            type="text"
            required
            value={form.name}
            onChange={(e) => handleNameChange(e.target.value)}
            className="border border-black px-3 h-[40px] text-[13px] w-full bg-white text-black focus:outline-none"
          />
        </div>
        <div>
          <label className="text-[11px] font-semibold uppercase tracking-[0.15em] text-black mb-2 block">Slug</label>
          <input
            type="text"
            required
            value={form.slug}
            onChange={(e) => handleSlugChange(e.target.value)}
            pattern="[a-z0-9-]+"
            className="border border-black px-3 h-[40px] text-[13px] w-full bg-white text-black focus:outline-none"
          />
        </div>
        <div className="grid grid-cols-2 gap-6">
          <div>
            <label className="text-[11px] font-semibold uppercase tracking-[0.15em] text-black mb-2 block">Price (Rs.)</label>
            <input
              type="number"
              required
              min="1"
              step="1"
              value={form.price}
              onChange={(e) => setForm({ ...form, price: e.target.value })}
              className="border border-black px-3 h-[40px] text-[13px] w-full bg-white text-black focus:outline-none"
            />
          </div>
          <div>
            <label className="text-[11px] font-semibold uppercase tracking-[0.15em] text-black mb-2 block">Stock</label>
            <input
              type="number"
              required
              min="0"
              step="1"
              value={form.stock}
              onChange={(e) => setForm({ ...form, stock: e.target.value })}
              className="border border-black px-3 h-[40px] text-[13px] w-full bg-white text-black focus:outline-none"
            />
          </div>
        </div>
      </section>

      {/* SECTION 2 — Description */}
      <section className="space-y-6">
        <h2 className="text-[13px] font-semibold uppercase tracking-[0.15em] text-black border-b border-black pb-2">Description</h2>
        <textarea
          required
          rows={5}
          value={form.description}
          onChange={(e) => setForm({ ...form, description: e.target.value })}
          className="border border-black px-3 py-2 text-[13px] w-full bg-white text-black focus:outline-none resize-y"
        />
      </section>

      {/* SECTION 3 — Fragrance Notes */}
      <section className="space-y-6">
        <h2 className="text-[13px] font-semibold uppercase tracking-[0.15em] text-black border-b border-black pb-2">Fragrance Notes</h2>
        <div className="grid grid-cols-3 gap-6">
          {(["topNote", "heartNote", "baseNote"] as const).map((key) => (
            <div key={key}>
              <label className="text-[11px] font-semibold uppercase tracking-[0.15em] text-black mb-2 block">
                {key === "topNote" ? "Top Note" : key === "heartNote" ? "Heart Note" : "Base Note"}
              </label>
              <input
                type="text"
                value={form[key]}
                onChange={(e) => setForm({ ...form, [key]: e.target.value })}
                className="border border-black px-3 h-[40px] text-[13px] w-full bg-white text-black focus:outline-none"
              />
            </div>
          ))}
        </div>
        <div>
          <label className="text-[11px] font-semibold uppercase tracking-[0.15em] text-black mb-2 block">Intensity</label>
          <select
            value={form.intensity}
            onChange={(e) => setForm({ ...form, intensity: e.target.value })}
            className="border border-black px-3 h-[40px] text-[13px] w-full bg-white text-black focus:outline-none"
          >
            <option value="">— Select intensity —</option>
            {INTENSITY_OPTIONS.map((opt) => (
              <option key={opt} value={opt}>{opt}</option>
            ))}
          </select>
        </div>
        <div>
          <label className="text-[11px] font-semibold uppercase tracking-[0.15em] text-black mb-3 block">Scent Profile</label>
          <div className="flex flex-wrap gap-2">
            {SCENT_NOTE_OPTIONS.map((note) => {
              const checked = form.scentNotes.includes(note);
              return (
                <button
                  key={note}
                  type="button"
                  onClick={() => {
                    setForm((f) => ({
                      ...f,
                      scentNotes: checked
                        ? f.scentNotes.filter((n) => n !== note)
                        : [...f.scentNotes, note],
                    }));
                  }}
                  className={`px-3 h-[28px] text-[11px] font-semibold uppercase tracking-[0.1em] border transition-none ${
                    checked
                      ? "bg-black text-white border-black"
                      : "bg-white text-black border-black hover:bg-black hover:text-white"
                  }`}
                >
                  {note}
                </button>
              );
            })}
          </div>
        </div>
      </section>

      {/* SECTION 4 — Specs */}
      <section className="space-y-6">
        <h2 className="text-[13px] font-semibold uppercase tracking-[0.15em] text-black border-b border-black pb-2">Specs</h2>
        <div className="grid grid-cols-2 gap-6">
          <div>
            <label className="text-[11px] font-semibold uppercase tracking-[0.15em] text-black mb-2 block">Volume</label>
            <input
              type="text"
              placeholder="e.g. 50ml Extrait de Parfum"
              value={form.volume}
              onChange={(e) => setForm({ ...form, volume: e.target.value })}
              className="border border-black px-3 h-[40px] text-[13px] w-full bg-white text-black focus:outline-none"
            />
          </div>
          <div>
            <label className="text-[11px] font-semibold uppercase tracking-[0.15em] text-black mb-2 block">Collection Label</label>
            <input
              type="text"
              placeholder="e.g. SIGNATURE COLLECTION // 001"
              value={form.collection}
              onChange={(e) => setForm({ ...form, collection: e.target.value })}
              className="border border-black px-3 h-[40px] text-[13px] w-full bg-white text-black focus:outline-none"
            />
          </div>
        </div>
        <div>
          <label className="text-[11px] font-semibold uppercase tracking-[0.15em] text-black mb-2 block">Category</label>
          <select
            value={form.categoryId}
            onChange={(e) => setForm({ ...form, categoryId: e.target.value })}
            className="border border-black px-3 h-[40px] text-[13px] w-full bg-white text-black focus:outline-none"
          >
            <option value="">— None —</option>
            {categories.map((c) => (
              <option key={c.id} value={c.id}>{c.name}</option>
            ))}
          </select>
        </div>
        <AdminToggle
          checked={form.isFeatured}
          onChange={(v) => setForm({ ...form, isFeatured: v })}
          label="FEATURED PRODUCT"
        />
      </section>

      {/* SECTION 5 — Media */}
      <section className="space-y-6">
        <h2 className="text-[13px] font-semibold uppercase tracking-[0.15em] text-black border-b border-black pb-2">Media</h2>
        <p className="text-[11px] text-[#4c4546]">First image is the main product image. Hover to remove.</p>
        <ProductImageUpload
          existingUrls={existingImages}
          onExistingUrlsChange={setExistingImages}
          onNewFilesChange={setNewImageFiles}
        />
      </section>

      {/* Buttons */}
      <div className="flex gap-4 border-t border-black pt-8">
        <Link
          href="/admin/products"
          className="border border-black bg-white text-black py-3 px-8 text-[11px] font-semibold uppercase tracking-[0.15em] hover:bg-black hover:text-white transition-none"
        >
          Discard
        </Link>
        <button
          type="submit"
          disabled={submitting}
          className="border border-black bg-black text-white py-3 px-8 text-[11px] font-semibold uppercase tracking-[0.15em] hover:bg-white hover:text-black transition-none disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {submitting ? "Saving…" : mode === "new" ? "Save Product" : "Update Product"}
        </button>
      </div>
    </form>
  );
}
