import * as React from "react";
import { cn } from "@/lib/utils";

export interface CardProps extends React.HTMLAttributes<HTMLDivElement> {
  hover?: boolean;
  padding?: 'sm' | 'md' | 'lg';
}

export const Card = React.forwardRef<HTMLDivElement, CardProps>(
  ({ className, hover, padding = 'md', children, ...props }, ref) => {
    const paddingMap = {
      sm: "p-[12px]",
      md: "p-[20px]",
      lg: "p-[28px]",
    };

    return (
      <div
        ref={ref}
        className={cn(
          "bg-[var(--surface)] border border-[var(--border)] rounded-[12px]",
          "shadow-[var(--shadow-card)]",
          paddingMap[padding],
          hover && [
            "transition-all duration-200 ease-in-out cursor-pointer",
            "hover:shadow-[var(--shadow-hover)] hover:-translate-y-[1px]",
          ],
          className
        )}
        {...props}
      >
        {children}
      </div>
    );
  }
);

Card.displayName = "Card";
