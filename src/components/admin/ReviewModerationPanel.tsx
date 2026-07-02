"use client";

import { useEffect, useState } from "react";
import type { Review, ReviewStatus } from "@/types/models";
import { AdminPageHeader } from "@/components/admin/AdminPageHeader";
import { ReviewStars } from "@/components/reviews/ReviewStars";

const STATUSES: ReviewStatus[] = ["pending", "approved", "rejected"];

export function ReviewModerationPanel() {
  const [reviews, setReviews] = useState<Review[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [savingId, setSavingId] = useState<string | null>(null);
  const [reasons, setReasons] = useState<Record<string, string>>({});

  useEffect(() => {
    let active = true;

    async function loadReviews() {
      try {
        const res = await fetch("/api/admin/reviews", { cache: "no-store" });
        if (!res.ok) throw new Error("Failed to load reviews");
        const data = await res.json();
        const nextReviews: Review[] = data.reviews ?? [];
        if (!active) return;
        setReviews(nextReviews);
        setReasons(
          Object.fromEntries(
            nextReviews.map((review) => [review.id, review.moderationReason ?? ""])
          )
        );
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
  }, []);

  async function updateReview(id: string, patch: Record<string, unknown>) {
    setSavingId(id);
    setError(null);
    try {
      const res = await fetch(`/api/admin/reviews/${id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(patch),
      });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) throw new Error(data.error ?? "Failed to update review");
      setReviews((current) =>
        current.map((review) => (review.id === id ? data.review : review))
      );
    } catch (updateError) {
      setError(updateError instanceof Error ? updateError.message : "Failed to update review");
    } finally {
      setSavingId(null);
    }
  }

  return (
    <div className="bg-white min-h-screen">
      <AdminPageHeader title="Reviews" />
      <div className="px-8 py-8">
        {error && (
          <div className="border border-black px-4 py-3 mb-6 text-[11px] uppercase tracking-[0.1em] text-black">
            {error}
          </div>
        )}

        <div className="border border-black">
          <div className="bg-black text-white h-[44px] px-4 flex items-center text-[11px] font-semibold uppercase tracking-[0.15em]">
            Customer Review Moderation
          </div>

          {loading ? (
            <div className="px-4 py-3 text-[13px] text-black">Loading…</div>
          ) : reviews.length === 0 ? (
            <div className="px-4 py-3 text-[13px] text-black">No reviews submitted yet.</div>
          ) : (
            <div className="divide-y divide-black">
              {reviews.map((review) => {
                const saving = savingId === review.id;
                return (
                  <article key={review.id} className="grid grid-cols-1 xl:grid-cols-12 gap-6 p-5">
                    <div className="xl:col-span-5">
                      <div className="flex items-center gap-3 mb-3">
                        <ReviewStars rating={review.rating} size="sm" />
                        <span className="font-['Inter'] uppercase tracking-[0.15em] text-[10px] text-[#4c4546]">
                          {review.status}
                        </span>
                      </div>
                      <h2 className="font-['Inter'] uppercase tracking-[0.1em] text-[12px] font-semibold text-black mb-2">
                        {review.productName}
                      </h2>
                      {review.title && (
                        <p className="font-['Inter'] text-[13px] font-semibold text-black mb-2">
                          {review.title}
                        </p>
                      )}
                      <p className="font-['Inter'] text-[13px] leading-[1.6] text-black">
                        “{review.body}”
                      </p>
                      <p className="mt-4 font-['Inter'] uppercase tracking-[0.15em] text-[10px] text-[#4c4546]">
                        {review.authorName} · {new Date(review.createdAt).toLocaleString()}
                      </p>
                    </div>

                    <div className="xl:col-span-3">
                      <label className="block font-['Inter'] uppercase tracking-[0.15em] text-[10px] text-[#4c4546] mb-2">
                        Status
                      </label>
                      <select
                        value={review.status}
                        disabled={saving}
                        onChange={(event) =>
                          updateReview(review.id, { status: event.target.value })
                        }
                        className="w-full border border-black px-3 py-2 text-[13px] text-black bg-white"
                      >
                        {STATUSES.map((status) => (
                          <option key={status} value={status}>
                            {status}
                          </option>
                        ))}
                      </select>

                      <label className="block font-['Inter'] uppercase tracking-[0.15em] text-[10px] text-[#4c4546] mt-4 mb-2">
                        Moderation Reason
                      </label>
                      <textarea
                        value={reasons[review.id] ?? ""}
                        onChange={(event) =>
                          setReasons((current) => ({ ...current, [review.id]: event.target.value }))
                        }
                        onBlur={() =>
                          updateReview(review.id, {
                            moderationReason: reasons[review.id] ?? "",
                          })
                        }
                        disabled={saving}
                        className="w-full min-h-[84px] border border-black px-3 py-2 text-[13px] text-black"
                      />
                    </div>

                    <div className="xl:col-span-4">
                      <label className="flex items-center gap-3 font-['Inter'] uppercase tracking-[0.15em] text-[10px] text-black">
                        <input
                          type="checkbox"
                          checked={review.isFeatured}
                          disabled={saving || review.status !== "approved"}
                          onChange={(event) =>
                            updateReview(review.id, {
                              isFeatured: event.target.checked,
                              featuredRank: event.target.checked ? review.featuredRank ?? 100 : null,
                            })
                          }
                        />
                        Feature on homepage
                      </label>

                      <label className="block font-['Inter'] uppercase tracking-[0.15em] text-[10px] text-[#4c4546] mt-4 mb-2">
                        Homepage Rank
                      </label>
                      <input
                        type="number"
                        min={1}
                        max={999}
                        value={review.featuredRank ?? 100}
                        disabled={saving || review.status !== "approved" || !review.isFeatured}
                        onChange={(event) => {
                          const value = Number(event.target.value);
                          if (Number.isFinite(value)) {
                            setReviews((current) =>
                              current.map((item) =>
                                item.id === review.id ? { ...item, featuredRank: value } : item
                              )
                            );
                          }
                        }}
                        onBlur={(event) => {
                          const value = Number(event.target.value);
                          if (Number.isFinite(value)) {
                            updateReview(review.id, { featuredRank: value });
                          }
                        }}
                        className="w-full border border-black px-3 py-2 text-[13px] text-black bg-white disabled:opacity-40"
                      />

                      <button
                        type="button"
                        disabled={saving}
                        onClick={() => updateReview(review.id, { isFeatured: false })}
                        className="mt-4 border border-black bg-white text-black py-2 px-4 font-['Inter'] uppercase tracking-[0.15em] text-[10px] font-semibold hover:bg-black hover:text-white transition-none disabled:opacity-40"
                      >
                        Unfeature
                      </button>
                    </div>
                  </article>
                );
              })}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
