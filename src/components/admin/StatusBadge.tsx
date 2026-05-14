import { cn } from "@/lib/utils";
import type { OrderStatus } from "@/types/models";

export function StatusBadge({ status, active }: { status: OrderStatus; active?: boolean }) {
  return (
    <span className={cn("inline-block border border-black px-2 py-0.5 text-[11px] font-semibold uppercase tracking-[0.1em]", active ? "bg-black text-white" : "bg-white text-black")}>
      {status}
    </span>
  );
}
