import * as React from "react";
import { cn } from "@/lib/utils";

type BadgeVariant = "open" | "in_progress" | "warning" | "error" | "closed" | "neutral";

export interface BadgeProps extends React.HTMLAttributes<HTMLSpanElement> {
  variant?: BadgeVariant;
}

export function Badge({ variant = "neutral", className, ...props }: BadgeProps) {
  const variants: Record<BadgeVariant, string> = {
    open: "bg-[#ccd5ae] text-[#3D5A1A]",
    in_progress: "bg-[#e9edc9] text-[#2C4A6E]",
    warning: "bg-[#faedcd] text-[#8B5E1A]",
    error: "bg-[#FDECEA] text-[#922B21]",
    closed: "bg-[#E8DECE] text-[#7A6A52]",
    neutral: "bg-[#E8DECE] text-[#7A6A52]",
  };
  
  return (
    <span 
      className={cn(
        "inline-flex items-center px-[10px] py-[2px] rounded-full text-[0.6875rem] font-semibold uppercase tracking-[0.04em]", 
        variants[variant], 
        className
      )} 
      {...props} 
    />
  );
}
