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
        "card-elevated w-full border border-[var(--border)] text-[var(--text)] rounded-3xl p-6 relative overflow-hidden transition-all",
        "bg-gradient-to-br from-[#1B2740] via-[#161F30] to-[#111827]",
        className
      )}
    >
      {/* Warm accent glow, top-right */}
      <div
        aria-hidden
        className="pointer-events-none absolute -top-16 -right-10 w-56 h-56 rounded-full blur-3xl"
        style={{ background: "radial-gradient(circle, rgba(232,181,101,0.22), transparent 70%)" }}
      />
      {/* Cool light, bottom-left */}
      <div
        aria-hidden
        className="pointer-events-none absolute -bottom-20 -left-12 w-56 h-56 rounded-full blur-3xl"
        style={{ background: "radial-gradient(circle, rgba(127,170,209,0.12), transparent 70%)" }}
      />
      {/* Hairline top highlight */}
      <div
        aria-hidden
        className="pointer-events-none absolute inset-x-0 top-0 h-px"
        style={{ background: "linear-gradient(90deg, transparent, rgba(255,255,255,0.14), transparent)" }}
      />
      <div className="relative z-10">{children}</div>
    </div>
  );
};
