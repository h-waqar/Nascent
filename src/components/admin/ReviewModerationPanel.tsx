"use client";

import { useEffect, useMemo, useState } from "react";
import type { Review } from "@/types/models";
import { AdminPageHeader } from "@/components/admin/AdminPageHeader";
import { ReviewStars } from "@/components/reviews/ReviewStars";
import { ReviewerAvatar } from "@/components/reviews/ReviewerAvatar";

type ReviewFilter = "all" | "published" | "hidden" | "featured" | "unfeatured";
type ReviewSort = "newest" | "oldest" | "rank";
type DateWindow = "all" | "7d" | "30d";

type ReviewCounts = {
  total: number;
  published: number;
  hidden: number;
  featured: number;
  unfeatured: number;
};

const FILTERS: Array<{ key: ReviewFilter; label: string; countKey?: keyof ReviewCounts }> = [
  { key: "all", label: "All", countKey: "total" },
  { key: "published", label: "Published", countKey: "published" },
  { key: "featured", label: "Featured", countKey: "featured" },
  { key: "unfeatured", label: "Unfeatured", countKey: "unfeatured" },
  { key: "hidden", label: "Hidden", countKey: "hidden" },
];

const SORTS: Array<{ key: ReviewSort; label: string }> = [
  { key: "newest", label: "Newest" },
  { key: "oldest", label: "Oldest" },
  { key: "rank", label: "Homepage Rank" },
];

const DATE_WINDOWS: Array<{ key: DateWindow; label: string }> = [
  { key: "all", label: "All Time" },
  { key: "7d", label: "Last 7 Days" },
  { key: "30d", label: "Last 30 Days" },
];

function isHidden(review: Review): boolean {
  return review.status === "rejected";
}

function getDateFrom(window: DateWindow): string | null {
  if (window === "all") return null;
  const date = new Date();
  date.setDate(date.getDate() - (window === "7d" ? 7 : 30));
  return date.toISOString();
}

function buildReviewUrl(filter: ReviewFilter, sort: ReviewSort, dateWindow: DateWindow): string {
  const params = new URLSearchParams({ limit: "100", sort });
  if (filter === "published") params.set("status", "published");
  if (filter === "hidden") params.set("status", "hidden");
  if (filter === "featured") params.set("featured", "true");
  if (filter === "unfeatured") params.set("featured", "false");
  const from = getDateFrom(dateWindow);
  if (from) params.set("from", from);
  return `/api/admin/reviews?${params.toString()}`;
}

export function ReviewModerationPanel() {
  const [reviews, setReviews] = useState<Review[]>([]);
  const [counts, setCounts] = useState<ReviewCounts>({
    total: 0,
    published: 0,
    hidden: 0,
    featured: 0,
    unfeatured: 0,
  });
  const [filter, setFilter] = useState<ReviewFilter>("all");
  const [sort, setSort] = useState<ReviewSort>("newest");
  const [dateWindow, setDateWindow] = useState<DateWindow>("all");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [savingId, setSavingId] = useState<string | null>(null);

  const reviewUrl = useMemo(
    () => buildReviewUrl(filter, sort, dateWindow),
    [filter, sort, dateWindow]
  );

  useEffect(() => {
    let active = true;

    async function loadReviews() {
      try {
        setLoading(true);
        setError(null);
        const res = await fetch(reviewUrl, { cache: "no-store" });
        if (!res.ok) throw new Error("Failed to load reviews");
        const data = await res.json();
        if (!active) return;
        setReviews(data.reviews ?? []);
        setCounts((current) => ({ ...current, ...(data.counts ?? {}) }));
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
  }, [reviewUrl]);

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
      <div className="px-8 py-8 space-y-6">
        {error && (
          <div className="border border-black px-4 py-3 text-[11px] uppercase tracking-[0.1em] text-black">
            {error}
          </div>
        )}

        <section className="border border-black">
          <div className="bg-black text-white px-4 py-3 flex flex-col xl:flex-row xl:items-center xl:justify-between gap-4">
            <div>
              <p className="text-[11px] font-semibold uppercase tracking-[0.15em]">
                Customer Review Curation
              </p>
              <p className="mt-1 text-[11px] uppercase tracking-[0.1em] text-white/70">
                Product reviews publish immediately. Use this panel to feature homepage reviews.
              </p>
            </div>
            <div className="grid grid-cols-2 md:grid-cols-5 gap-2 text-black">
              {FILTERS.map((item) => (
                <button
                  key={item.key}
                  type="button"
                  onClick={() => setFilter(item.key)}
                  className={`border border-white px-3 py-2 text-[10px] font-semibold uppercase tracking-[0.12em] transition-none ${
                    filter === item.key ? "bg-white text-black" : "bg-black text-white"
                  }`}
                >
                  {item.label}
                  {item.countKey ? ` ${counts[item.countKey]}` : ""}
                </button>
              ))}
            </div>
          </div>

          <div className="px-4 py-4 border-b border-black grid grid-cols-1 xl:grid-cols-2 gap-4">
            <div className="flex flex-wrap gap-2">
              {SORTS.map((item) => (
                <button
                  key={item.key}
                  type="button"
                  onClick={() => setSort(item.key)}
                  className={`border border-black px-4 py-2 text-[10px] font-semibold uppercase tracking-[0.12em] transition-none ${
                    sort === item.key ? "bg-black text-white" : "bg-white text-black"
                  }`}
                >
                  {item.label}
                </button>
              ))}
            </div>
            <div className="flex flex-wrap xl:justify-end gap-2">
              {DATE_WINDOWS.map((item) => (
                <button
                  key={item.key}
                  type="button"
                  onClick={() => setDateWindow(item.key)}
                  className={`border border-black px-4 py-2 text-[10px] font-semibold uppercase tracking-[0.12em] transition-none ${
                    dateWindow === item.key ? "bg-black text-white" : "bg-white text-black"
                  }`}
                >
                  {item.label}
                </button>
              ))}
            </div>
          </div>

          {loading ? (
            <div className="px-4 py-3 text-[13px] text-black">Loading…</div>
          ) : reviews.length === 0 ? (
            <div className="px-4 py-3 text-[13px] text-black">No reviews match this view.</div>
          ) : (
            <div className="divide-y divide-black">
              {reviews.map((review) => {
                const saving = savingId === review.id;
                const hidden = isHidden(review);
                return (
                  <article key={review.id} className="grid grid-cols-1 xl:grid-cols-12 gap-6 p-5">
                    <div className="xl:col-span-6">
                      <div className="flex items-start gap-4 mb-4">
                        <ReviewerAvatar name={review.authorName} imageUrl={review.authorImageUrl} />
                        <div className="min-w-0">
                          <div className="flex flex-wrap items-center gap-3 mb-2">
                            <ReviewStars rating={review.rating} size="sm" />
                            <span className="font-['Inter'] uppercase tracking-[0.15em] text-[10px] text-[#4c4546]">
                              {hidden ? "Hidden" : "Published"}
                            </span>
                            {review.isFeatured && (
                              <span className="border border-black px-2 py-1 font-['Inter'] uppercase tracking-[0.15em] text-[9px] text-black">
                                Homepage #{review.featuredRank ?? 100}
                              </span>
                            )}
                          </div>
                          <p className="font-['Inter'] uppercase tracking-[0.15em] text-[10px] text-[#4c4546]">
                            {review.authorName} · {new Date(review.createdAt).toLocaleString()}
                          </p>
                        </div>
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
                    </div>

                    <div className="xl:col-span-3">
                      <p className="font-['Inter'] uppercase tracking-[0.15em] text-[10px] text-[#4c4546] mb-3">
                        Visibility
                      </p>
                      <div className="grid grid-cols-2 gap-2">
                        <button
                          type="button"
                          disabled={saving || !hidden}
                          onClick={() => updateReview(review.id, { status: "published" })}
                          className={`border border-black px-4 py-3 text-[10px] font-semibold uppercase tracking-[0.12em] transition-none disabled:opacity-40 ${
                            !hidden ? "bg-black text-white" : "bg-white text-black hover:bg-black hover:text-white"
                          }`}
                        >
                          Published
                        </button>
                        <button
                          type="button"
                          disabled={saving || hidden}
                          onClick={() => updateReview(review.id, { status: "hidden" })}
                          className={`border border-black px-4 py-3 text-[10px] font-semibold uppercase tracking-[0.12em] transition-none disabled:opacity-40 ${
                            hidden ? "bg-black text-white" : "bg-white text-black hover:bg-black hover:text-white"
                          }`}
                        >
                          Hidden
                        </button>
                      </div>
                    </div>

                    <div className="xl:col-span-3">
                      <p className="font-['Inter'] uppercase tracking-[0.15em] text-[10px] text-[#4c4546] mb-3">
                        Homepage
                      </p>
                      <div className="grid grid-cols-2 gap-2">
                        <button
                          type="button"
                          disabled={saving || hidden || review.isFeatured}
                          onClick={() =>
                            updateReview(review.id, {
                              isFeatured: true,
                              featuredRank: review.featuredRank ?? 100,
                            })
                          }
                          className={`border border-black px-4 py-3 text-[10px] font-semibold uppercase tracking-[0.12em] transition-none disabled:opacity-40 ${
                            review.isFeatured ? "bg-black text-white" : "bg-white text-black hover:bg-black hover:text-white"
                          }`}
                        >
                          Featured
                        </button>
                        <button
                          type="button"
                          disabled={saving || !review.isFeatured}
                          onClick={() => updateReview(review.id, { isFeatured: false })}
                          className={`border border-black px-4 py-3 text-[10px] font-semibold uppercase tracking-[0.12em] transition-none disabled:opacity-40 ${
                            !review.isFeatured ? "bg-black text-white" : "bg-white text-black hover:bg-black hover:text-white"
                          }`}
                        >
                          Off
                        </button>
                      </div>

                      <label className="block font-['Inter'] uppercase tracking-[0.15em] text-[10px] text-[#4c4546] mt-4 mb-2">
                        Rank
                      </label>
                      <input
                        type="number"
                        min={1}
                        max={999}
                        value={review.featuredRank ?? 100}
                        disabled={saving || hidden || !review.isFeatured}
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
                    </div>
                  </article>
                );
              })}
            </div>
          )}
        </section>
      </div>
    </div>
  );
}
