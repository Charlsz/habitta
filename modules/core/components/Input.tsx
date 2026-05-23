import * as React from "react";
import { cn } from "@/lib/utils";

export interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  error?: string;
  hint?: string;
}

export const Input = React.forwardRef<HTMLInputElement, InputProps>(
  ({ className, label, error, hint, id, ...props }, ref) => {
    const inputId = id ?? (label ? label.toLowerCase().replace(/\s+/g, '-') : undefined);

    return (
      <div className="flex flex-col w-full">
        {label && (
          <label
            htmlFor={inputId}
            className="text-sm font-medium text-[var(--foreground)] mb-1.5"
          >
            {label}
          </label>
        )}
        <input
          id={inputId}
          ref={ref}
          className={cn(
            "w-full bg-[var(--surface-high)] border border-[var(--border)] rounded-[8px]",
            "px-[0.875rem] py-[0.625rem] text-[var(--foreground)] text-sm",
            "placeholder:text-[var(--subtle)]",
            "transition-colors duration-150",
            "focus:outline-none focus:border-[var(--border-focus)] focus:ring-[3px] focus:ring-[#d4a37333]",
            error && [
              "border-[var(--status-error-fg)]",
              "focus:border-[var(--status-error-fg)] focus:ring-[var(--status-error-fg)]/20",
            ],
            className
          )}
          {...props}
        />
        {error && (
          <p className="text-xs text-[var(--status-error-fg)] mt-1.5">{error}</p>
        )}
        {!error && hint && (
          <p className="text-xs text-[var(--muted)] mt-1.5">{hint}</p>
        )}
      </div>
    );
  }
);

Input.displayName = "Input";
