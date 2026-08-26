import React from "react";
import Image from "next/image";

const ANATOMY_NOTES = [
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
];

export interface ScentAnatomySectionProps {
  sectionRef?: (node: HTMLElement | null) => void;
  isVisible?: boolean;
}

export function ScentAnatomySection({
  sectionRef,
  isVisible = true,
}: ScentAnatomySectionProps) {
  return (
    <section
      ref={sectionRef}
      className={`py-32 px-16 border-b border-black transition-[opacity,transform] duration-700 ease-out ${
        isVisible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-6"
      }`}
    >
      <div className="max-w-[1440px] mx-auto grid grid-cols-1 md:grid-cols-12 gap-6">
        <div className="md:col-span-6 pr-0 md:pr-12">
          <h2 className="text-[40px] leading-[1.1] tracking-[-0.02em] font-normal text-black uppercase mb-12">
            Anatomy of a Scent
          </h2>
          <ul className="flex flex-col gap-8">
            {ANATOMY_NOTES.map(({ label, icon, text }) => (
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
  );
}
