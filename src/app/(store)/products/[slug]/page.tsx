"use client";

import { notFound } from "next/navigation";
import Image from "next/image";
import { use, useState, useEffect } from "react";
import type { Product } from "@/types/models";
import { useCartStore } from "@/lib/cart";
import { useScrollReveal } from "@/hooks/useScrollReveal";
import { formatPrice } from "@/lib/currency";
import { ProductReviews } from "@/components/reviews/ProductReviews";
import { QuickStarRating } from "@/components/reviews/QuickStarRating";
import { OlfactoryProfile } from "@/components/product/OlfactoryProfile";
import { LoadingState } from "@/components/ui/LoadingState";

interface Props {
  params: Promise<{ slug: string }>;
}

export default function ProductPage({ params }: Props) {
  const { slug } = use(params);
  const [product, setProduct] = useState<Product | null>(null);
  const [status, setStatus] = useState<"loading" | "ok" | "notfound">("loading");

  useEffect(() => {
    fetch(`/api/products/${slug}`)
      .then((r) => {
        if (r.status === 404) {
          setStatus("notfound");
          return;
        }
        return r.json().then((data) => {
          setProduct(data.product);
          setStatus("ok");
        });
      })
      .catch(() => setStatus("notfound"));
  }, [slug]);

  const { addItem, openCart } = useCartStore();
  const [specsRef, specsVisible] = useScrollReveal(0.15);

  if (status === "notfound") notFound();
  if (status === "loading" || !product) {
    return <LoadingState minHeight="min-h-[calc(100vh-80px)]" />;
  }

  function handleAddToCart() {
    addItem({
      productId: product!.id,
      slug: product!.slug,
      name: product!.name,
      price: product!.price,
      image: product!.images[0],
    });
    openCart();
  }

  const hasNotes = Boolean(product.topNote || product.heartNote || product.baseNote);

  return (
    <div className="max-w-[1440px] mx-auto">
      {/* ── Hero: two-column layout ── */}
      <section className="grid grid-cols-1 lg:grid-cols-2 min-h-[calc(100vh-80px)] border-b border-black">
        {/* Left: full-bleed image */}
        <div className="border-r border-black bg-[#f9f9f9] relative overflow-hidden min-h-[60vh] lg:min-h-0">
          {product.images[0] && (
            <Image
              src={product.images[0]}
              alt={product.name}
              fill
              priority
              sizes="(max-width: 1024px) 100vw, 50vw"
              className="object-cover grayscale"
            />
          )}
        </div>

        {/* Right: details */}
        <div className="p-12 lg:p-24 flex flex-col justify-center bg-white">
          <div className="mb-8">
            <div className="flex items-center justify-between gap-4 mb-6 flex-wrap">
              {product.collection ? (
                <p className="font-['Inter'] uppercase tracking-[0.2em] text-[11px] text-[#4c4546]">
                  {product.collection}
                </p>
              ) : (
                <span />
              )}
              <a
                href="#reviews"
                className="font-['Inter'] text-[11px] uppercase tracking-wider text-black hover:underline transition-none"
                title="View customer written reviews"
              >
                Read Reviews ↓
              </a>
            </div>
            <h1 className="text-[40px] md:text-[56px] lg:text-[72px] leading-none tracking-[-0.04em] font-light text-black uppercase mb-6">
              {product.name}
            </h1>
            <p className="text-[18px] leading-[1.6] text-black max-w-[512px] mb-6">
              {product.description}
            </p>

            {/* Quick 1-click star rating directly in the product menu section */}
            <div className="p-5 border border-black bg-[#fafafa]">
              <QuickStarRating
                productSlug={product.slug}
                initialRating={product.rating ?? 5.0}
                initialRatingCount={product.ratingCount ?? 0}
                size="lg"
                showTag={true}
                tag="RATE THIS FRAGRANCE"
                onRated={(newRating, newCount) => {
                  setProduct((prev) =>
                    prev ? { ...prev, rating: newRating, ratingCount: newCount } : null
                  );
                }}
              />
            </div>
          </div>

          {/* Olfactory profile */}
          {hasNotes && (
            <div
              ref={specsRef}
              className={`mb-8 border-t border-black pt-6 transition-[opacity,transform] duration-700 ease-out ${
                specsVisible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-6"
              }`}
            >
              <h3 className="font-['Inter'] uppercase tracking-[0.1em] text-[11px] font-semibold text-black mb-4">
                Olfactory Profile
              </h3>
              <OlfactoryProfile
                topNote={product.topNote}
                heartNote={product.heartNote}
                baseNote={product.baseNote}
                variant="table"
              />
            </div>
          )}

          {/* Actions */}
          <div className="flex flex-col sm:flex-row gap-4 mt-auto">
            <button
              onClick={handleAddToCart}
              className="flex-grow border border-black bg-black text-white py-4 px-8 font-['Inter'] uppercase tracking-[0.15em] text-[11px] font-semibold hover:bg-white hover:text-black transition-none"
            >
              {`Acquire // ${formatPrice(product.price)}`}
            </button>
            <button className="border border-black bg-white text-black py-4 px-8 font-['Inter'] uppercase tracking-[0.15em] text-[11px] font-semibold hover:bg-black hover:text-white transition-none flex items-center justify-center gap-2">
              <span className="material-symbols-outlined text-[18px]">favorite</span>
              Save
            </button>
          </div>
        </div>
      </section>

      {/* ── Technical specs ── */}
      <section className="py-24 px-12 lg:px-24 bg-white">
        <div>
          <div className="border-b border-black pb-4 mb-16">
            <h2 className="text-[24px] leading-[1.2] tracking-[0.05em] font-medium text-black uppercase">
              Technical Specifications
            </h2>
          </div>
          <OlfactoryProfile
            topNote={product.topNote}
            heartNote={product.heartNote}
            baseNote={product.baseNote}
            volume={product.volume}
            variant="specs"
          />
        </div>
      </section>

      <ProductReviews
        productSlug={product.slug}
        initialRating={product.rating}
        initialRatingCount={product.ratingCount}
      />
    </div>
  );
}
