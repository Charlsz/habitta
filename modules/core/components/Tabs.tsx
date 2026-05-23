"use client";

import { cn } from "@/lib/utils";

export interface TabItem {
  id: string;
  label: string;
}

export interface TabsProps {
  tabs: TabItem[];
  activeTab: string;
  onChange: (id: string) => void;
  className?: string;
}

export function Tabs({ tabs, activeTab, onChange, className }: TabsProps) {
  return (
    <div
      className={cn(
        "inline-flex items-center bg-[var(--surface)] rounded-full p-[4px]",
        className
      )}
    >
      {tabs.map((tab) => {
        const isActive = activeTab === tab.id;
        return (
          <button
            key={tab.id}
            type="button"
            onClick={() => onChange(tab.id)}
            className={cn(
              "px-[1rem] py-[0.375rem] rounded-full text-sm font-medium",
              "transition-all duration-150 ease-in-out",
              isActive
                ? "bg-[var(--foreground)] text-white"
                : "bg-transparent text-[var(--muted)] hover:bg-[var(--color-lima)]"
            )}
          >
            {tab.label}
          </button>
        );
      })}
    </div>
  );
}
