"use client";

import { useState } from "react";

export interface QuickStarRatingProps {
  productSlug: string;
  initialRating?: number;
  initialRatingCount?: number;
  size?: "sm" | "md" | "lg";
  showCount?: boolean;
  onRated?: (rating: number, ratingCount: number) => void;
  className?: string;
}

export function QuickStarRating({
  productSlug,
  initialRating = 5.0,
  initialRatingCount = 0,
  size = "md",
  showCount = true,
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
    size === "sm" ? "text-[12px]" : size === "lg" ? "text-[22px]" : "text-[16px]";

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
      setFeedback("Rating saved");
      setTimeout(() => setFeedback(null), 3000);
    } catch {
      setFeedback("Could not save rating");
      setTimeout(() => setFeedback(null), 3000);
    } finally {
      setSubmitting(false);
    }
  }

  const displayStars = hoverRating ?? userRating ?? Math.round(rating);

  return (
    <div className={`flex flex-col gap-1 ${className}`}>
      <div className="flex items-center gap-2">
        <div
          className="flex items-center gap-0.5"
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
                aria-label={`${starValue} star${starValue === 1 ? "" : "s"}`}
                disabled={submitting}
                onClick={() => handleRate(starValue)}
                onMouseEnter={() => setHoverRating(starValue)}
                className={`${starSizeClass} leading-none cursor-pointer text-black hover:opacity-60 transition-opacity p-0.5 disabled:cursor-not-allowed`}
              >
                {isFilled ? "★" : "☆"}
              </button>
            );
          })}
        </div>

        {showCount && (
          <div className="flex items-center gap-1.5 font-['Inter'] text-[11px] uppercase tracking-wider text-[#4c4546]">
            <span className="font-semibold text-black">{rating.toFixed(1)}</span>
            <span>({ratingCount})</span>
          </div>
        )}
      </div>

      {feedback && (
        <span className="font-['Inter'] text-[10px] uppercase tracking-widest text-black animate-fade-in">
          {feedback}
        </span>
      )}
    </div>
  );
}
