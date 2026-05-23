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
    const baseClass = "inline-flex items-center justify-center font-medium font-sans transition-all duration-150 ease-in-out outline-none rounded-[8px] disabled:opacity-50 disabled:cursor-not-allowed disabled:pointer-events-none";
    
    const variants: Record<ButtonVariant, string> = {
      primary: "bg-accent text-accent-fg hover:bg-accent-hover border-transparent",
      secondary: "bg-transparent border border-border text-foreground hover:bg-surface",
      destructive: "bg-[#FDECEA] text-[#922B21] hover:bg-[#FBBDB8] border-transparent",
      ghost: "bg-transparent text-muted hover:text-foreground hover:bg-[#e9edc9] border-transparent",
    };
    
    const sizes: Record<ButtonSize, string> = {
      sm: "px-[0.875rem] py-[0.5rem] text-xs",
      md: "px-[1.25rem] py-[0.625rem] text-sm",
      lg: "px-[1.75rem] py-[0.75rem] text-base",
    };

    const combinedClasses = cn(baseClass, variants[variant], sizes[size], className);

    if (href) {
      return (
        <Link href={href} className={combinedClasses} aria-disabled={disabled}>
          {children}
        </Link>
      );
    }

    return (
      <button ref={ref} className={combinedClasses} disabled={disabled} {...props}>
        {children}
      </button>
    );
  }
);

Button.displayName = "Button";
