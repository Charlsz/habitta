import * as React from "react";
import { cn } from "@/lib/utils";

export interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  error?: string;
  hint?: string;
}

export const Input = React.forwardRef<HTMLInputElement, InputProps>(
  ({ className, label, error, hint, id, ...props }, ref) => {
    const inputId = id || (label ? label.toLowerCase().replace(/\s+/g, '-') : undefined);
    
    return (
      <div className="flex flex-col w-full">
        {label && (
          <label htmlFor={inputId} className="text-sm font-medium font-sans text-foreground mb-1.5">
            {label}
          </label>
        )}
        <input
          id={inputId}
          ref={ref}
          className={cn(
            "w-full bg-[var(--surface-high)] border border-border rounded-[8px] px-[0.875rem] py-[0.625rem] text-foreground placeholder-subtle transition-colors",
            "focus:outline-none focus:border-border-focus focus:ring-[3px] focus:ring-[#d4a37333]",
            error && "border-[var(--status-error-fg)] focus:border-[var(--status-error-fg)] focus:ring-[var(--status-error-fg)]/20 text-[var(--status-error-fg)]",
            className
          )}
          {...props}
        />
        {error && <p className="text-xs text-[var(--status-error-fg)] mt-1.5">{error}</p>}
        {!error && hint && <p className="text-xs text-muted mt-1.5">{hint}</p>}
      </div>
    );
  }
)
Input.displayName = "Input";
