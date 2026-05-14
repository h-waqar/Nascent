import type { ReactNode } from "react";

export function AdminPageHeader({ title, action }: { title: string; action?: ReactNode }) {
  return (
    <div className="h-[56px] px-8 flex items-center justify-between border-b border-black">
      <h1 className="text-[20px] font-semibold text-black">{title}</h1>
      {action ? <div>{action}</div> : null}
    </div>
  );
}
