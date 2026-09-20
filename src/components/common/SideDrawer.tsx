"use client";

import React, { useState } from "react";
import { FlatUser } from "../../types";
import {
  X,
  KeyRound,
  Bell,
  PhoneCall,
  AlertOctagon,
  LogOut,
  ShieldCheck,
  Check,
  ChevronRight,
  ChevronLeft,
  Phone,
  ShieldAlert,
  SlidersHorizontal,
} from "lucide-react";

interface SideDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  currentUser: FlatUser;
  onLogout?: () => void;
  onOpenNotificationCenter?: () => void;
}

export const SideDrawer: React.FC<SideDrawerProps> = ({
  isOpen,
  onClose,
  currentUser,
  onLogout,
  onOpenNotificationCenter,
}) => {
  const isAdmin = currentUser.role === "admin";

  // Sub-modal states
  const [activeModal, setActiveModal] = useState<
    "pin" | "notifications" | "helpdesk" | "sos" | null
  >(null);

  // Pin state
  const [currentPin, setCurrentPin] = useState("");
  const [newPin, setNewPin] = useState("");
  const [pinSaved, setPinSaved] = useState(false);

  // Notification prefs state
  const [notifPrefs, setNotifPrefs] = useState({
    sms: true,
    whatsapp: true,
    appPush: true,
    urgentBroadcasts: true,
  });
  const [prefsSaved, setPrefsSaved] = useState(false);

  // Emergency SOS state
  const [sosTriggered, setSosTriggered] = useState(false);

  const handleSavePin = (e: React.FormEvent) => {
    e.preventDefault();
    if (newPin.length >= 4) {
      setPinSaved(true);
      setTimeout(() => {
        setPinSaved(false);
        setActiveModal(null);
        setCurrentPin("");
        setNewPin("");
      }, 1500);
    }
  };

  const handleSavePrefs = () => {
    setPrefsSaved(true);
    setTimeout(() => {
      setPrefsSaved(false);
      setActiveModal(null);
    }, 1200);
  };

  const handleTriggerSos = () => {
    setSosTriggered(true);
    setTimeout(() => {
      setSosTriggered(false);
      setActiveModal(null);
    }, 3000);
  };

  return (
    <>
      {/* Dark Backdrop Overlay */}
      <div
        className={`fixed inset-0 bg-black/60 backdrop-blur-sm z-50 transition-opacity duration-300 ${
          isOpen ? "opacity-100 pointer-events-auto" : "opacity-0 pointer-events-none"
        }`}
        onClick={onClose}
        aria-hidden="true"
      />

      {/* Slide-out Drawer Container */}
      <aside
        className={`fixed top-0 right-0 h-full w-80 max-w-[82vw] bg-[#111C2E] border-l border-[#22304A] shadow-sm z-50 flex flex-col justify-between p-6 transition-transform duration-300 ease-out transform ${
          isOpen ? "translate-x-0" : "translate-x-full"
        }`}
        aria-label="Navigation Drawer"
      >
        {/* Top Section: Header & Menu Options */}
        <div className="space-y-6">
          {/* Drawer Header: User Snapshot & Close Button */}
          <div className="flex items-start justify-between pb-4 border-b border-[#22304A]">
            <div className="min-w-0">
              <div className="flex items-center gap-2 mb-1">
                <span className="text-sm font-black text-[#F3F5F9]">
                  {isAdmin ? "Society Office" : `Flat ${currentUser.flatNumber}`}
                </span>
                {isAdmin ? (
                  <span className="bg-[#EFE4CC]/15 text-[#F3F5F9] border border-[#EFE4CC]/30 text-[9px] font-extrabold px-2 py-0.5 rounded-full uppercase tracking-wider">
                    Admin
                  </span>
                ) : currentUser.role === "tenant" ? (
                  <span className="bg-[#EFE4CC]/10 text-[#F7F0DF] border border-[#EFE4CC]/20 text-[9px] font-semibold px-2 py-0.5 rounded-full uppercase">
                    Tenant
                  </span>
                ) : (
                  <span className="bg-[#EFE4CC]/15 text-[#F3F5F9] border border-[#EFE4CC]/30 text-[9px] font-semibold px-2 py-0.5 rounded-full uppercase">
                    Owner
                  </span>
                )}
              </div>
              <p className="text-xs text-[#8C97AD] truncate">
                {currentUser.residentName}
              </p>
            </div>

            <button
              onClick={onClose}
              className="w-8 h-8 rounded-xl bg-[#0A1120] hover:bg-[#16233A] border border-[#22304A] text-[#8C97AD] hover:text-[#F3F5F9] flex items-center justify-center transition-colors shrink-0"
              title="Close Menu"
              id="btn-close-drawer"
            >
              <X className="w-4 h-4" />
            </button>
          </div>

          {/* Menu Options List */}
          <nav className="space-y-1.5" aria-label="Side menu options">
            <button
              onClick={() => setActiveModal("pin")}
              className="w-full flex items-center justify-between p-3 rounded-xl hover:bg-[#16233A] border border-transparent hover:border-[#22304A] text-left transition-all group"
              id="menu-change-pin"
            >
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 rounded-lg bg-[#EFE4CC]/15 text-[#F3F5F9] flex items-center justify-center">
                  <KeyRound className="w-4 h-4" />
                </div>
                <span className="text-xs font-semibold text-[#F3F5F9]">
                  Change PIN / Password
                </span>
              </div>
              <ChevronRight className="w-4 h-4 text-[#8C97AD] group-hover:text-white transition-colors" />
            </button>

            <button
              onClick={() => {
                if (onOpenNotificationCenter) {
                  onClose();
                  onOpenNotificationCenter();
                } else {
                  setActiveModal("notifications");
                }
              }}
              className="w-full flex items-center justify-between p-3 rounded-xl hover:bg-[#16233A] border border-transparent hover:border-[#22304A] text-left transition-all group"
              id="menu-notification-prefs"
            >
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 rounded-lg bg-[#EFE4CC]/15 text-[#F3F5F9] flex items-center justify-center">
                  <SlidersHorizontal className="w-4 h-4" />
                </div>
                <span className="text-xs font-semibold text-[#F3F5F9]">
                  Notification Preferences
                </span>
              </div>
              <ChevronRight className="w-4 h-4 text-[#8C97AD] group-hover:text-white transition-colors" />
            </button>

            <button
              onClick={() => setActiveModal("helpdesk")}
              className="w-full flex items-center justify-between p-3 rounded-xl hover:bg-[#16233A] border border-transparent hover:border-[#22304A] text-left transition-all group"
              id="menu-helpdesk-contacts"
            >
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 rounded-lg bg-[#EFE4CC]/15 text-[#F3F5F9] flex items-center justify-center">
                  <PhoneCall className="w-4 h-4" />
                </div>
                <span className="text-xs font-semibold text-[#F3F5F9]">
                  Society Helpdesk & Contacts
                </span>
              </div>
              <ChevronRight className="w-4 h-4 text-[#8C97AD] group-hover:text-white transition-colors" />
            </button>

            <button
              onClick={() => setActiveModal("sos")}
              className="w-full flex items-center justify-between p-3 rounded-xl hover:bg-[#2A1418]/30 border border-transparent hover:border-[#F0736A]/30 text-left transition-all group"
              id="menu-emergency-sos"
            >
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 rounded-lg bg-[#2A1418] text-[#F0736A] border border-[#F0736A]/30 flex items-center justify-center">
                  <AlertOctagon className="w-4 h-4" />
                </div>
                <div>
                  <span className="text-xs font-bold text-[#F0736A] block">
                    Emergency SOS
                  </span>
                  <span className="text-[10px] text-[#F0736A]/70 block">
                    Alert Gate Security Immediately
                  </span>
                </div>
              </div>
              <ChevronRight className="w-4 h-4 text-[#F0736A] group-hover:translate-x-0.5 transition-transform" />
            </button>
          </nav>
        </div>

        {/* Bottom Section: Divider, Log Out & App Version Footer */}
        <div className="pt-4 border-t border-[#22304A] space-y-3">
          {onLogout && (
            <button
              onClick={() => {
                onClose();
                onLogout();
              }}
              className="bg-[#2A1418]/60 text-[#F0736A] border border-[#F0736A]/30 hover:bg-[#2A1418] rounded-xl py-2.5 font-medium transition-all w-full flex items-center justify-center gap-2 cursor-pointer shadow-sm text-xs"
              id="drawer-btn-logout"
            >
              <LogOut className="w-4 h-4" />
              <span>Log Out</span>
            </button>
          )}

          <div className="text-[11px] text-[#8C97AD]/60 text-center tracking-wide">
            CoHo Portal v2.0 • Emerald Heights
          </div>
        </div>
      </aside>

      {/* SUB-MODAL 1: Change Access PIN (Full-Screen Sub-View) */}
      {activeModal === "pin" && (
        <div className="fixed inset-0 z-50 bg-[#0A1120] text-[#F3F5F9] min-h-screen overflow-y-auto pb-12 animate-fade-in">
          <div className="w-full max-w-lg mx-auto min-h-screen flex flex-col relative sm:border-x sm:border-[#22304A]">
            {/* Top Navigation Bar (matching Notifications) */}
            <header className="flex items-center justify-between px-4 pt-12 pb-3 bg-[#0A1120] sticky top-0 z-20">
              <button
                type="button"
                onClick={() => setActiveModal(null)}
                className="w-9 h-9 rounded-full bg-[#111C2E] flex items-center justify-center text-[#F3F5F9] border border-[#22304A] hover:bg-[#16233A] transition-all cursor-pointer shadow-sm active:scale-95"
                aria-label="Go Back"
                id="btn-back-change-pin"
              >
                <ChevronLeft className="w-5 h-5" />
              </button>

              <h1 className="text-[17px] font-semibold text-[#F3F5F9]">
                Change Access PIN
              </h1>

              <div className="w-9" aria-hidden="true" />
            </header>

            {/* Form Body */}
            <form onSubmit={handleSavePin} className="flex-1 flex flex-col">
              <div className="mx-4 my-4 bg-[#111C2E] rounded-2xl border border-[#22304A] p-4 space-y-4 shadow-sm">
                <div>
                  <label className="block text-xs font-semibold text-[#8C97AD] mb-2 uppercase tracking-wider">
                    Current PIN
                  </label>
                  <input
                    type="password"
                    maxLength={4}
                    placeholder="••••"
                    value={currentPin}
                    onChange={(e) => setCurrentPin(e.target.value.replace(/\D/g, ""))}
                    className="w-full bg-[#0A1120] border border-[#22304A] rounded-xl px-4 py-3 text-[#F3F5F9] text-center tracking-[0.5em] text-[18px] focus:outline-none focus:border-[#EFE4CC]"
                    required
                    autoFocus
                    id="input-current-pin"
                  />
                </div>

                <div className="border-t border-[#22304A] pt-3">
                  <label className="block text-xs font-semibold text-[#8C97AD] mb-2 uppercase tracking-wider">
                    New 4-Digit PIN
                  </label>
                  <input
                    type="password"
                    maxLength={4}
                    placeholder="••••"
                    value={newPin}
                    onChange={(e) => setNewPin(e.target.value.replace(/\D/g, ""))}
                    className="w-full bg-[#0A1120] border border-[#22304A] rounded-xl px-4 py-3 text-[#F3F5F9] text-center tracking-[0.5em] text-[18px] focus:outline-none focus:border-[#EFE4CC]"
                    required
                    id="input-new-pin"
                  />
                </div>

                <p className="text-[12px] text-[#8C97AD] px-1 leading-relaxed">
                  Enter your existing 4-digit security PIN followed by your new PIN.
                </p>
              </div>

              {/* Action Button */}
              <button
                type="submit"
                disabled={pinSaved || newPin.length < 4}
                className="mx-4 mt-6 w-[calc(100%-2rem)] py-3.5 rounded-xl bg-[#EFE4CC] text-[#0A1120] font-bold text-[15px] hover:bg-[#F7F0DF] shadow-sm transition disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2 cursor-pointer active:scale-[0.99]"
                id="btn-save-access-pin"
              >
                {pinSaved ? (
                  <>
                    <Check className="w-5 h-5 text-[#4EBA86]" />
                    <span>PIN Successfully Updated!</span>
                  </>
                ) : (
                  <span>Save New Access PIN</span>
                )}
              </button>
            </form>
          </div>
        </div>
      )}

      {/* SUB-MODAL 2: Notification Preferences */}
      {activeModal === "notifications" && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm animate-fade-in">
          <div className="bg-[#111C2E] border border-[#22304A] rounded-2xl w-full max-w-sm p-5 shadow-sm space-y-4">
            <div className="flex items-center justify-between border-b border-[#22304A] pb-3">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-xl bg-[#EFE4CC]/15 text-[#F3F5F9] flex items-center justify-center">
                  <Bell className="w-4 h-4" />
                </div>
                <h3 className="text-sm font-bold text-[#F3F5F9]">
                  Notification Channels
                </h3>
              </div>
              <button
                onClick={() => setActiveModal(null)}
                className="text-[#8C97AD] hover:text-white"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="space-y-3">
              <label className="flex items-center justify-between p-2.5 rounded-xl bg-[#0A1120] border border-[#22304A] cursor-pointer">
                <div>
                  <div className="text-xs font-semibold text-[#F3F5F9]">
                    WhatsApp Alerts
                  </div>
                  <div className="text-[10px] text-[#8C97AD]">
                    Maintenance bills & payment receipts
                  </div>
                </div>
                <input
                  type="checkbox"
                  checked={notifPrefs.whatsapp}
                  onChange={(e) =>
                    setNotifPrefs({ ...notifPrefs, whatsapp: e.target.checked })
                  }
                  className="w-4 h-4 accent-[#F3F5F9] rounded"
                />
              </label>

              <label className="flex items-center justify-between p-2.5 rounded-xl bg-[#0A1120] border border-[#22304A] cursor-pointer">
                <div>
                  <div className="text-xs font-semibold text-[#F3F5F9]">
                    SMS Notifications
                  </div>
                  <div className="text-[10px] text-[#8C97AD]">
                    Urgent facility & water supply circulars
                  </div>
                </div>
                <input
                  type="checkbox"
                  checked={notifPrefs.sms}
                  onChange={(e) =>
                    setNotifPrefs({ ...notifPrefs, sms: e.target.checked })
                  }
                  className="w-4 h-4 accent-[#F3F5F9] rounded"
                />
              </label>

              <label className="flex items-center justify-between p-2.5 rounded-xl bg-[#0A1120] border border-[#22304A] cursor-pointer">
                <div>
                  <div className="text-xs font-semibold text-[#F3F5F9]">
                    In-App Push Alerts
                  </div>
                  <div className="text-[10px] text-[#8C97AD]">
                    Event RSVPs, document approvals & AGM minutes
                  </div>
                </div>
                <input
                  type="checkbox"
                  checked={notifPrefs.appPush}
                  onChange={(e) =>
                    setNotifPrefs({ ...notifPrefs, appPush: e.target.checked })
                  }
                  className="w-4 h-4 accent-[#F3F5F9] rounded"
                />
              </label>
            </div>

            <div className="pt-2 flex items-center justify-end gap-2">
              <button
                type="button"
                onClick={() => setActiveModal(null)}
                className="px-3 py-1.5 rounded-xl text-xs text-[#8C97AD] hover:text-white"
              >
                Close
              </button>
              <button
                type="button"
                onClick={handleSavePrefs}
                className="bg-[#EFE4CC] hover:bg-[#F7F0DF] text-[#0A1120] text-xs font-bold px-4 py-2 rounded-xl transition-all flex items-center gap-1.5 shadow-sm"
              >
                {prefsSaved ? (
                  <>
                    <Check className="w-3.5 h-3.5" />
                    <span>Saved!</span>
                  </>
                ) : (
                  <span>Save Preferences</span>
                )}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* SUB-MODAL 3: Society Helpdesk Directory (Full-Screen Sub-View) */}
      {activeModal === "helpdesk" && (
        <div className="fixed inset-0 z-50 bg-[#0A1120] text-[#F3F5F9] min-h-screen overflow-y-auto pb-12 animate-fade-in">
          <div className="w-full max-w-lg mx-auto min-h-screen flex flex-col relative sm:border-x sm:border-[#22304A]">
            {/* Top Navigation Bar (matching Notifications) */}
            <header className="flex items-center justify-between px-4 pt-12 pb-3 bg-[#0A1120] sticky top-0 z-20">
              <button
                type="button"
                onClick={() => setActiveModal(null)}
                className="w-9 h-9 rounded-full bg-[#111C2E] flex items-center justify-center text-[#F3F5F9] border border-[#22304A] hover:bg-[#16233A] transition-all cursor-pointer shadow-sm active:scale-95"
                aria-label="Go Back"
                id="btn-back-helpdesk-directory"
              >
                <ChevronLeft className="w-5 h-5" />
              </button>

              <h1 className="text-[17px] font-semibold text-[#F3F5F9]">
                Helpdesk Directory
              </h1>

              <div className="w-9" aria-hidden="true" />
            </header>

            {/* List Container (iOS Inset Style) */}
            <div className="mx-4 my-4 bg-[#111C2E] rounded-2xl border border-[#22304A] overflow-hidden shadow-sm">
              {/* Row 1: Main Security Gate */}
              <div className="px-4 py-3.5 flex items-center justify-between gap-3">
                <div className="min-w-0 pr-2">
                  <div className="text-[15px] font-semibold text-[#F3F5F9] truncate">
                    Main Security Gate
                  </div>
                  <div className="text-[13px] text-[#8C97AD] mt-0.5 truncate">
                    Ext 101 • 24/7 Gate Guard
                  </div>
                </div>
                <a
                  href="tel:101"
                  className="bg-[#16233A]/50 text-[#F3F5F9] border border-[#22304A] rounded-xl px-4 py-2 flex items-center gap-2 text-[14px] hover:bg-[#16233A] transition shrink-0 active:scale-95"
                  id="btn-call-security"
                >
                  <Phone className="w-4 h-4 text-[#F3F5F9]" />
                  <span>Call</span>
                </a>
              </div>

              {/* Row 2: Society Secretary */}
              <div className="border-t border-[#22304A] ml-4" />
              <div className="px-4 py-3.5 flex items-center justify-between gap-3">
                <div className="min-w-0 pr-2">
                  <div className="text-[15px] font-semibold text-[#F3F5F9] truncate">
                    Society Secretary (Rajesh Shetty)
                  </div>
                  <div className="text-[13px] text-[#8C97AD] mt-0.5 truncate">
                    Office Wing • +91 98200 12345
                  </div>
                </div>
                <a
                  href="tel:+919820012345"
                  className="bg-[#16233A]/50 text-[#F3F5F9] border border-[#22304A] rounded-xl px-4 py-2 flex items-center gap-2 text-[14px] hover:bg-[#16233A] transition shrink-0 active:scale-95"
                  id="btn-call-secretary"
                >
                  <Phone className="w-4 h-4 text-[#F3F5F9]" />
                  <span>Call</span>
                </a>
              </div>

              {/* Row 3: Resident Electrician */}
              <div className="border-t border-[#22304A] ml-4" />
              <div className="px-4 py-3.5 flex items-center justify-between gap-3">
                <div className="min-w-0 pr-2">
                  <div className="text-[15px] font-semibold text-[#F3F5F9] truncate">
                    Resident Electrician (Santosh)
                  </div>
                  <div className="text-[13px] text-[#8C97AD] mt-0.5 truncate">
                    General Maintenance • +91 98201 55443
                  </div>
                </div>
                <a
                  href="tel:+919820155443"
                  className="bg-[#16233A]/50 text-[#F3F5F9] border border-[#22304A] rounded-xl px-4 py-2 flex items-center gap-2 text-[14px] hover:bg-[#16233A] transition shrink-0 active:scale-95"
                  id="btn-call-electrician"
                >
                  <Phone className="w-4 h-4 text-[#F3F5F9]" />
                  <span>Call</span>
                </a>
              </div>

              {/* Row 4: Resident Plumber */}
              <div className="border-t border-[#22304A] ml-4" />
              <div className="px-4 py-3.5 flex items-center justify-between gap-3">
                <div className="min-w-0 pr-2">
                  <div className="text-[15px] font-semibold text-[#F3F5F9] truncate">
                    Resident Plumber (Ganesh)
                  </div>
                  <div className="text-[13px] text-[#8C97AD] mt-0.5 truncate">
                    Pumps & Lines • +91 98332 88990
                  </div>
                </div>
                <a
                  href="tel:+919833288990"
                  className="bg-[#16233A]/50 text-[#F3F5F9] border border-[#22304A] rounded-xl px-4 py-2 flex items-center gap-2 text-[14px] hover:bg-[#16233A] transition shrink-0 active:scale-95"
                  id="btn-call-plumber"
                >
                  <Phone className="w-4 h-4 text-[#F3F5F9]" />
                  <span>Call</span>
                </a>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* SUB-MODAL 4: Emergency SOS */}
      {activeModal === "sos" && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md animate-fade-in">
          <div className="bg-[#111C2E] border border-[#F0736A]/30 rounded-2xl w-full max-w-sm p-6 shadow-sm space-y-4 text-center">
            <div className="w-14 h-14 rounded-full bg-[#2A1418] text-[#F0736A] border border-[#F0736A]/30 flex items-center justify-center mx-auto animate-pulse">
              <ShieldAlert className="w-7 h-7" />
            </div>

            {sosTriggered ? (
              <div className="space-y-2 animate-fade-in">
                <h3 className="text-base font-extrabold text-[#F0736A]">
                  SOS Broadcast Dispatched!
                </h3>
                <p className="text-xs text-[#F0736A]/90 leading-relaxed">
                  Main Security Gate has been alerted with sound beacon. Guard
                  is rushing to Flat {currentUser.flatNumber}.
                </p>
                <div className="text-[11px] text-[#F3F5F9] font-semibold mt-2">
                  Emergency Line Active: Ext 101
                </div>
              </div>
            ) : (
              <div className="space-y-2">
                <h3 className="text-base font-extrabold text-[#F3F5F9]">
                  Trigger Emergency Security Alert?
                </h3>
                <p className="text-xs text-[#8C97AD] leading-relaxed">
                  This will immediately notify the Main Gate Security Guard and
                  Facilities Manager with your flat location ({currentUser.flatNumber}).
                </p>
              </div>
            )}

            {!sosTriggered && (
              <div className="pt-2 flex items-center justify-center gap-3">
                <button
                  type="button"
                  onClick={() => setActiveModal(null)}
                  className="px-4 py-2 rounded-xl text-xs text-[#8C97AD] hover:text-white bg-[#0A1120] border border-[#22304A]"
                >
                  Cancel
                </button>
                <button
                  type="button"
                  onClick={handleTriggerSos}
                  className="bg-[#2A1418] hover:bg-[#2A1418]/80 text-[#F0736A] border border-[#F0736A]/30 text-xs font-bold px-5 py-2 rounded-xl transition-all shadow-lg flex items-center gap-1.5"
                  id="btn-confirm-sos"
                >
                  <AlertOctagon className="w-4 h-4" />
                  <span>Trigger Alert Now</span>
                </button>
              </div>
            )}
          </div>
        </div>
      )}
    </>
  );
};
