import React from "react";
import Link from "next/link";

export function HeroSection() {
  return (
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
  );
}
