"use client";

import React, { useState } from "react";
import { FlatUser } from "../../types";
import { Menu, Bell } from "lucide-react";
import { SideDrawer } from "./SideDrawer";

interface HeaderProps {
  currentUser: FlatUser;
  flats?: FlatUser[];
  onSwitchFlat?: (flatId: string, role?: any) => void;
  onResetData?: () => void;
  onOpenAdminModal?: () => void;
  onLogout?: () => void;
  onOpenNotificationCenter?: () => void;
}

export const Header: React.FC<HeaderProps> = ({
  currentUser,
  onLogout,
  onOpenNotificationCenter,
}) => {
  const [isDrawerOpen, setIsDrawerOpen] = useState(false);
  const isAdmin = currentUser.role === "admin";

  return (
    <>
      <header className="sticky top-0 z-40 w-full bg-[var(--bg)] border-b border-[var(--border)] px-4 py-3">
        <div className="max-w-xl mx-auto flex items-center justify-between gap-3">
          {/* Left side: CoHo Logo & Society / Resident Details */}
          <div className="flex items-center gap-3.5 min-w-0">
            <img
              src="/coho_logo.jpeg"
              alt="CoHo Logo"
              className="h-10 w-auto object-contain shrink-0 rounded-md"
            />
            <div className="min-w-0">
              <div className="flex items-center gap-2">
                <span className="text-xs font-semibold tracking-wide text-[var(--text-secondary)] truncate">
                  Emerald Heights CHS
                </span>
                {isAdmin ? (
                  <span className="border border-[var(--border)] bg-[var(--surface)] text-[var(--text)] px-2.5 py-0.5 rounded-full text-[11px] font-semibold">
                    Admin
                  </span>
                ) : currentUser.role === "tenant" ? (
                  <span className="border border-[var(--border)] text-[var(--text)] bg-[var(--card)] px-2.5 py-0.5 rounded-full text-[11px] font-semibold">
                    Tenant
                  </span>
                ) : (
                  <span className="border border-[var(--border)] text-[var(--text)] bg-[var(--card)] px-2.5 py-0.5 rounded-full text-[11px] font-semibold">
                    Owner
                  </span>
                )}
              </div>
              <h1 className="text-xs sm:text-sm font-bold text-[var(--text)] leading-tight truncate mt-0.5">
                {isAdmin
                  ? "Managing Committee • Society Office"
                  : `Flat ${currentUser.flatNumber} • ${currentUser.residentName}`}
              </h1>
            </div>
          </div>

          {/* Right side: Bell Shortcut & Sleek Hamburger Menu Button */}
          <div className="flex items-center gap-2 shrink-0">
            {onOpenNotificationCenter && (
              <button
                onClick={onOpenNotificationCenter}
                className="w-10 h-10 rounded-xl bg-[var(--card)] hover:bg-[var(--surface)] border border-[var(--border)] text-[var(--text)] flex items-center justify-center transition-all active:scale-95 shrink-0 cursor-pointer shadow-sm relative"
                title="Notification Preferences"
                id="btn-header-notifications"
                aria-label="Open Notifications"
              >
                <Bell className="w-5 h-5 text-[var(--text)]" />
              </button>
            )}
            <button
              onClick={() => setIsDrawerOpen(true)}
              className="w-10 h-10 rounded-xl bg-[var(--card)] hover:bg-[var(--surface)] border border-[var(--border)] text-[var(--text)] flex items-center justify-center transition-all active:scale-95 shrink-0 cursor-pointer shadow-sm"
              title="Open Menu"
              id="btn-hamburger-menu"
              aria-label="Open Navigation Menu"
            >
              <Menu className="w-5 h-5 text-[var(--text)]" />
            </button>
          </div>
        </div>
      </header>

      {/* Slide-out Side Drawer */}
      <SideDrawer
        isOpen={isDrawerOpen}
        onClose={() => setIsDrawerOpen(false)}
        currentUser={currentUser}
        onLogout={onLogout}
        onOpenNotificationCenter={onOpenNotificationCenter}
      />
    </>
  );
};
