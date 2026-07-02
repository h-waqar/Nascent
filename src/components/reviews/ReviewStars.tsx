type ReviewStarsProps = {
  rating: number;
  onChange?: (rating: number) => void;
  size?: "sm" | "md";
};

export function ReviewStars({ rating, onChange, size = "md" }: ReviewStarsProps) {
  const interactive = typeof onChange === "function";
  const starClass = size === "sm" ? "text-[13px]" : "text-[18px]";

  return (
    <div
      className="flex items-center gap-1"
      aria-label={`${rating} out of 5 stars`}
      role={interactive ? "radiogroup" : "img"}
    >
      {[1, 2, 3, 4, 5].map((value) => {
        const filled = value <= rating;
        if (!interactive) {
          return (
            <span key={value} aria-hidden="true" className={`${starClass} leading-none`}>
              {filled ? "★" : "☆"}
            </span>
          );
        }

        return (
          <button
            key={value}
            type="button"
            role="radio"
            aria-checked={value === rating}
            aria-label={`${value} star${value === 1 ? "" : "s"}`}
            onClick={() => onChange(value)}
            className={`${starClass} leading-none text-black hover:opacity-60 transition-none`}
          >
            {filled ? "★" : "☆"}
          </button>
        );
      })}
    </div>
  );
}
