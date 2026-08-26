"use client";

import React, { useState } from "react";
import Link from "next/link";
import Image from "next/image";

export function HeroSection() {
  const [videoLoaded, setVideoLoaded] = useState(false);

  return (
    <section className="h-screen flex flex-col justify-center items-center px-16 border-b border-black relative overflow-hidden bg-black">
      <div className="absolute inset-0 z-0 bg-black">
        <Image
          src="/images/hero_video_poster.png"
          alt="Atmospheric fragrance bottle"
          fill
          priority
          sizes="100vw"
          className="object-cover opacity-50 grayscale"
        />
        <video
          autoPlay
          muted
          loop
          playsInline
          preload="auto"
          onPlaying={() => setVideoLoaded(true)}
          onLoadedData={() => setVideoLoaded(true)}
          className={`absolute inset-0 object-cover w-full h-full grayscale transition-opacity duration-700 ${
            videoLoaded ? "opacity-60" : "opacity-0"
          }`}
        >
          <source
            src="https://res.cloudinary.com/hwaqar/video/upload/ac_none,f_auto,q_auto/v1780208150/nascent/hero/home_hero_bg.mp4"
            type="video/mp4"
          />
          Your browser does not support the video tag.
        </video>
      </div>
      <div className="z-10 text-center max-w-[896px] mx-auto flex flex-col items-center gap-12">
        <h1 className="text-[52px] sm:text-[68px] md:text-[80px] leading-none tracking-[-0.04em] font-light text-white uppercase">
          The Art of Scent
        </h1>
        <Link
          href="/collections"
          className="inline-block border border-white bg-white text-black font-['Inter'] uppercase tracking-[0.15em] text-[11px] font-semibold px-8 py-4 hover:bg-black hover:text-white hover:border-white transition-colors duration-200"
        >
          Explore Collections
        </Link>
      </div>
    </section>
  );
}
