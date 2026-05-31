"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import Image from "next/image";
import { Nav } from "@/components/ui/Nav";
import { Footer } from "@/components/ui/Footer";
import type { Product } from "@/types/models";
import { useScrollReveal } from "@/hooks/useScrollReveal";
import { formatPrice } from "@/lib/currency";

export default function Home() {
  const [products, setProducts] = useState<Product[]>([]);

  useEffect(() => {
    fetch("/api/products?featured=true")
      .then((r) => r.json())
      .then((data) => setProducts(data.products ?? []))
      .catch(() => { });
  }, []);

  const featured = products.slice(0, 3);
  const featured1 = products[0];
  const featuredReveal = useScrollReveal<HTMLElement>(0.15);
  const archReveal = useScrollReveal<HTMLElement>(0.15);
  const gridReveal = useScrollReveal<HTMLElement>(0.15);
  const anatomyReveal = useScrollReveal<HTMLElement>(0.15);

  return (
    <div className="min-h-screen bg-white text-black flex flex-col">
      <Nav />

      <main className="flex-1">
        {/* ── Hero ── */}
        <section className="h-screen flex flex-col justify-center items-center px-16 border-b border-black relative overflow-hidden">
          <div className="absolute inset-0 z-0">
            <video
              autoPlay
              muted
              loop
              playsInline
              preload="auto"
              poster="https://images.unsplash.com/photo-1541643600914-78b084683601?auto=format&fit=crop&q=80&w=2000"
              className="object-cover w-full h-full opacity-60 grayscale"
            >
              <source
                src="https://res.cloudinary.com/hwaqar/video/upload/ac_none,f_auto,q_auto/v1780208150/nascent/hero/home_hero_bg.mp4"
                type="video/mp4"
              />
              Your browser does not support the video tag.
            </video>
          </div>
          <div className="z-10 text-center max-w-[896px] mx-auto flex flex-col items-center gap-12">
            <h1 className="text-[80px] leading-none tracking-[-0.04em] font-light text-black uppercase">
              The Art of Scent
            </h1>
            <Link
              href="/collections"
              className="inline-block border border-black bg-white text-black font-['Inter'] uppercase tracking-[0.15em] text-[11px] font-semibold px-8 py-4 hover:bg-black hover:text-white transition-none"
            >
              Explore Collections
            </Link>
          </div>
        </section>

        {/* ── Featured fragrance ── */}
        {featured1 && (
          <section
            ref={featuredReveal.ref}
            className={`py-32 px-16 border-b border-black transition-[opacity,transform] duration-700 ease-out ${featuredReveal.visible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-6"}`}
          >
            <div className="max-w-[1440px] mx-auto grid grid-cols-1 md:grid-cols-12 gap-6 items-center">
              <div className="md:col-span-6 border border-black p-4 h-[600px] relative overflow-hidden">
                <Image
                  src={featured1.images[0]}
                  alt={featured1.name}
                  fill
                  sizes="(max-width: 768px) 100vw, 50vw"
                  className="object-cover grayscale"
                />
              </div>
              <div className="md:col-span-5 md:col-start-8 flex flex-col gap-8">
                <p className="font-['Inter'] uppercase tracking-[0.2em] text-[11px] text-black">
                  {featured1.collection}
                </p>
                <h2 className="text-[40px] leading-[1.1] tracking-[-0.02em] font-normal text-black uppercase">
                  {featured1.name}
                </h2>
                <p className="text-[18px] leading-[1.6] text-black">
                  {featured1.description}
                </p>
                <Link
                  href={`/products/${featured1.slug}`}
                  className="self-start border border-black bg-white text-black font-['Inter'] uppercase tracking-[0.15em] text-[11px] font-semibold px-8 py-4 hover:bg-black hover:text-white transition-none"
                >
                  Discover
                </Link>
              </div>
            </div>
          </section>
        )}

        {/* ── Scent architecture ── */}
        {featured1 && (
          <section
            ref={archReveal.ref}
            className={`py-32 px-16 border-b border-black transition-[opacity,transform] duration-700 ease-out ${archReveal.visible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-6"}`}
          >
            <div className="max-w-[1440px] mx-auto grid grid-cols-1 md:grid-cols-12 gap-6">
              <div className="md:col-span-4 flex flex-col justify-center gap-8 pr-8 border-r border-black">
                <h3 className="text-[24px] leading-[1.2] tracking-[0.05em] font-medium text-black uppercase">
                  Scent Architecture
                </h3>
                <div className="flex flex-col gap-4">
                  {[
                    { label: "Top", value: featured1.topNote },
                    { label: "Heart", value: featured1.heartNote },
                    { label: "Base", value: featured1.baseNote },
                  ].map(({ label, value }) => (
                    <div
                      key={label}
                      className="flex justify-between items-center border-b border-black pb-2"
                    >
                      <span className="font-['Inter'] uppercase tracking-[0.15em] text-[11px] font-semibold text-black">
                        {label}
                      </span>
                      <span className="font-['Inter'] text-[14px] text-black">{value}</span>
                    </div>
                  ))}
                </div>
              </div>
              <div className="md:col-span-8 h-[500px] border border-black p-4 relative overflow-hidden">
                <Image
                  src="https://images.unsplash.com/photo-1587017539504-67cfbddac569?auto=format&fit=crop&q=80&w=2000"
                  alt="Scent notes"
                  fill
                  sizes="(max-width: 768px) 100vw, 67vw"
                  className="object-cover grayscale"
                />
              </div>
            </div>
          </section>
        )}

        {/* ── Curated product grid ── */}
        <section
          ref={gridReveal.ref}
          className={`py-32 px-16 border-b border-black transition-[opacity,transform] duration-700 ease-out ${gridReveal.visible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-6"}`}
          id="collections"
        >
          <div className="max-w-[1440px] mx-auto">
            <h3 className="text-[40px] leading-[1.1] tracking-[-0.02em] font-normal text-black uppercase mb-16 text-center">
              Curated Selection
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-0 border-t border-l border-black">
              {featured.map((product) => (
                <Link
                  key={product.id}
                  href={`/products/${product.slug}`}
                  className="border-r border-b border-black flex flex-col group cursor-pointer overflow-hidden"
                >
                  {/* Image area — full bleed with hover VIEW overlay */}
                  <div className="relative h-72 bg-white overflow-hidden">
                    <Image
                      src={product.images[0]}
                      alt={product.name}
                      fill
                      sizes="(max-width: 768px) 100vw, 33vw"
                      className="object-cover grayscale transition-[filter] duration-300 ease-out group-hover:grayscale-0"
                    />
                    {/* View overlay */}
                    <div className="absolute inset-0 bg-black/0 group-hover:bg-black/30 transition-[background-color] duration-300 flex items-center justify-center">
                      <span className="opacity-0 group-hover:opacity-100 transition-opacity duration-300 border border-white text-white text-[11px] uppercase tracking-[0.2em] font-semibold px-6 py-3 translate-y-2 group-hover:translate-y-0 transition-transform duration-300">
                        View
                      </span>
                    </div>
                  </div>
                  {/* Info bar */}
                  <div className="px-5 py-4 flex justify-between items-center bg-white text-black border-t border-black group-hover:bg-black group-hover:text-white transition-colors duration-300">
                    <span className="font-['Inter'] uppercase tracking-[0.12em] text-[11px] font-semibold">
                      {product.name}
                    </span>
                    <span className="font-['Inter'] text-[11px] font-semibold">
                      {formatPrice(product.price)}
                    </span>
                  </div>
                </Link>
              ))}
            </div>
            <div className="mt-16 flex justify-center">
              <Link
                href="/collections"
                className="border border-black bg-white text-black font-['Inter'] uppercase tracking-[0.15em] text-[11px] font-semibold px-12 py-4 hover:bg-black hover:text-white transition-none"
              >
                View All
              </Link>
            </div>
          </div>
        </section>

        {/* ── Anatomy of a Scent ── */}
        <section
          ref={anatomyReveal.ref}
          className={`py-32 px-16 border-b border-black transition-[opacity,transform] duration-700 ease-out ${anatomyReveal.visible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-6"}`}
        >
          <div className="max-w-[1440px] mx-auto grid grid-cols-1 md:grid-cols-12 gap-6">
            <div className="md:col-span-6 pr-0 md:pr-12">
              <h2 className="text-[40px] leading-[1.1] tracking-[-0.02em] font-normal text-black uppercase mb-12">
                Anatomy of a Scent
              </h2>
              <ul className="flex flex-col gap-8">
                {[
                  {
                    label: "Top Notes",
                    icon: "air",
                    text: "The immediate impression. Volatile, precise, geometric. Establishing presence within seconds.",
                  },
                  {
                    label: "Heart Notes",
                    icon: "water_drop",
                    text: "The architectural core. Providing weight, density, and sustained tension over hours.",
                  },
                  {
                    label: "Base Notes",
                    icon: "terrain",
                    text: "The foundation. A grounding, austere finish that anchors the composition to skin for days.",
                  },
                ].map(({ label, icon, text }) => (
                  <li key={label} className="border-b border-black pb-8">
                    <div className="flex justify-between items-baseline mb-4">
                      <h4 className="font-['Inter'] uppercase tracking-[0.15em] text-[11px] font-semibold text-black">
                        {label}
                      </h4>
                      <span className="material-symbols-outlined text-black">{icon}</span>
                    </div>
                    <p className="font-['Inter'] text-[14px] leading-[1.5] text-black">{text}</p>
                  </li>
                ))}
              </ul>
            </div>
            <div className="md:col-span-6 border border-black h-full min-h-[500px] relative overflow-hidden">
              <Image
                src="https://images.unsplash.com/photo-1592945403244-b3fbafd7f539?auto=format&fit=crop&q=80&w=2000"
                alt="Ingredients"
                fill
                sizes="(max-width: 768px) 100vw, 50vw"
                className="object-cover grayscale"
              />
            </div>
          </div>
        </section>
      </main>

      <Footer />
    </div>
  );
}
