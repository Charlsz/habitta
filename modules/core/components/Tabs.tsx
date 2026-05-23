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
    <div className={cn("inline-flex items-center bg-surface rounded-full p-[4px]", className)}>
      {tabs.map((tab) => {
        const isActive = activeTab === tab.id;
        
        return (
          <button
            key={tab.id}
            onClick={() => onChange(tab.id)}
            className={cn(
              "px-[1rem] py-[0.375rem] rounded-full text-sm font-medium font-sans transition-all duration-150 ease-in-out",
              isActive 
                ? "bg-foreground text-white" 
                : "bg-transparent text-muted hover:bg-sidebar"
            )}
            type="button"
          >
            {tab.label}
          </button>
        );
      })}
    </div>
  );
}