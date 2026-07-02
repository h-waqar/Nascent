"use client";

import { useUser } from "@clerk/nextjs";
import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import type { PublicReview } from "@/types/models";
import { ReviewStars } from "@/components/reviews/ReviewStars";
import { ReviewerAvatar } from "@/components/reviews/ReviewerAvatar";

const DEMO_REVIEWS: PublicReview[] = [
  {
    id: "demo-review-noir-01",
    productId: "demo-product-noir",
    productSlug: "phantom-elixir",
    productName: "Phantom Elixir · similar to Sauvage Elixir",
    authorName: "Hamza Waqar",
    rating: 5,
    title: "Why originals cost too much?",
    body: "Lord knows how much they gonna drain our pockets.",
    isFeatured: true,
    featuredRank: 1,
    createdAt: "2026-07-01T12:00:00.000Z",
    updatedAt: "2026-07-01T12:00:00.000Z",
  },
  {
    id: "demo-review-cyphr-02",
    productId: "demo-product-cyphr",
    productSlug: "cyphr",
    productName: "Cyphr · similar to TK4",
    authorName: "Ayesha Malik",
    authorImageUrl: "https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=160&h=160&fit=crop&crop=faces",
    rating: 5,
    title: "Sharp, clean, expensive.",
    body: "The drydown feels polished without trying too hard. It became my office scent after one wear.",
    isFeatured: true,
    featuredRank: 2,
    createdAt: "2026-06-29T12:00:00.000Z",
    updatedAt: "2026-06-29T12:00:00.000Z",
  },
  {
    id: "demo-review-velour-03",
    productId: "demo-product-velour",
    productSlug: "velour-oud",
    productName: "Velour Oud",
    authorName: "Danish Raza",
    authorImageUrl: "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=160&h=160&fit=crop&crop=faces",
    rating: 5,
    title: "Projection is serious.",
    body: "Two sprays lasted the whole evening and still sat close to the jacket the next morning.",
    isFeatured: true,
    featuredRank: 3,
    createdAt: "2026-06-28T12:00:00.000Z",
    updatedAt: "2026-06-28T12:00:00.000Z",
  },
  {
    id: "demo-review-nocturne-04",
    productId: "demo-product-nocturne",
    productSlug: "nocturne-amber",
    productName: "Nocturne Amber",
    authorName: "Zara Khan",
    authorImageUrl: "https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=160&h=160&fit=crop&crop=faces",
    rating: 4,
    title: "Soft but noticeable.",
    body: "Warm, smooth, and not loud in a cheap way. It gets compliments when someone is close.",
    isFeatured: true,
    featuredRank: 4,
    createdAt: "2026-06-27T12:00:00.000Z",
    updatedAt: "2026-06-27T12:00:00.000Z",
  },
  {
    id: "demo-review-iris-05",
    productId: "demo-product-iris",
    productSlug: "iris-smoke",
    productName: "Iris Smoke",
    authorName: "Omar Siddiqui",
    authorImageUrl: "https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?w=160&h=160&fit=crop&crop=faces",
    rating: 5,
    title: "Blind buy worked.",
    body: "Powdery at first, then darker and smoother. Smells like something twice the price.",
    isFeatured: true,
    featuredRank: 5,
    createdAt: "2026-06-26T12:00:00.000Z",
    updatedAt: "2026-06-26T12:00:00.000Z",
  },
];

const BENTO_CARD_CLASSES = [
  "md:col-span-7 md:row-span-2 min-h-[420px]",
  "md:col-span-5 min-h-[250px]",
  "md:col-span-3 min-h-[250px]",
  "md:col-span-4 min-h-[250px]",
  "md:col-span-5 min-h-[250px]",
] as const;

function getViewerName(user: ReturnType<typeof useUser>["user"]): string | null {
  if (!user) return null;
  const fullName = user.fullName?.trim();
  if (fullName) return fullName;
  const names = [user.firstName, user.lastName].filter(Boolean).join(" ").trim();
  return names || null;
}

function sameName(a: string, b: string | null): boolean {
  return Boolean(b && a.trim().toLowerCase() === b.trim().toLowerCase());
}

function withViewerAvatar(
  review: PublicReview,
  viewerName: string | null,
  viewerImageUrl?: string
): PublicReview {
  if (review.authorImageUrl || !viewerImageUrl || !sameName(review.authorName, viewerName)) {
    return review;
  }
  return { ...review, authorImageUrl: viewerImageUrl };
}

function getDisplayReviews(
  reviews: PublicReview[],
  viewerName: string | null,
  viewerImageUrl?: string
): PublicReview[] {
  const hydrated = reviews.map((review) => withViewerAvatar(review, viewerName, viewerImageUrl));
  if (process.env.NODE_ENV === "production") return hydrated;

  const seen = new Set(hydrated.map((review) => review.id));
  const seenReviewKeys = new Set(
    hydrated.map((review) => `${review.authorName}:${review.productSlug}`.toLowerCase())
  );
  const demos = DEMO_REVIEWS.map((review) => withViewerAvatar(review, viewerName, viewerImageUrl))
    .filter((review) => {
      const reviewKey = `${review.authorName}:${review.productSlug}`.toLowerCase();
      return !seen.has(review.id) && !seenReviewKeys.has(reviewKey);
    });

  return [...hydrated, ...demos].slice(0, BENTO_CARD_CLASSES.length);
}

function ReviewCard({
  review,
  className = "",
  index = 0,
}: {
  review: PublicReview;
  className?: string;
  index?: number;
}) {
  const isHero = index === 0;
  return (
    <article
      className={`group relative overflow-hidden border border-black bg-white p-6 md:p-7 flex flex-col justify-between ${className}`}
    >
      <span
        aria-hidden="true"
        className="absolute -right-3 -top-8 font-['Inter'] text-[120px] leading-none tracking-[-0.08em] text-black/[0.04] transition-none group-hover:text-black/[0.07]"
      >
        ”
      </span>

      <div className="relative">
        <div className="flex items-start justify-between gap-6 mb-8">
          <ReviewStars rating={review.rating} size="sm" />
          <span className="max-w-[220px] text-right font-['Inter'] uppercase tracking-[0.18em] text-[10px] leading-[1.4] text-[#4c4546]">
            {review.productName}
          </span>
        </div>
        {review.title && (
          <h3 className="font-['Inter'] uppercase tracking-[0.13em] text-[12px] font-semibold text-black mb-5">
            {review.title}
          </h3>
        )}
        <p className={`${isHero ? "text-[27px] md:text-[34px]" : "text-[17px]"} leading-[1.35] text-black max-w-[820px]`}>
          “{review.body}”
        </p>
      </div>

      <div className="relative mt-10 flex items-center justify-between gap-4">
        <div className="flex items-center gap-3 min-w-0">
          <ReviewerAvatar
            name={review.authorName}
            imageUrl={review.authorImageUrl}
            size={isHero ? "md" : "sm"}
          />
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
  const { user } = useUser();
  const [reviews, setReviews] = useState<PublicReview[]>([]);
  const [loading, setLoading] = useState(true);
  const viewerName = getViewerName(user);
  const displayReviews = useMemo(
    () => getDisplayReviews(reviews, viewerName, user?.imageUrl),
    [reviews, user?.imageUrl, viewerName]
  );

  useEffect(() => {
    let active = true;

    async function loadReviews() {
      setLoading(true);
      try {
        const res = await fetch("/api/reviews/homepage?limit=6", { cache: "no-store" });
        if (!res.ok) throw new Error("Failed to load reviews");
        const data = await res.json();
        if (active) setReviews(data.reviews ?? []);
      } catch {
        if (active) setReviews([]);
      } finally {
        if (active) setLoading(false);
      }
    }

    loadReviews();
    return () => {
      active = false;
    };
  }, []);

  const showEmpty = !loading && displayReviews.length === 0;

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

        {!loading && displayReviews.length > 0 && (
          <>
            <div className="hidden md:grid md:grid-cols-12 md:auto-rows-[minmax(220px,auto)] gap-6">
              {displayReviews.map((review, index) => (
                <ReviewCard
                  key={review.id}
                  review={review}
                  index={index}
                  className={BENTO_CARD_CLASSES[index] ?? "md:col-span-4 min-h-[250px]"}
                />
              ))}
            </div>

            <div className="md:hidden flex gap-4 overflow-x-auto snap-x snap-mandatory pb-4">
              {displayReviews.map((review, index) => (
                <div key={review.id} className="min-w-[85%] snap-start">
                  <ReviewCard review={review} index={index} />
                </div>
              ))}
            </div>
          </>
        )}
      </div>
    </section>
  );
}
