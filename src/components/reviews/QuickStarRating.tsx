"use client";

import { useState } from "react";

export interface QuickStarRatingProps {
  productSlug: string;
  initialRating?: number;
  initialRatingCount?: number;
  size?: "sm" | "md" | "lg";
  showCount?: boolean;
  showTag?: boolean;
  tag?: string;
  onRated?: (rating: number, ratingCount: number) => void;
  className?: string;
}

const SENTIMENTS: Record<number, string> = {
  1: "1 ★ Not for me",
  2: "2 ★ Fair / Subtle",
  3: "3 ★ Good everyday",
  4: "4 ★ Loved it!",
  5: "5 ★ Obsessed / Masterpiece!",
};

export function QuickStarRating({
  productSlug,
  initialRating = 5.0,
  initialRatingCount = 0,
  size = "lg",
  showCount = true,
  showTag = false,
  tag = "RATE THIS FRAGRANCE",
  onRated,
  className = "",
}: QuickStarRatingProps) {
  const [rating, setRating] = useState(initialRating);
  const [ratingCount, setRatingCount] = useState(initialRatingCount);
  const [userRating, setUserRating] = useState<number | null>(null);
  const [hoverRating, setHoverRating] = useState<number | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const [feedback, setFeedback] = useState<string | null>(null);

  const starSizeClass =
    size === "sm" ? "text-[16px]" : size === "md" ? "text-[22px]" : "text-[26px]";

  async function handleRate(selected: number) {
    if (submitting) return;
    setSubmitting(true);
    setFeedback(null);

    try {
      const res = await fetch(`/api/products/${productSlug}/rate`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ rating: selected }),
      });

      if (!res.ok) {
        throw new Error("Failed to submit rating");
      }

      const data = await res.json();
      setUserRating(selected);
      if (typeof data.rating === "number") {
        setRating(data.rating);
        setRatingCount(data.ratingCount);
        onRated?.(data.rating, data.ratingCount);
      }
      setFeedback(`✓ Rating saved: ${SENTIMENTS[selected]}`);
      setTimeout(() => setFeedback(null), 4000);
    } catch {
      setFeedback("Could not save rating. Please try again.");
      setTimeout(() => setFeedback(null), 3000);
    } finally {
      setSubmitting(false);
    }
  }

  const displayStars = hoverRating ?? userRating ?? Math.round(rating);

  // Status text is always guaranteed a fixed-height line to prevent layout shift
  let statusText = "Tap any star to rate this fragrance";
  let statusClass = "text-black/50";

  if (feedback) {
    statusText = feedback;
    statusClass = "text-black font-semibold";
  } else if (hoverRating) {
    statusText = SENTIMENTS[hoverRating];
    statusClass = "text-black font-semibold";
  } else if (userRating) {
    statusText = `Your rating: ${SENTIMENTS[userRating]}`;
    statusClass = "text-black font-medium";
  }

  return (
    <div className={`flex flex-col gap-2.5 ${className}`}>
      {showTag && (
        <div className="flex items-center">
          <span className="inline-flex items-center gap-1.5 font-['Inter'] text-[10px] uppercase tracking-[0.15em] font-semibold bg-black text-white px-2.5 py-1">
            ✦ {tag}
          </span>
        </div>
      )}

      <div className="flex items-center gap-3">
        {/* Fixed star row */}
        <div
          className="flex items-center gap-1 h-[32px]"
          role="radiogroup"
          aria-label="Rate this fragrance"
          onMouseLeave={() => setHoverRating(null)}
        >
          {[1, 2, 3, 4, 5].map((starValue) => {
            const isFilled = starValue <= displayStars;
            return (
              <button
                key={starValue}
                type="button"
                role="radio"
                aria-checked={userRating === starValue}
                aria-label={`${starValue} star${starValue === 1 ? "" : "s"} - ${SENTIMENTS[starValue]}`}
                disabled={submitting}
                onClick={() => handleRate(starValue)}
                onMouseEnter={() => setHoverRating(starValue)}
                className={`${starSizeClass} w-[28px] h-[28px] flex items-center justify-center leading-none cursor-pointer text-black hover:opacity-60 transition-opacity p-0 disabled:cursor-not-allowed`}
              >
                {isFilled ? "★" : "☆"}
              </button>
            );
          })}
        </div>

        {showCount && (
          <div className="flex items-center gap-1.5 font-['Inter'] text-[12px] uppercase tracking-wider text-[#4c4546]">
            <span className="font-semibold text-black">{rating.toFixed(1)}</span>
            <span>({ratingCount} {ratingCount === 1 ? "rating" : "ratings"})</span>
          </div>
        )}
      </div>

      {/* Reserved height line: ensures zero layout shift / page blinking */}
      <div className="h-[22px] flex items-center">
        <span className={`font-['Inter'] text-[12px] tracking-wide leading-normal ${statusClass}`}>
          {statusText}
        </span>
      </div>
    </div>
  );
}
