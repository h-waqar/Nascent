"use client";

import { useState, useEffect, useRef } from "react";

export interface ProductImageUploadProps {
  /** Existing image URL (edit mode) — shown in the preview when no new file is selected */
  existingUrl?: string | null;
  /** Fires whenever the admin picks a new file (or clears the picker) */
  onFileChange: (file: File | null) => void;
}

const MAX_BYTES = 5 * 1024 * 1024; // 5 MB per D-07
const ACCEPTED = "image/jpeg,image/png";

export function ProductImageUpload({ existingUrl, onFileChange }: ProductImageUploadProps) {
  const [previewUrl, setPreviewUrl] = useState<string | null>(existingUrl ?? null);
  const [error, setError] = useState<string | null>(null);
  // Track the current object URL so we can revoke it when it changes or on unmount.
  const objectUrlRef = useRef<string | null>(null);

  // Revoke the object URL when the component unmounts to avoid memory leaks.
  useEffect(() => {
    return () => {
      if (objectUrlRef.current) {
        URL.revokeObjectURL(objectUrlRef.current);
      }
    };
  }, []);

  function handleChange(e: React.ChangeEvent<HTMLInputElement>) {
    setError(null);
    const file = e.target.files?.[0] ?? null;
    if (!file) {
      // Revoke previous object URL if there was one, then revert to existing URL.
      if (objectUrlRef.current) {
        URL.revokeObjectURL(objectUrlRef.current);
        objectUrlRef.current = null;
      }
      setPreviewUrl(existingUrl ?? null);
      onFileChange(null);
      return;
    }
    if (!["image/jpeg", "image/png"].includes(file.type)) {
      setError("Use a JPEG or PNG file.");
      onFileChange(null);
      return;
    }
    if (file.size > MAX_BYTES) {
      setError("File too large (max 5 MB).");
      onFileChange(null);
      return;
    }
    // Revoke the previous object URL before creating a new one.
    if (objectUrlRef.current) {
      URL.revokeObjectURL(objectUrlRef.current);
    }
    const objectUrl = URL.createObjectURL(file);
    objectUrlRef.current = objectUrl;
    setPreviewUrl(objectUrl);
    onFileChange(file);
  }

  return (
    <div className="space-y-4">
      <input
        type="file"
        accept={ACCEPTED}
        onChange={handleChange}
        className="block text-[13px] text-black file:mr-4 file:border file:border-black file:bg-white file:text-black file:py-2 file:px-4 file:text-[11px] file:font-semibold file:uppercase file:tracking-[0.1em] file:hover:bg-black file:hover:text-white file:transition-none file:cursor-pointer cursor-pointer"
      />
      {error && (
        <p className="text-[11px] uppercase tracking-[0.1em] text-black border border-black px-3 py-2">
          {error}
        </p>
      )}
      {previewUrl && (
        <div className="w-[160px] h-[160px] border border-black overflow-hidden bg-white">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src={previewUrl} alt="Preview" className="w-full h-full object-cover" />
        </div>
      )}
    </div>
  );
}
