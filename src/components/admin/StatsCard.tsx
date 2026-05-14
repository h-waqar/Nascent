import { cn } from "@/lib/utils";

export interface StatsCardProps {
  label: string;
  value: string;        // already formatted (e.g. "£12,480" or "37")
  subLabel?: string;
  emphasized?: boolean; // true → border-[2px] (Low Stock when count > 0)
}

export function StatsCard({ label, value, subLabel, emphasized }: StatsCardProps) {
  return (
    <div className={cn("bg-white p-6 min-h-[120px] flex flex-col gap-3", emphasized ? "border-[2px] border-black" : "border border-black")}>
      <span className="text-[11px] font-semibold uppercase tracking-[0.15em] text-black">{label}</span>
      <span className="text-[28px] font-light leading-none text-black">{value}</span>
      {subLabel && <span className="text-[11px] text-black mt-auto">{subLabel}</span>}
    </div>
  );
}
