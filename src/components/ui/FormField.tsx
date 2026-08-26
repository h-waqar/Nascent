import React from "react";

export interface FormFieldProps {
  label?: string;
  error?: string | null;
  hint?: string;
  required?: boolean;
  htmlFor?: string;
  className?: string;
  children: React.ReactNode;
}

export function FormField({
  label,
  error,
  hint,
  required,
  htmlFor,
  className = "",
  children,
}: FormFieldProps) {
  return (
    <div className={`flex flex-col gap-1.5 ${className}`}>
      {label && (
        <label
          htmlFor={htmlFor}
          className="text-[11px] font-semibold uppercase tracking-[0.15em] text-black block"
        >
          {label}
          {required && <span className="text-black ml-1">*</span>}
        </label>
      )}
      {hint && <p className="text-[11px] text-[#4c4546] mb-1">{hint}</p>}
      {children}
      {error && (
        <p className="text-[11px] text-red-600 mt-1 uppercase tracking-wider">{error}</p>
      )}
    </div>
  );
}
