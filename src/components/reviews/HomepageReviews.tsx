"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import type { PublicReview } from "@/types/models";
import { ReviewStars } from "@/components/reviews/ReviewStars";
import { ReviewerAvatar } from "@/components/reviews/ReviewerAvatar";

function ReviewCard({ review, large = false }: { review: PublicReview; large?: boolean }) {
  return (
    <article className={`border border-black bg-white p-6 ${large ? "min-h-[360px]" : "min-h-[260px]"}`}>
      <div className="flex items-center justify-between gap-4 mb-8">
        <ReviewStars rating={review.rating} size="sm" />
        <span className="font-['Inter'] uppercase tracking-[0.15em] text-[10px] text-[#4c4546]">
          {review.productName}
        </span>
      </div>
      {review.title && (
        <h3 className="font-['Inter'] uppercase tracking-[0.1em] text-[12px] font-semibold text-black mb-4">
          {review.title}
        </h3>
      )}
      <p className={`${large ? "text-[22px]" : "text-[16px]"} leading-[1.5] text-black`}>
        “{review.body}”
      </p>
      <div className="mt-8 flex items-center justify-between gap-4">
        <div className="flex items-center gap-3 min-w-0">
          <ReviewerAvatar name={review.authorName} imageUrl={review.authorImageUrl} size="sm" />
          <span className="font-['Inter'] uppercase tracking-[0.15em] text-[10px] text-[#4c4546] truncate">
            {review.authorName}
          </span>
        </div>
        <Link
          href={`/products/${review.productSlug}`}
          className="font-['Inter'] uppercase tracking-[0.15em] text-[10px] font-semibold text-black hover:underline"
        >
          View scent →
        </Link>
      </div>
    </article>
  );
}

export function HomepageReviews() {
  const [reviews, setReviews] = useState<PublicReview[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);

  useEffect(() => {
    let active = true;

    async function loadReviews() {
      setLoading(true);
      setError(false);
      try {
        const res = await fetch("/api/reviews/homepage?limit=6", { cache: "no-store" });
        if (!res.ok) throw new Error("Failed to load reviews");
        const data = await res.json();
        if (active) setReviews(data.reviews ?? []);
      } catch {
        if (active) setError(true);
      } finally {
        if (active) setLoading(false);
      }
    }

    loadReviews();
    return () => {
      active = false;
    };
  }, []);

  const showEmpty = !loading && (error || reviews.length === 0);

  return (
    <section className="py-32 px-6 md:px-16 border-b border-black bg-white">
      <div className="max-w-[1440px] mx-auto">
        <div className="grid grid-cols-1 md:grid-cols-12 gap-6 items-end mb-12">
          <div className="md:col-span-7">
            <p className="font-['Inter'] uppercase tracking-[0.2em] text-[11px] text-[#4c4546] mb-4">
              Curated Reviews
            </p>
            <h2 className="text-[40px] leading-[1.1] tracking-[-0.02em] font-normal text-black uppercase">
              Worn by customers
            </h2>
          </div>
        </div>

        {loading && (
          <div className="border border-black p-8 font-['Inter'] uppercase tracking-[0.15em] text-[11px] text-black">
            Loading curated reviews…
          </div>
        )}

        {showEmpty && (
          <div className="border border-black p-8 min-h-[220px] flex flex-col justify-between">
            <p className="font-['Inter'] uppercase tracking-[0.15em] text-[11px] text-[#4c4546]">
              Editorial queue
            </p>
            <p className="text-[24px] leading-[1.3] text-black max-w-[760px]">
              Customer impressions selected by the studio will appear here soon.
            </p>
          </div>
        )}

        {!loading && reviews.length > 0 && (
          <>
            <div className="hidden md:grid md:grid-cols-12 gap-6">
              <div className="md:col-span-6">
                <ReviewCard review={reviews[0]} large />
              </div>
              <div className="md:col-span-6 grid grid-cols-1 sm:grid-cols-2 gap-6">
                {reviews.slice(1, 5).map((review) => (
                  <ReviewCard key={review.id} review={review} />
                ))}
              </div>
            </div>

            <div className="md:hidden flex gap-4 overflow-x-auto snap-x snap-mandatory pb-4">
              {reviews.map((review) => (
                <div key={review.id} className="min-w-[85%] snap-start">
                  <ReviewCard review={review} />
                </div>
              ))}
            </div>
          </>
        )}
      </div>
    </section>
  );
}
