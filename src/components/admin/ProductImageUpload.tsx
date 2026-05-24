"use client";

import { useEffect, useRef, useState } from "react";

export interface ProductImageUploadProps {
  existingUrls: string[];
  onExistingUrlsChange: (urls: string[]) => void;
  onNewFilesChange: (files: File[]) => void;
}

const MAX_BYTES = 5 * 1024 * 1024; // 5 MB
const ACCEPTED = "image/jpeg,image/png";

interface Preview {
  file: File;
  objectUrl: string;
}

export function ProductImageUpload({
  existingUrls,
  onExistingUrlsChange,
  onNewFilesChange,
}: ProductImageUploadProps) {
  const [previews, setPreviews] = useState<Preview[]>([]);
  const [errors, setErrors] = useState<string[]>([]);
  const objectUrlsRef = useRef<string[]>([]);

  useEffect(() => {
    return () => {
      objectUrlsRef.current.forEach((u) => URL.revokeObjectURL(u));
    };
  }, []);

  function handleChange(e: React.ChangeEvent<HTMLInputElement>) {
    setErrors([]);
    const files = Array.from(e.target.files ?? []);
    if (!files.length) return;

    const newErrors: string[] = [];
    const valid: File[] = [];

    for (const file of files) {
      if (!["image/jpeg", "image/png"].includes(file.type)) {
        newErrors.push(`${file.name}: use JPEG or PNG.`);
        continue;
      }
      if (file.size > MAX_BYTES) {
        newErrors.push(`${file.name}: too large (max 5 MB).`);
        continue;
      }
      valid.push(file);
    }

    if (newErrors.length) setErrors(newErrors);
    if (!valid.length) return;

    const newPreviews: Preview[] = valid.map((file) => {
      const objectUrl = URL.createObjectURL(file);
      objectUrlsRef.current.push(objectUrl);
      return { file, objectUrl };
    });

    const updated = [...previews, ...newPreviews];
    setPreviews(updated);
    onNewFilesChange(updated.map((p) => p.file));

    e.target.value = "";
  }

  function removeExisting(idx: number) {
    onExistingUrlsChange(existingUrls.filter((_, i) => i !== idx));
  }

  function removeNew(idx: number) {
    URL.revokeObjectURL(previews[idx].objectUrl);
    objectUrlsRef.current = objectUrlsRef.current.filter((u) => u !== previews[idx].objectUrl);
    const updated = previews.filter((_, i) => i !== idx);
    setPreviews(updated);
    onNewFilesChange(updated.map((p) => p.file));
  }

  return (
    <div className="space-y-4">
      <input
        type="file"
        accept={ACCEPTED}
        multiple
        onChange={handleChange}
        className="block text-[13px] text-black file:mr-4 file:border file:border-black file:bg-white file:text-black file:py-2 file:px-4 file:text-[11px] file:font-semibold file:uppercase file:tracking-[0.1em] file:hover:bg-black file:hover:text-white file:transition-none file:cursor-pointer cursor-pointer"
      />
      {errors.length > 0 && (
        <div className="space-y-1">
          {errors.map((err, i) => (
            <p key={i} className="text-[11px] uppercase tracking-[0.1em] text-black border border-black px-3 py-2">
              {err}
            </p>
          ))}
        </div>
      )}

      {(existingUrls.length > 0 || previews.length > 0) && (
        <div className="flex flex-wrap gap-3">
          {existingUrls.map((url, idx) => (
            <div key={url} className="relative w-[160px] h-[160px] border border-black overflow-hidden bg-white group">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src={url} alt={`Image ${idx + 1}`} className="w-full h-full object-cover" />
              {idx === 0 && (
                <span className="absolute bottom-0 left-0 right-0 bg-black text-white text-[9px] uppercase tracking-[0.1em] text-center py-0.5">
                  Main
                </span>
              )}
              <button
                type="button"
                onClick={() => removeExisting(idx)}
                className="absolute top-1 right-1 w-5 h-5 bg-black text-white text-[10px] font-bold flex items-center justify-center opacity-0 group-hover:opacity-100 transition-none"
                aria-label="Remove image"
              >
                ×
              </button>
            </div>
          ))}
          {previews.map((p, idx) => (
            <div key={p.objectUrl} className="relative w-[160px] h-[160px] border border-black border-dashed overflow-hidden bg-white group">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src={p.objectUrl} alt={`New image ${idx + 1}`} className="w-full h-full object-cover opacity-80" />
              <span className="absolute bottom-0 left-0 right-0 bg-black text-white text-[9px] uppercase tracking-[0.1em] text-center py-0.5">
                New
              </span>
              <button
                type="button"
                onClick={() => removeNew(idx)}
                className="absolute top-1 right-1 w-5 h-5 bg-black text-white text-[10px] font-bold flex items-center justify-center opacity-0 group-hover:opacity-100 transition-none"
                aria-label="Remove image"
              >
                ×
              </button>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
