import React from "react";
import { cn } from "../../lib/utils";

interface DarkHeroCardProps {
  children: React.ReactNode;
  className?: string;
}

export const DarkHeroCard: React.FC<DarkHeroCardProps> = ({ children, className }) => {
  return (
    <div
      className={cn(
        "w-full bg-[var(--card)] border border-[var(--border)] text-[var(--text)] rounded-2xl p-6 relative overflow-hidden transition-all",
        className
      )}
    >
      <div className="relative z-10">{children}</div>
    </div>
  );
};
