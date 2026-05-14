"use client";

import { cn } from "@/lib/utils";

export function AdminToggle({ checked, onChange, label }: { checked: boolean; onChange: (v: boolean) => void; label: string }) {
  return (
    <button
      type="button"
      onClick={() => onChange(!checked)}
      className="inline-flex items-center gap-3 text-[11px] font-semibold uppercase tracking-[0.1em] text-black transition-none"
      aria-pressed={checked}
    >
      <span className={cn("w-10 h-6 border border-black flex items-center transition-none", checked ? "bg-black justify-end" : "bg-white justify-start")}>
        <span className={cn("w-4 h-4 m-0.5", checked ? "bg-white" : "bg-white border border-black")} />
      </span>
      {label}
    </button>
  );
}
