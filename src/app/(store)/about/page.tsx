"use client";

import Image from "next/image";
import { useScrollReveal } from "@/hooks/useScrollReveal";

export default function AboutPage() {
  const section1Reveal = useScrollReveal(0.15);
  const section2Reveal = useScrollReveal(0.15);
  const section3Reveal = useScrollReveal(0.15);

  return (
    <div className="max-w-[1440px] mx-auto border-x border-b border-black bg-white min-h-screen flex flex-col">
      {/* ── Page Header ── */}
      <div className="border-b border-black py-16 px-6 md:px-12 text-center bg-white">
        <h1 className="text-[44px] sm:text-[64px] md:text-[80px] leading-none tracking-[-0.04em] font-light uppercase text-black">
          The House of Nascent
        </h1>
        <p className="font-['Inter'] uppercase tracking-[0.2em] text-[11px] text-[#4c4546] mt-4">
          Silence · Space · Olfactory Substance
        </p>
      </div>

      {/* ── Hero Image Section ── */}
      <div className="h-[400px] md:h-[600px] border-b border-black relative overflow-hidden bg-neutral-100">
        <Image
          src="/images/about_hero.png"
          alt="Minimalist brutalist architecture representing The House of Nascent"
          fill
          priority
          sizes="100vw"
          className="object-cover grayscale"
        />
      </div>

      {/* ── Section 1: Philosophy ── */}
      <section
        ref={section1Reveal.ref}
        className={`grid grid-cols-1 md:grid-cols-12 border-b border-black transition-[opacity,transform] duration-700 ease-out ${
          section1Reveal.visible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-6"
        }`}
      >
        <div className="md:col-span-4 p-8 md:p-16 border-b md:border-b-0 md:border-r border-black flex flex-col justify-start">
          <p className="font-['Inter'] uppercase tracking-[0.2em] text-[11px] font-semibold text-black">
            01 // The Bias of Negation
          </p>
        </div>
        <div className="md:col-span-8 p-8 md:p-16 flex flex-col gap-6">
          <h2 className="text-[28px] md:text-[36px] leading-[1.2] tracking-[-0.02em] font-normal uppercase text-black max-w-[600px]">
            Silence, space, and pure sensory substance.
          </h2>
          <div className="text-[15px] md:text-[16px] leading-[1.7] text-black font-['Inter'] max-w-[640px] space-y-6 font-light">
            <p>
              We believe in the beauty of negation. By stripping away the non-essential—the decorative
              flourishes, the branding noise, the complex color palettes—we isolate the olfactory
              substance.
            </p>
            <p>
              Nascent is an inquiry into purity. Each fragrance is built as a structural monolith, using
              rare, high-integrity ingredients that speak in whispers rather than shouts. Our work exists
              for those who find luxury in quiet spaces and precision in raw materials.
            </p>
          </div>
        </div>
      </section>

      {/* ── Section 2: Formulation ── */}
      <section
        ref={section2Reveal.ref}
        className={`grid grid-cols-1 md:grid-cols-12 border-b border-black transition-[opacity,transform] duration-700 ease-out ${
          section2Reveal.visible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-6"
        }`}
      >
        <div className="md:col-span-8 p-8 md:p-16 order-2 md:order-1 border-r-0 md:border-r border-black flex flex-col gap-6">
          <p className="font-['Inter'] uppercase tracking-[0.2em] text-[11px] font-semibold text-black">
            02 // The Olfactory Standard
          </p>
          <h2 className="text-[28px] md:text-[36px] leading-[1.2] tracking-[-0.02em] font-normal uppercase text-black max-w-[600px]">
            Uncompromising Extrait de Parfum.
          </h2>
          <div className="text-[15px] md:text-[16px] leading-[1.7] text-black font-['Inter'] max-w-[640px] space-y-6 font-light">
            <p>
              Every creation from Nascent is formulated at the highest olfactory tier. We blend our
              fragrances at a strict 30% concentration of pure scent oils, resulting in a density that
              anchors itself to the skin and develops over days.
            </p>
            <p>
              Our ingredients are sourced through low-yield molecular extractions, preserving the raw
              imperfections of vetiver, amber, and cedarwood. This gives each batch a distinct, organic
              signature—sterile in design, but intensely human on the skin.
            </p>
          </div>
        </div>
        <div className="md:col-span-4 p-8 md:p-16 order-1 md:order-2 border-b border-black md:border-b-0 bg-[#f9f9f9] flex flex-col justify-center min-h-[300px] md:min-h-0">
          <h3 className="font-['Inter'] uppercase tracking-[0.15em] text-[11px] font-bold text-black mb-8 border-b border-black pb-2">
            Technical Profile
          </h3>
          <ul className="space-y-4 font-['Inter'] text-[13px] text-black">
            <li className="flex justify-between border-b border-black pb-1">
              <span className="font-semibold uppercase tracking-wider text-[10px]">Concentration</span>
              <span>30% Scent Oils</span>
            </li>
            <li className="flex justify-between border-b border-black pb-1">
              <span className="font-semibold uppercase tracking-wider text-[10px]">Format</span>
              <span>Extrait de Parfum</span>
            </li>
            <li className="flex justify-between border-b border-black pb-1">
              <span className="font-semibold uppercase tracking-wider text-[10px]">Distillation</span>
              <span>Low-yield molecular</span>
            </li>
            <li className="flex justify-between border-b border-black pb-1">
              <span className="font-semibold uppercase tracking-wider text-[10px]">Batch Limits</span>
              <span>Hand-numbered small runs</span>
            </li>
          </ul>
        </div>
      </section>

      {/* ── Section 3: Architecture ── */}
      <section
        ref={section3Reveal.ref}
        className={`grid grid-cols-1 md:grid-cols-12 transition-[opacity,transform] duration-700 ease-out ${
          section3Reveal.visible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-6"
        }`}
      >
        <div className="md:col-span-4 p-8 md:p-16 border-b md:border-b-0 md:border-r border-black flex flex-col justify-start">
          <p className="font-['Inter'] uppercase tracking-[0.2em] text-[11px] font-semibold text-black">
            03 // Geometry & Precision
          </p>
        </div>
        <div className="md:col-span-8 p-8 md:p-16 flex flex-col gap-6">
          <h2 className="text-[28px] md:text-[36px] leading-[1.2] tracking-[-0.02em] font-normal uppercase text-black max-w-[600px]">
            The Right Angle.
          </h2>
          <div className="text-[15px] md:text-[16px] leading-[1.7] text-black font-['Inter'] max-w-[640px] space-y-6 font-light">
            <p>
              Our design language is rooted in clinical minimalism. There are zero rounded corners in the
              House of Nascent. The sharp 90-degree lines of our vessels, our packaging, and our spaces
              evoke the precision of laboratory glassware and the architectural strength of brutalist
              monuments.
            </p>
            <p>
              This geometric purity is a commitment. By housing our liquid in absolute black and white
              structures, we protect it from light, and we protect the wearer from visual distraction. The
              sensory experience is undivided.
            </p>
          </div>
        </div>
      </section>
    </div>
  );
}
