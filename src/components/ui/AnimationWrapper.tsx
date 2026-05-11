"use client";

import { usePathname } from "next/navigation";

export function AnimationWrapper({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  // key={pathname} forces React to remount this div on every navigation,
  // re-triggering the pageFade CSS animation. Intentional. `contents` makes
  // this div transparent in the layout box tree so it does NOT become a new
  // flex child and disrupt the `flex flex-col` body stack (Nav / main / Footer).
  return (
    <div key={pathname} className="animate-page-fade contents">
      {children}
    </div>
  );
}
