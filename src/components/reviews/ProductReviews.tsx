"use client";

import { FormEvent, useEffect, useState } from "react";
import { SignInButton, useUser } from "@clerk/nextjs";
import type { PublicReview } from "@/types/models";
import { ReviewStars } from "@/components/reviews/ReviewStars";
import { ReviewerAvatar } from "@/components/reviews/ReviewerAvatar";

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
}: ProductReviewsProps) {
  const { isLoaded, isSignedIn, user } = useUser();
  const [reviews, setReviews] = useState<PublicReview[]>([]);
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
      setNotice("Review published successfully.");
      const next = await fetch(`/api/products/${productSlug}/reviews`, { cache: "no-store" });
      if (next.ok) {
        const nextData = await next.json();
        setReviews(nextData.reviews ?? []);
      }
    } catch (submitError) {
      setError(submitError instanceof Error ? submitError.message : "Failed to save review");
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <section id="reviews" className="py-24 px-6 md:px-12 lg:px-24 bg-white border-t border-black scroll-mt-20">
      {/* ── Section Header ── */}
      <div className="mb-12 border-b border-black pb-6 flex flex-col md:flex-row md:items-end justify-between gap-4">
        <div>
          <p className="font-['Inter'] uppercase tracking-[0.2em] text-[11px] text-[#4c4546] mb-2">
            Community Feedback
          </p>
          <h2 className="text-[32px] md:text-[40px] leading-[1.1] tracking-[-0.02em] font-normal text-black uppercase">
            Customer Written Reviews
          </h2>
        </div>
        <p className="font-['Inter'] text-[12px] uppercase tracking-[0.1em] text-[#4c4546]">
          Detailed write-ups on longevity, sillage, and olfactory notes
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-12">
        {/* ── LEFT / FORM COLUMN: Write a detailed review ── */}
        <div className="lg:col-span-5">
          <div className="border border-black sticky top-24">
            <div className="bg-black text-white px-5 py-3 flex items-center justify-between">
              <span className="font-['Inter'] uppercase tracking-[0.15em] text-[11px] font-semibold flex items-center gap-2">
                <span>✍️</span> WRITE A DETAILED REVIEW
              </span>
              <span className="font-['Inter'] uppercase tracking-[0.1em] text-[10px] text-white/70">
                Text Review
              </span>
            </div>

            <div className="p-6">
              {!isLoaded ? (
                <p className="font-['Inter'] text-[13px] text-black">Checking account status…</p>
              ) : !isSignedIn ? (
                <div className="flex flex-col gap-4">
                  <p className="font-['Inter'] text-[13px] font-semibold text-black">
                    Share your detailed impression with other fragrance enthusiasts.
                  </p>
                  <p className="font-['Inter'] text-[12px] text-[#4c4546] leading-[1.5]">
                    Sign in to describe your scent journey, longevity, and projection.
                  </p>
                  <SignInButton mode="modal">
                    <button className="border border-black bg-black text-white py-3 px-6 font-['Inter'] uppercase tracking-[0.15em] text-[11px] font-semibold hover:bg-white hover:text-black transition-none w-full">
                      Sign In to Review
                    </button>
                  </SignInButton>
                </div>
              ) : (
                <form onSubmit={handleSubmit} className="grid grid-cols-1 gap-4">
                  <div>
                    <label className="block font-['Inter'] uppercase tracking-[0.12em] text-[11px] font-semibold text-black mb-2">
                      Review Rating Score:
                    </label>
                    <ReviewStars rating={rating} onChange={setRating} />
                  </div>
                  <div>
                    <label className="block font-['Inter'] uppercase tracking-[0.12em] text-[11px] font-semibold text-black mb-1.5">
                      Review Title (Optional):
                    </label>
                    <input
                      value={title}
                      onChange={(event) => setTitle(event.target.value)}
                      maxLength={120}
                      placeholder="e.g. 'Polished drydown and great compliments'"
                      className="border border-black px-4 py-2.5 font-['Inter'] text-[13px] text-black outline-none w-full"
                    />
                  </div>
                  <div>
                    <label className="block font-['Inter'] uppercase tracking-[0.12em] text-[11px] font-semibold text-black mb-1.5">
                      Detailed Review (Required):
                    </label>
                    <textarea
                      value={body}
                      onChange={(event) => setBody(event.target.value)}
                      minLength={10}
                      maxLength={2000}
                      required
                      placeholder="Describe the scent evolution, drydown, longevity, and overall impression (minimum 10 characters)..."
                      className="min-h-[140px] border border-black px-4 py-3 font-['Inter'] text-[13px] text-black outline-none w-full"
                    />
                  </div>
                  <button
                    type="submit"
                    disabled={submitting || body.trim().length < 10}
                    className="border border-black bg-black text-white py-3.5 px-8 font-['Inter'] uppercase tracking-[0.15em] text-[11px] font-semibold hover:bg-white hover:text-black transition-none disabled:opacity-40 cursor-pointer w-full"
                  >
                    {submitting ? "Publishing…" : "Publish Review"}
                  </button>
                </form>
              )}

              {notice && (
                <p className="mt-4 border border-black px-4 py-3 font-['Inter'] text-[12px] uppercase tracking-[0.1em] text-black bg-[#f2f2f2]">
                  {notice}
                </p>
              )}
              {error && (
                <p className="mt-4 border border-black px-4 py-3 font-['Inter'] text-[12px] uppercase tracking-[0.1em] text-black bg-[#fef2f2]">
                  {error}
                </p>
              )}
            </div>
          </div>
        </div>

        {/* ── RIGHT COLUMN: Customer Reviews List ── */}
        <div className="lg:col-span-7">
          <div className="flex items-center justify-between mb-4">
            <h3 className="font-['Inter'] uppercase tracking-[0.15em] text-[12px] font-semibold text-black">
              All Reviews ({displayReviews.length})
            </h3>
            <span className="font-['Inter'] uppercase tracking-[0.1em] text-[10px] text-[#4c4546]">
              Verified Feedback
            </span>
          </div>

          <div className="grid grid-cols-1 gap-0 border border-black">
            {loading ? (
              <div className="p-6 font-['Inter'] text-[13px] text-black">
                Loading reviews…
              </div>
            ) : displayReviews.length === 0 ? (
              <div className="p-8 font-['Inter'] text-[13px] text-black text-center space-y-2">
                <p className="font-semibold">No detailed reviews written yet.</p>
                <p className="text-[#666] text-[12px]">
                  Be the first to share an in-depth wear impression!
                </p>
              </div>
            ) : (
              displayReviews.map((review, idx) => (
                <article
                  key={review.id}
                  className={`p-6 ${idx !== displayReviews.length - 1 ? "border-b border-black" : ""}`}
                >
                  <div className="flex items-center justify-between gap-4 mb-3">
                    <div className="flex items-center gap-3 min-w-0">
                      <ReviewerAvatar name={review.authorName} imageUrl={review.authorImageUrl} size="sm" />
                      <span className="font-['Inter'] uppercase tracking-[0.15em] text-[11px] font-semibold text-black truncate">
                        {review.authorName}
                      </span>
                    </div>
                    <span className="font-['Inter'] uppercase tracking-[0.15em] text-[10px] text-[#4c4546]">
                      {new Date(review.createdAt).toLocaleDateString("en-GB", {
                        day: "2-digit",
                        month: "short",
                        year: "numeric",
                      })}
                    </span>
                  </div>

                  <div className="flex items-center gap-2 mb-3">
                    <ReviewStars rating={review.rating} size="sm" />
                    <span className="font-['Inter'] text-[10px] uppercase tracking-wider text-[#4c4546]">
                      Verified Review
                    </span>
                  </div>

                  {review.title && (
                    <h4 className="font-['Inter'] uppercase tracking-[0.1em] text-[13px] font-semibold text-black mb-2">
                      {review.title}
                    </h4>
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
