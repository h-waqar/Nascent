"use client";

export function PrintButton() {
  return (
    <button
      onClick={() => window.print()}
      className="no-print border border-black bg-white text-black px-8 py-3 text-[11px] uppercase tracking-[0.15em] font-semibold hover:bg-black hover:text-white transition-none flex items-center gap-2 self-start"
    >
      <span className="material-symbols-outlined text-[18px]">print</span>
      Print Invoice
    </button>
  );
}
