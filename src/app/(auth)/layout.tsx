import type { ReactNode } from "react";

export default function AuthLayout({ children }: { children: ReactNode }) {
  return (
    <main
      className="min-h-screen w-full flex items-center justify-center bg-white px-4"
      style={{ paddingTop: "var(--spacing-4xl)", paddingBottom: "var(--spacing-4xl)" }}
    >
      <div className="w-full max-w-[400px]">{children}</div>
    </main>
  );
}
