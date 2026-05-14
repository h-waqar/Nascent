"use client";

export interface ConfirmationModalProps {
  open: boolean;
  title: string;          // e.g. 'Delete "Phantom Elixir"? This cannot be undone.'
  confirmLabel: string;   // e.g. "DELETE PRODUCT"
  cancelLabel: string;    // e.g. "KEEP PRODUCT"
  onConfirm: () => void;
  onCancel: () => void;
  busy?: boolean;
}

export function ConfirmationModal({ open, title, confirmLabel, cancelLabel, onConfirm, onCancel, busy }: ConfirmationModalProps) {
  if (!open) return null;
  return (
    <div className="fixed inset-0 bg-black/50 z-[200] flex items-center justify-center p-4" onClick={onCancel}>
      <div className="bg-white border border-black p-8 max-w-[400px] w-full" onClick={(e) => e.stopPropagation()}>
        <p className="text-[13px] text-black leading-[1.6] mb-8">{title}</p>
        <div className="flex gap-4">
          <button type="button" onClick={onConfirm} disabled={busy} className="border border-black bg-white text-black py-3 px-6 text-[11px] font-semibold uppercase tracking-[0.15em] hover:bg-black hover:text-white transition-none disabled:opacity-50 disabled:cursor-not-allowed">
            {busy ? "Working…" : confirmLabel}
          </button>
          <button type="button" onClick={onCancel} disabled={busy} className="border border-black bg-white text-black py-3 px-6 text-[11px] font-semibold uppercase tracking-[0.15em] hover:bg-black hover:text-white transition-none disabled:opacity-50 disabled:cursor-not-allowed">
            {cancelLabel}
          </button>
        </div>
      </div>
    </div>
  );
}
