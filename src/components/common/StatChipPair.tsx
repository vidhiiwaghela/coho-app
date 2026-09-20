import React from "react";
import { ChevronRight } from "lucide-react";
import { cn } from "../../lib/utils";

interface StatChipProps {
  label: string;
  value: string | number;
  subtext?: string;
  variant?: "lime" | "dark" | "neutral";
  onClick?: () => void;
  icon?: React.ElementType;
}

export const StatChip: React.FC<StatChipProps> = ({
  label,
  value,
  subtext,
  onClick,
  icon: Icon,
}) => {
  const isClickable = Boolean(onClick);

  return (
    <div
      onClick={onClick}
      className={cn(
        "flex-1 bg-[#111C2E] border border-[#22304A] rounded-2xl p-5 shadow-sm transition-all duration-200 hover:border-[#EFE4CC] hover:bg-[#16233A] hover:scale-[1.02] flex flex-col justify-between select-none group",
        isClickable && "cursor-pointer"
      )}
    >
      <div className="flex items-center justify-between gap-1 mb-2">
        <span className="text-xs font-semibold tracking-wider uppercase text-[#F3F5F9]">
          {label}
        </span>
        {isClickable && (
          <ChevronRight className="w-4 h-4 text-[#8C97AD] group-hover:text-[#F3F5F9] group-hover:translate-x-0.5 transition-all" />
        )}
      </div>

      <div className="flex items-baseline gap-2">
        {Icon && <Icon className="w-5 h-5 mb-0.5 text-[#F3F5F9] opacity-90 shrink-0" />}
        <div className="text-2xl font-bold text-[#F3F5F9] tracking-tight">{value}</div>
      </div>

      {subtext && (
        <div className="text-sm text-[#8C97AD] mt-1 font-normal">
          {subtext}
        </div>
      )}
    </div>
  );
};

interface StatChipPairProps {
  left: StatChipProps;
  right: StatChipProps;
}

export const StatChipPair: React.FC<StatChipPairProps> = ({ left, right }) => {
  return (
    <div className="flex items-stretch gap-3 w-full">
      <StatChip {...left} />
      <StatChip {...right} />
    </div>
  );
};
