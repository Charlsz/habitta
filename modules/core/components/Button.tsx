import * as React from "react";
import { cn } from "@/lib/utils";
import Link from "next/link";

type ButtonVariant = 'primary' | 'secondary' | 'ghost' | 'destructive';
type ButtonSize = 'sm' | 'md' | 'lg';

export interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: ButtonVariant;
  size?: ButtonSize;
  href?: string;
}

export const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant = 'primary', size = 'md', href, disabled, children, ...props }, ref) => {
    const base = [
      "inline-flex items-center justify-center font-medium transition-all duration-150 ease-in-out",
      "outline-none rounded-[8px]",
      "disabled:opacity-50 disabled:cursor-not-allowed disabled:pointer-events-none",
    ].join(" ");

    const variants: Record<ButtonVariant, string> = {
      primary:     "bg-[var(--accent)] text-white hover:bg-[var(--accent-hover)] border border-transparent",
      secondary:   "bg-transparent border border-[var(--border)] text-[var(--foreground)] hover:bg-[var(--surface)]",
      ghost:       "bg-transparent border border-transparent text-[var(--muted)] hover:text-[var(--foreground)] hover:bg-[var(--color-lima)]",
      destructive: "bg-[var(--status-error-bg)] text-[var(--status-error-fg)] hover:bg-[#FBBDB8] border border-transparent",
    };

    const sizes: Record<ButtonSize, string> = {
      sm: "px-[0.875rem] py-[0.5rem] text-xs",
      md: "px-[1.25rem] py-[0.625rem] text-sm",
      lg: "px-[1.75rem] py-[0.75rem] text-base",
    };

    const cls = cn(base, variants[variant], sizes[size], className);

    if (href) {
      return (
        <Link href={href} className={cls} aria-disabled={disabled}>
          {children}
        </Link>
      );
    }

    return (
      <button ref={ref} className={cls} disabled={disabled} {...props}>
        {children}
      </button>
    );
  }
);

Button.displayName = "Button";
