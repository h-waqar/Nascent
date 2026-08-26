import React from "react";

export interface OlfactoryProfileProps {
  topNote?: string | null;
  heartNote?: string | null;
  baseNote?: string | null;
  volume?: string | null;
  variant?: "table" | "compact" | "specs";
  className?: string;
}

export function OlfactoryProfile({
  topNote,
  heartNote,
  baseNote,
  volume,
  variant = "table",
  className = "",
}: OlfactoryProfileProps) {
  const notes = [
    { label: "Top", note: topNote },
    { label: "Heart", note: heartNote },
    { label: "Base", note: baseNote },
  ].filter((item) => Boolean(item.note));

  if (notes.length === 0 && !volume) return null;

  if (variant === "compact") {
    return (
      <div className={`space-y-3 font-['Inter'] text-[11px] text-black ${className}`}>
        {notes.map(({ label, note }) => (
          <div key={label} className="flex justify-between">
            <span className="uppercase text-[#4c4546] font-semibold text-[9px] tracking-wider">
              {label} Note
            </span>
            <span className="font-light uppercase">{note}</span>
          </div>
        ))}
      </div>
    );
  }

  if (variant === "specs") {
    return (
      <div className={`grid grid-cols-1 md:grid-cols-2 gap-12 lg:gap-24 ${className}`}>
        <div className="space-y-12">
          {topNote && (
            <div>
              <p className="font-['Inter'] uppercase tracking-[0.15em] text-[11px] text-[#4c4546] mb-2">
                Top Note
              </p>
              <p className="text-[18px] leading-[1.6] text-black uppercase">{topNote}</p>
            </div>
          )}
          {heartNote && (
            <div>
              <p className="font-['Inter'] uppercase tracking-[0.15em] text-[11px] text-[#4c4546] mb-2">
                Heart Note
              </p>
              <p className="text-[18px] leading-[1.6] text-black uppercase">{heartNote}</p>
            </div>
          )}
        </div>
        <div className="space-y-12">
          {baseNote && (
            <div>
              <p className="font-['Inter'] uppercase tracking-[0.15em] text-[11px] text-[#4c4546] mb-2">
                Base Note
              </p>
              <p className="text-[18px] leading-[1.6] text-black uppercase">{baseNote}</p>
            </div>
          )}
          <div>
            <p className="font-['Inter'] uppercase tracking-[0.15em] text-[11px] text-[#4c4546] mb-2">
              Format
            </p>
            <p className="text-[18px] leading-[1.6] text-black uppercase">
              {volume ?? "50ml Extrait de Parfum"}
            </p>
          </div>
        </div>
      </div>
    );
  }

  // Default "table" variant
  return (
    <div className={`flex flex-col gap-4 ${className}`}>
      {notes.map(({ label, note }) => (
        <div
          key={label}
          className="flex justify-between items-center border-b border-black pb-2"
        >
          <span className="font-['Inter'] uppercase tracking-[0.15em] text-[11px] font-semibold text-black">
            {label}
          </span>
          <span className="font-['Inter'] text-[14px] text-black">{note}</span>
        </div>
      ))}
    </div>
  );
}
