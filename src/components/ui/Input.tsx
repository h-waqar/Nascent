import React, { forwardRef } from "react";
import { FormField } from "./FormField";

export interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  error?: string | null;
  hint?: string;
  containerClassName?: string;
}

export const Input = forwardRef<HTMLInputElement, InputProps>(function Input(
  { label, error, hint, required, id, className = "", containerClassName, ...props },
  ref
) {
  const inputElement = (
    <input
      ref={ref}
      id={id}
      required={required}
      className={`border border-black bg-white px-3 h-[40px] text-[13px] text-black placeholder:text-[#9c9c9c] focus:outline-none focus:ring-0 focus:border-black rounded-none w-full disabled:opacity-50 disabled:bg-neutral-100 ${className}`}
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
        {inputElement}
      </FormField>
    );
  }

  return inputElement;
});
