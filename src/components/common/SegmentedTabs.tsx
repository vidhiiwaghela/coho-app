import React from "react";
import { cn } from "../../lib/utils";

interface TabItem<T extends string> {
  id: T;
  label: string;
  badge?: number | string;
}

interface SegmentedTabsProps<T extends string> {
  tabs: TabItem<T>[];
  activeTab: T;
  onChange: (tabId: T) => void;
  className?: string;
}

export function SegmentedTabs<T extends string>({
  tabs,
  activeTab,
  onChange,
  className,
}: SegmentedTabsProps<T>) {
  return (
    <div className="overflow-x-auto no-scrollbar pb-1">
      <div
        className={cn(
          "inline-flex items-center bg-[var(--card)] border border-[var(--border)] rounded-full p-1 gap-1",
          className
        )}
      >
        {tabs.map((tab) => {
          const isActive = activeTab === tab.id;
          return (
            <button
              key={tab.id}
              onClick={() => onChange(tab.id)}
              id={`tab-btn-${tab.id}`}
              type="button"
              className={cn(
                "rounded-full px-5 py-2 text-sm font-medium transition-all duration-200 shrink-0 inline-flex items-center justify-center",
                isActive
                  ? "bg-[var(--accent)] text-[var(--on-accent)] font-bold"
                  : "bg-[var(--surface)] text-[var(--text-secondary)] border border-[var(--border)] hover:text-[var(--text)]"
              )}
            >
              <span>{tab.label}</span>
              {tab.badge !== undefined && (
                <span
                  className={cn(
                    "ml-2 inline-flex items-center justify-center w-5 h-5 rounded-full text-xs font-bold",
                    isActive
                      ? "bg-[var(--on-accent)]/20 text-[var(--on-accent)]"
                      : "bg-[var(--border)] text-[var(--text)]"
                  )}
                >
                  {tab.badge}
                </span>
              )}
            </button>
          );
        })}
      </div>
    </div>
  );
}
