"use client";

import React from "react";
import { ActiveTab } from "../../types";
import {
  Home,
  CreditCard,
  Scale,
  FileText,
  Users,
  Bell,
  Sparkles,
} from "lucide-react";

interface FloatingNavProps {
  activeTab: ActiveTab;
  onChangeTab: (tab: ActiveTab) => void;
  unreadNoticesCount?: number;
  userRole?: string;
}

export const FloatingNav: React.FC<FloatingNavProps> = ({
  activeTab,
  onChangeTab,
  unreadNoticesCount = 1,
  userRole = "resident",
}) => {
  const isTenant = userRole === "tenant";

  const navItems: { id: ActiveTab; label: string; icon: React.ElementType }[] = isTenant
    ? [
        { id: "rules", label: "Society Rules", icon: Scale },
        { id: "festival", label: "Festival & Fund", icon: Sparkles },
      ]
    : [
        { id: "home", label: "Dashboard", icon: Home },
        { id: "payments", label: "Payments", icon: CreditCard },
        { id: "notices", label: "Notices & Minutes", icon: Bell },
        { id: "rules", label: "Society Rules", icon: Scale },
        { id: "festival", label: "Festival & Fund", icon: Sparkles },
      ];

  return (
    <div className="fixed bottom-5 inset-x-0 z-40 flex justify-center px-4 pointer-events-none">
      <nav
        className="pointer-events-auto bg-[var(--card)] border border-[var(--border)] p-1.5 rounded-2xl flex items-center gap-1.5 max-w-full overflow-x-auto no-scrollbar transition-all"
        aria-label="Main Navigation"
      >
        {navItems.map((item) => {
          const Icon = item.icon;
          const isActive =
            activeTab === item.id ||
            (!isTenant && item.id === "notices" && activeTab === "meetings");

          return (
            <button
              key={item.id}
              onClick={() => onChangeTab(item.id)}
              className={`relative flex flex-col items-center justify-center px-3.5 py-2.5 rounded-xl transition-all duration-200 group ${
                isActive
                  ? "bg-[var(--surface)] text-[var(--accent)] font-bold"
                  : "text-[var(--text-secondary)] hover:text-[var(--text)] hover:bg-[var(--surface)]/50"
              }`}
              title={item.label}
              id={`nav-btn-${item.id}`}
            >
              <Icon className="w-5 h-5 stroke-[2.2]" />

              {/* Tiny 4px warm dot underneath active tab */}
              {isActive && (
                <span className="absolute -bottom-0.5 w-1 h-1 rounded-full bg-[var(--accent)]" />
              )}

              {/* Unread badge on Notices icon */}
              {item.id === "notices" && unreadNoticesCount > 0 && !isActive && (
                <span className="absolute top-1.5 right-1.5 w-2 h-2 rounded-full bg-[var(--accent)]" />
              )}
            </button>
          );
        })}
      </nav>
    </div>
  );
};
