import React from "react";

export interface LoadingStateProps {
  message?: string;
  minHeight?: string;
  className?: string;
}

export function LoadingState({
  message = "Loading…",
  minHeight = "min-h-[60vh]",
  className = "",
}: LoadingStateProps) {
  return (
    <div
      className={`w-full max-w-[1440px] mx-auto flex items-center justify-center bg-white ${minHeight} ${className}`}
    >
      <p className="font-['Inter'] uppercase tracking-[0.15em] text-[11px] text-[#4c4546]">
        {message}
      </p>
    </div>
  );
}
