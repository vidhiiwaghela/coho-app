import React from "react";
import { Search, X } from "lucide-react";
import { cn } from "../../lib/utils";

interface PillSearchBarProps {
  value: string;
  onChange: (val: string) => void;
  placeholder?: string;
  className?: string;
  autoFocus?: boolean;
}

export const PillSearchBar: React.FC<PillSearchBarProps> = ({
  value,
  onChange,
  placeholder = "Search society rules, keywords, parking...",
  className,
  autoFocus = false,
}) => {
  return (
    <div className={cn("relative w-full", className)}>
      <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none text-secondaryText">
        <Search className="w-4 h-4" />
      </div>
      <input
        type="text"
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        autoFocus={autoFocus}
        className="w-full bg-elevatedSurface text-primaryText placeholder:text-secondaryText/70 text-sm font-medium pl-10 pr-10 py-3 rounded-pill border border-borderDivider shadow-sm focus:outline-none focus:ring-2 focus:ring-primaryButton/30 focus:border-primaryButton transition-all"
      />
      {value && (
        <button
          onClick={() => onChange("")}
          className="absolute inset-y-0 right-0 pr-3.5 flex items-center text-secondaryText hover:text-primaryText"
        >
          <X className="w-4 h-4 bg-white/10 hover:bg-white/20 rounded-full p-0.5" />
        </button>
      )}
    </div>
  );
};
