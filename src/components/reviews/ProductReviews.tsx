"use client";

import { FormEvent, useEffect, useState } from "react";
import { SignInButton, useUser } from "@clerk/nextjs";
import type { PublicReview } from "@/types/models";
import { ReviewStars } from "@/components/reviews/ReviewStars";
import { ReviewerAvatar } from "@/components/reviews/ReviewerAvatar";

type ProductReviewsProps = {
  productSlug: string;
};

export function ProductReviews({ productSlug }: ProductReviewsProps) {
  const { isLoaded, isSignedIn } = useUser();
  const [reviews, setReviews] = useState<PublicReview[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [rating, setRating] = useState(5);
  const [title, setTitle] = useState("");
  const [body, setBody] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [notice, setNotice] = useState<string | null>(null);

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
    } catch (submitError) {
      setError(submitError instanceof Error ? submitError.message : "Failed to save review");
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <section className="py-24 px-12 lg:px-24 bg-white border-t border-black">
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-12">
        <div className="lg:col-span-4">
          <p className="font-['Inter'] uppercase tracking-[0.2em] text-[11px] text-[#4c4546] mb-4">
            Customer Notes
          </p>
          <h2 className="text-[32px] leading-[1.1] tracking-[-0.02em] font-normal text-black uppercase">
            Reviews
          </h2>
        </div>

        <div className="lg:col-span-8 grid grid-cols-1 gap-8">
          <div className="border border-black">
            <div className="bg-black text-white px-5 py-3 font-['Inter'] uppercase tracking-[0.15em] text-[11px] font-semibold">
              Write a review
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
            ) : reviews.length === 0 ? (
              <div className="border-r border-b border-black p-5 font-['Inter'] text-[13px] text-black">
                No reviews yet.
              </div>
            ) : (
              reviews.map((review) => (
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
