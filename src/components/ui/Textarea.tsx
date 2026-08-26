import React, { forwardRef } from "react";
import { FormField } from "./FormField";

export interface TextareaProps extends React.TextareaHTMLAttributes<HTMLTextAreaElement> {
  label?: string;
  error?: string | null;
  hint?: string;
  containerClassName?: string;
}

export const Textarea = forwardRef<HTMLTextAreaElement, TextareaProps>(function Textarea(
  { label, error, hint, required, id, className = "", containerClassName, rows = 4, ...props },
  ref
) {
  const textareaElement = (
    <textarea
      ref={ref}
      id={id}
      rows={rows}
      required={required}
      className={`border border-black bg-white p-3 text-[13px] text-black placeholder:text-[#9c9c9c] focus:outline-none focus:ring-0 focus:border-black rounded-none w-full disabled:opacity-50 disabled:bg-neutral-100 ${className}`}
      {...props}
    />
  );

  if (label || error || hint) {
    return (
      <FormField
        label={label}
        error={error}
        hint={hint}
        required={required}
        htmlFor={id}
        className={containerClassName}
      >
        {textareaElement}
      </FormField>
    );
  }

  return textareaElement;
});
