import Link from "next/link";
import Image from "next/image";
import { Nav } from "@/components/ui/Nav";
import { Footer } from "@/components/ui/Footer";
import { PRODUCTS } from "@/components/dummy-data";

export default function Home() {
  const featured = PRODUCTS.filter((p) => p.isFeatured).slice(0, 3);
  const featured1 = PRODUCTS[0];

  return (
    <div className="min-h-screen bg-white text-black flex flex-col">
      <Nav />

      <main className="flex-1">
        {/* ── Hero ── */}
        <section className="h-screen flex flex-col justify-center items-center px-16 border-b border-black relative overflow-hidden">
          <div className="absolute inset-0 z-0">
            <Image
              src="https://images.unsplash.com/photo-1541643600914-78b084683601?auto=format&fit=crop&q=80&w=2000"
              alt="Hero background"
              fill
              priority
              className="object-cover opacity-20 grayscale"
            />
          </div>
          <div className="z-10 text-center max-w-4xl mx-auto flex flex-col items-center gap-12">
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
        <section className="py-32 px-16 border-b border-black">
          <div className="max-w-[1440px] mx-auto grid grid-cols-1 md:grid-cols-12 gap-6 items-center">
            <div className="md:col-span-6 border border-black p-4 h-[600px] relative overflow-hidden">
              <Image
                src={featured1.images[0]}
                alt={featured1.name}
                fill
                className="object-cover grayscale"
              />
            </div>
            <div className="md:col-span-5 md:col-start-8 flex flex-col gap-8">
              <p className="font-['Inter'] uppercase tracking-[0.2em] text-[11px] text-[#4c4546]">
                {featured1.collection}
              </p>
              <h2 className="text-[40px] leading-[1.1] tracking-[-0.02em] font-normal text-black uppercase">
                {featured1.name}
              </h2>
              <p className="text-[18px] leading-[1.6] text-[#4c4546]">
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

        {/* ── Scent architecture ── */}
        <section className="py-32 px-16 border-b border-black">
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
                    <span className="font-['Inter'] text-[14px] text-[#4c4546]">{value}</span>
                  </div>
                ))}
              </div>
            </div>
            <div className="md:col-span-8 h-[500px] border border-black p-4 relative overflow-hidden">
              <Image
                src="https://images.unsplash.com/photo-1512290923902-8a9f81dc206e?auto=format&fit=crop&q=80&w=2000"
                alt="Scent notes"
                fill
                className="object-cover grayscale"
              />
            </div>
          </div>
        </section>

        {/* ── Curated product grid ── */}
        <section className="py-32 px-16 border-b border-black" id="collections">
          <div className="max-w-[1440px] mx-auto">
            <h3 className="text-[40px] leading-[1.1] tracking-[-0.02em] font-normal text-black uppercase mb-16 text-center">
              Curated Selection
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-0 border-t border-l border-black">
              {featured.map((product) => (
                <Link
                  key={product.id}
                  href={`/products/${product.slug}`}
                  className="border-r border-b border-black flex flex-col group cursor-pointer"
                >
                  <div className="h-96 p-8 flex items-center justify-center border-b border-black relative overflow-hidden">
                    <Image
                      src={product.images[0]}
                      alt={product.name}
                      fill
                      className="object-contain grayscale p-8"
                    />
                  </div>
                  <div className="p-6 flex justify-between items-center bg-white group-hover:bg-black group-hover:text-white transition-none">
                    <span className="font-['Inter'] uppercase tracking-[0.15em] text-[11px] font-semibold">
                      {product.name}
                    </span>
                    <span className="font-['Inter'] text-[11px] font-semibold">
                      ${product.price}
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
        <section className="py-32 px-16 border-b border-black">
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
