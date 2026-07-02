"use client";

/* eslint-disable @next/next/no-img-element */

import { useState } from "react";

type ReviewerAvatarProps = {
  name: string;
  imageUrl?: string;
  size?: "sm" | "md";
};

function getInitials(name: string): string {
  const parts = name
    .trim()
    .split(/\s+/)
    .filter(Boolean)
    .slice(0, 2);
  const initials = parts.map((part) => part[0]?.toUpperCase()).join("");
  return initials || "N";
}

function getSafeImageUrl(imageUrl?: string): string | undefined {
  if (!imageUrl) return undefined;
  try {
    const url = new URL(imageUrl);
    if (url.protocol !== "http:" && url.protocol !== "https:") return undefined;
    return url.toString();
  } catch {
    return undefined;
  }
}

export function ReviewerAvatar({ name, imageUrl, size = "md" }: ReviewerAvatarProps) {
  const dimension = size === "sm" ? "h-8 w-8 text-[10px]" : "h-10 w-10 text-[11px]";
  const imageSrc = getSafeImageUrl(imageUrl);
  const [failedSrc, setFailedSrc] = useState<string | null>(null);
  const showImage = Boolean(imageSrc && imageSrc !== failedSrc);

  return (
    <span
      aria-label={`${name} avatar`}
      className={`${dimension} relative overflow-hidden shrink-0 border border-black rounded-full bg-white text-black inline-flex items-center justify-center font-['Inter'] uppercase tracking-[0.1em] font-semibold`}
    >
      {showImage && imageSrc ? (
        <img
          src={imageSrc}
          alt=""
          loading="lazy"
          referrerPolicy="no-referrer"
          className="h-full w-full object-cover"
          onError={() => setFailedSrc(imageSrc)}
        />
      ) : (
        getInitials(name)
      )}
    </span>
  );
}
