"use client";

import { FormEvent, useEffect, useState } from "react";
import { SignInButton, useUser } from "@clerk/nextjs";
import type { PublicReview } from "@/types/models";
import { ReviewStars } from "@/components/reviews/ReviewStars";
import { ReviewerAvatar } from "@/components/reviews/ReviewerAvatar";

import { QuickStarRating } from "@/components/reviews/QuickStarRating";

type ProductReviewsProps = {
  productSlug: string;
  initialRating?: number;
  initialRatingCount?: number;
};

function getViewerName(user: ReturnType<typeof useUser>["user"]): string | null {
  if (!user) return null;
  const fullName = user.fullName?.trim();
  if (fullName) return fullName;
  const names = [user.firstName, user.lastName].filter(Boolean).join(" ").trim();
  return names || null;
}

function withViewerAvatar(
  review: PublicReview,
  viewerName: string | null,
  viewerImageUrl?: string
): PublicReview {
  if (
    review.authorImageUrl ||
    !viewerImageUrl ||
    !viewerName ||
    review.authorName.trim().toLowerCase() !== viewerName.trim().toLowerCase()
  ) {
    return review;
  }
  return { ...review, authorImageUrl: viewerImageUrl };
}

export function ProductReviews({
  productSlug,
  initialRating = 5.0,
  initialRatingCount = 0,
}: ProductReviewsProps) {
  const { isLoaded, isSignedIn, user } = useUser();
  const [reviews, setReviews] = useState<PublicReview[]>([]);
  const [liveRating, setLiveRating] = useState(initialRating);
  const [liveRatingCount, setLiveRatingCount] = useState(initialRatingCount);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [rating, setRating] = useState(5);
  const [title, setTitle] = useState("");
  const [body, setBody] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [notice, setNotice] = useState<string | null>(null);
  const viewerName = getViewerName(user);
  const displayReviews = reviews.map((review) =>
    withViewerAvatar(review, viewerName, user?.imageUrl)
  );

  useEffect(() => {
    let active = true;

    async function loadReviews() {
      setLoading(true);
      setError(null);
      try {
        const res = await fetch(`/api/products/${productSlug}/reviews`, { cache: "no-store" });
        if (!res.ok) throw new Error("Failed to load reviews");
        const data = await res.json();
        if (active) setReviews(data.reviews ?? []);
      } catch (loadError) {
        if (active) {
          setError(loadError instanceof Error ? loadError.message : "Failed to load reviews");
        }
      } finally {
        if (active) setLoading(false);
      }
    }

    loadReviews();
    return () => {
      active = false;
    };
  }, [productSlug]);

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setSubmitting(true);
    setError(null);
    setNotice(null);

    try {
      const res = await fetch(`/api/products/${productSlug}/reviews`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ rating, title, body }),
      });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) {
        throw new Error(data.error ?? "Failed to save review");
      }
      setBody("");
      setTitle("");
      setNotice("Review published.");
      const next = await fetch(`/api/products/${productSlug}/reviews`, { cache: "no-store" });
      if (next.ok) {
        const nextData = await next.json();
        setReviews(nextData.reviews ?? []);
      }
      // Refresh rating stats
      const rateRes = await fetch(`/api/products/${productSlug}/rate`, { cache: "no-store" });
      if (rateRes.ok) {
        const rateData = await rateRes.json();
        setLiveRating(rateData.rating);
        setLiveRatingCount(rateData.ratingCount);
      }
    } catch (submitError) {
      setError(submitError instanceof Error ? submitError.message : "Failed to save review");
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <section id="reviews" className="py-24 px-12 lg:px-24 bg-white border-t border-black scroll-mt-20">
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-12">
        <div className="lg:col-span-4 flex flex-col gap-6">
          <div>
            <p className="font-['Inter'] uppercase tracking-[0.2em] text-[11px] text-[#4c4546] mb-4">
              Ratings & Impressions
            </p>
            <h2 className="text-[32px] leading-[1.1] tracking-[-0.02em] font-normal text-black uppercase mb-4">
              Reviews
            </h2>
          </div>

          <div className="border border-black p-6 bg-[#f9f9f9] flex flex-col gap-4">
            <div className="flex items-baseline gap-3">
              <span className="text-[44px] font-light leading-none text-black">
                {liveRating.toFixed(1)}
              </span>
              <span className="font-['Inter'] uppercase tracking-[0.15em] text-[11px] text-[#4c4546]">
                / 5.0 Rating
              </span>
            </div>

            <div>
              <p className="font-['Inter'] uppercase tracking-[0.12em] text-[10px] font-semibold text-black mb-2">
                Quick Star Rating (No login required)
              </p>
              <QuickStarRating
                productSlug={productSlug}
                initialRating={liveRating}
                initialRatingCount={liveRatingCount}
                size="md"
                onRated={(r, c) => {
                  setLiveRating(r);
                  setLiveRatingCount(c);
                }}
              />
            </div>

            <p className="font-['Inter'] text-[11px] leading-[1.6] text-[#4c4546] border-t border-black/10 pt-3">
              Total {liveRatingCount} {liveRatingCount === 1 ? "rating" : "ratings"} recorded.
            </p>
          </div>
        </div>

        <div className="lg:col-span-8 grid grid-cols-1 gap-8">
          <div className="border border-black">
            <div className="bg-black text-white px-5 py-3 font-['Inter'] uppercase tracking-[0.15em] text-[11px] font-semibold">
              Write a detailed review
            </div>
            <div className="p-5">
              {!isLoaded ? (
                <p className="font-['Inter'] text-[13px] text-black">Checking account status…</p>
              ) : !isSignedIn ? (
                <div className="flex flex-col sm:flex-row sm:items-center gap-4 justify-between">
                  <p className="font-['Inter'] text-[13px] text-black">
                    Sign in to submit one review for this product.
                  </p>
                  <SignInButton mode="modal">
                    <button className="border border-black bg-black text-white py-3 px-6 font-['Inter'] uppercase tracking-[0.15em] text-[11px] font-semibold hover:bg-white hover:text-black transition-none">
                      Sign In
                    </button>
                  </SignInButton>
                </div>
              ) : (
                <form onSubmit={handleSubmit} className="grid grid-cols-1 gap-4">
                  <ReviewStars rating={rating} onChange={setRating} />
                  <input
                    value={title}
                    onChange={(event) => setTitle(event.target.value)}
                    maxLength={120}
                    placeholder="Review title (optional)"
                    className="border border-black px-4 py-3 font-['Inter'] text-[13px] text-black outline-none"
                  />
                  <textarea
                    value={body}
                    onChange={(event) => setBody(event.target.value)}
                    minLength={10}
                    maxLength={2000}
                    required
                    placeholder="Describe the scent, wear, and impression."
                    className="min-h-[140px] border border-black px-4 py-3 font-['Inter'] text-[13px] text-black outline-none"
                  />
                  <button
                    type="submit"
                    disabled={submitting || body.trim().length < 10}
                    className="justify-self-start border border-black bg-black text-white py-3 px-8 font-['Inter'] uppercase tracking-[0.15em] text-[11px] font-semibold hover:bg-white hover:text-black transition-none disabled:opacity-40"
                  >
                    {submitting ? "Saving…" : "Publish review"}
                  </button>
                </form>
              )}
              {notice && (
                <p className="mt-4 border border-black px-4 py-3 font-['Inter'] text-[12px] uppercase tracking-[0.1em] text-black">
                  {notice}
                </p>
              )}
              {error && (
                <p className="mt-4 border border-black px-4 py-3 font-['Inter'] text-[12px] uppercase tracking-[0.1em] text-black">
                  {error}
                </p>
              )}
            </div>
          </div>

          <div className="grid grid-cols-1 gap-0 border-t border-l border-black">
            {loading ? (
              <div className="border-r border-b border-black p-5 font-['Inter'] text-[13px] text-black">
                Loading reviews…
              </div>
            ) : displayReviews.length === 0 ? (
              <div className="border-r border-b border-black p-5 font-['Inter'] text-[13px] text-black">
                No reviews yet.
              </div>
            ) : (
              displayReviews.map((review) => (
                <article key={review.id} className="border-r border-b border-black p-5">
                  <div className="flex items-center justify-between gap-4 mb-4">
                    <div className="flex items-center gap-3 min-w-0">
                      <ReviewerAvatar name={review.authorName} imageUrl={review.authorImageUrl} size="sm" />
                      <span className="font-['Inter'] uppercase tracking-[0.15em] text-[10px] text-[#4c4546] truncate">
                        {review.authorName}
                      </span>
                    </div>
                    <span className="font-['Inter'] uppercase tracking-[0.15em] text-[10px] text-[#4c4546]">
                      {new Date(review.createdAt).toLocaleDateString()}
                    </span>
                  </div>
                  <ReviewStars rating={review.rating} size="sm" />
                  {review.title && (
                    <h3 className="font-['Inter'] uppercase tracking-[0.1em] text-[12px] font-semibold text-black mt-4 mb-3">
                      {review.title}
                    </h3>
                  )}
                  <p className="font-['Inter'] text-[14px] leading-[1.6] text-black">
                    “{review.body}”
                  </p>
                </article>
              ))
            )}
          </div>
        </div>
      </div>
    </section>
  );
}
