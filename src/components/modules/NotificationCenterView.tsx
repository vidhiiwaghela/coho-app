"use client";

import React, { useState, useEffect } from "react";
import {
  ChevronLeft,
  ChevronRight,
  Bell,
  Volume2,
  Check,
  AlertTriangle,
  Zap,
  Droplets,
  ArrowUpDown,
  FileText,
  Users,
  CreditCard,
  FileCheck,
  Calendar,
  Sparkles,
  X,
} from "lucide-react";

interface NotificationPreferences {
  // Group 1: Emergency & Utilities
  powerOutages: boolean;
  waterSupply: boolean;
  liftMaintenance: boolean;

  // Group 2: Governance & Notices
  officialCirculars: boolean;
  agmMinutes: boolean;
  alertPreviewMode: "summary_decisions" | "full_notice" | "urgent_banner";

  // Group 3: Society Billing & Amenities
  maintenanceReminders: boolean;
  documentApprovals: boolean;
  facilityBookings: boolean;

  // Group 4: Preferences
  soundType: "Classic Chime" | "Alert Bell" | "Soft Tone" | "Minimal Pulse";
  vibrate: boolean;
}

const DEFAULT_PREFERENCES: NotificationPreferences = {
  powerOutages: true,
  waterSupply: true,
  liftMaintenance: true,
  officialCirculars: true,
  agmMinutes: true,
  alertPreviewMode: "summary_decisions",
  maintenanceReminders: true,
  documentApprovals: true,
  facilityBookings: false,
  soundType: "Classic Chime",
  vibrate: true,
};

interface NotificationCenterViewProps {
  onBack: () => void;
}

// Web Audio synthesizer for instant, zero-dependency chime previews
const playSoundPreview = (type: NotificationPreferences["soundType"]) => {
  if (typeof window === "undefined") return;
  try {
    const AudioContextClass =
      window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
    if (!AudioContextClass) return;
    const ctx = new AudioContextClass();

    const now = ctx.currentTime;
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();

    osc.connect(gain);
    gain.connect(ctx.destination);

    if (type === "Classic Chime") {
      osc.type = "sine";
      osc.frequency.setValueAtTime(587.33, now); // D5
      osc.frequency.setValueAtTime(880, now + 0.1); // A5
      gain.gain.setValueAtTime(0.3, now);
      gain.gain.exponentialRampToValueAtTime(0.001, now + 0.5);
      osc.start(now);
      osc.stop(now + 0.5);
    } else if (type === "Alert Bell") {
      osc.type = "triangle";
      osc.frequency.setValueAtTime(783.99, now); // G5
      osc.frequency.setValueAtTime(1046.5, now + 0.12); // C6
      gain.gain.setValueAtTime(0.4, now);
      gain.gain.exponentialRampToValueAtTime(0.001, now + 0.6);
      osc.start(now);
      osc.stop(now + 0.6);
    } else if (type === "Soft Tone") {
      osc.type = "sine";
      osc.frequency.setValueAtTime(440, now); // A4
      osc.frequency.setValueAtTime(554.37, now + 0.12); // C#5
      gain.gain.setValueAtTime(0.2, now);
      gain.gain.exponentialRampToValueAtTime(0.001, now + 0.45);
      osc.start(now);
      osc.stop(now + 0.45);
    } else {
      // Minimal Pulse
      osc.type = "sine";
      osc.frequency.setValueAtTime(880, now);
      gain.gain.setValueAtTime(0.25, now);
      gain.gain.exponentialRampToValueAtTime(0.001, now + 0.18);
      osc.start(now);
      osc.stop(now + 0.18);
    }
  } catch {
    // Graceful fallback if audio context blocked
  }
};

// Custom iOS Style Toggle Switch
interface IosToggleProps {
  checked: boolean;
  onChange: (checked: boolean) => void;
  id?: string;
  ariaLabel?: string;
}

const IosToggle: React.FC<IosToggleProps> = ({ checked, onChange, id, ariaLabel }) => {
  return (
    <button
      type="button"
      role="switch"
      aria-checked={checked}
      aria-label={ariaLabel}
      id={id}
      onClick={() => onChange(!checked)}
      className={`w-12 h-7 rounded-full transition-colors duration-200 cursor-pointer flex items-center p-0.5 focus:outline-none shrink-0 ${
        checked ? "bg-[#8FBF8A]" : "bg-[#1C2740]"
      }`}
    >
      <span
        className={`w-6 h-6 rounded-full bg-white shadow-sm transform transition-transform duration-200 ${
          checked ? "translate-x-5" : "translate-x-0.5"
        }`}
      />
    </button>
  );
};

export const NotificationCenterView: React.FC<NotificationCenterViewProps> = ({ onBack }) => {
  const [prefs, setPrefs] = useState<NotificationPreferences>(DEFAULT_PREFERENCES);
  const [soundSheetOpen, setSoundSheetOpen] = useState(false);
  const [previewSheetOpen, setPreviewSheetOpen] = useState(false);
  const [testNotification, setTestNotification] = useState<{
    id: number;
    title: string;
    body: string;
    type: "urgent" | "notice" | "bill";
  } | null>(null);
  const [resetConfirmOpen, setResetConfirmOpen] = useState(false);

  // Load persisted preferences
  useEffect(() => {
    try {
      const saved = localStorage.getItem("coho_notification_preferences");
      if (saved) {
        setPrefs((prev) => ({ ...prev, ...JSON.parse(saved) }));
      }
    } catch {
      // ignore
    }
  }, []);

  // Save changes
  const updatePref = <K extends keyof NotificationPreferences>(key: K, value: NotificationPreferences[K]) => {
    setPrefs((prev) => {
      const updated = { ...prev, [key]: value };
      try {
        localStorage.setItem("coho_notification_preferences", JSON.stringify(updated));
      } catch {
        // ignore
      }
      return updated;
    });
  };

  // Dispatch live test push notification simulation
  const handleSendTestNotification = () => {
    playSoundPreview(prefs.soundType);
    if (prefs.vibrate && typeof navigator !== "undefined" && navigator.vibrate) {
      navigator.vibrate([100, 50, 100]);
    }

    setTestNotification({
      id: Date.now(),
      title: "⚡ Critical Utility Alert • DG Backup Active",
      body: "Scheduled power maintenance on Wing A/B transformer. Elevators are operating smoothly on backup power.",
      type: "urgent",
    });

    setTimeout(() => {
      setTestNotification(null);
    }, 5000);
  };

  const handleResetPreferences = () => {
    setPrefs(DEFAULT_PREFERENCES);
    try {
      localStorage.setItem("coho_notification_preferences", JSON.stringify(DEFAULT_PREFERENCES));
    } catch {
      // ignore
    }
    setResetConfirmOpen(false);
    playSoundPreview("Minimal Pulse");
  };

  const SOUND_OPTIONS: NotificationPreferences["soundType"][] = [
    "Classic Chime",
    "Alert Bell",
    "Soft Tone",
    "Minimal Pulse",
  ];

  const PREVIEW_OPTIONS: { id: NotificationPreferences["alertPreviewMode"]; label: string; desc: string }[] = [
    {
      id: "summary_decisions",
      label: "Summary & Decisions",
      desc: "Instant bullet points with key decisions and actionable deadlines",
    },
    {
      id: "full_notice",
      label: "Full Notice Text",
      desc: "Complete official notice text directly in the push banner",
    },
    {
      id: "urgent_banner",
      label: "Urgent Banner Only",
      desc: "Compact one-line headline with tap-to-open society portal",
    },
  ];

  return (
    <div className="bg-[#0E1420] min-h-screen text-[#F5F1E8] pb-16 flex flex-col items-center animate-fade-in">
      <div className="w-full max-w-lg min-h-screen flex flex-col relative sm:border-x sm:border-[#2B3854] sm:shadow-sm">
        {/* Floating Test Push Banner Toast */}
        {testNotification && (
          <div className="fixed top-4 inset-x-4 max-w-md mx-auto z-50 animate-bounce">
            <div className="bg-[#161F30] border border-[#2B3854] rounded-2xl p-4 shadow-sm flex items-start justify-between gap-3 text-left">
              <div className="flex items-start gap-3">
                <div className="w-8 h-8 rounded-xl bg-[#E8B565] text-[#0E1420] flex items-center justify-center font-bold text-xs shrink-0 mt-0.5">
                  <Bell className="w-4 h-4" />
                </div>
                <div>
                  <div className="flex items-center gap-1.5">
                    <span className="text-[11px] font-bold uppercase tracking-wider text-[#A6ACC0]">
                      CoHo Society Push • Just Now
                    </span>
                  </div>
                  <h4 className="text-xs font-bold text-[#F5F1E8] mt-0.5">{testNotification.title}</h4>
                  <p className="text-[11px] text-[#A6ACC0] mt-0.5 leading-relaxed">{testNotification.body}</p>
                </div>
              </div>
              <button
                onClick={() => setTestNotification(null)}
                className="text-[#A6ACC0] hover:text-[#F5F1E8] p-1 rounded-full hover:bg-[#1C2740]/40"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
          </div>
        )}

        {/* 2. TOP NAVIGATION BAR (Exact reference layout) */}
        <header className="flex items-center justify-between px-4 pt-12 pb-3 bg-[#0E1420] sticky top-0 z-20">
          <button
            onClick={onBack}
            className="w-9 h-9 rounded-full bg-[#161F30] flex items-center justify-center text-[#F5F1E8] border border-[#2B3854] hover:bg-[#1C2740] transition-all cursor-pointer shadow-sm active:scale-95"
            aria-label="Go Back"
            id="btn-back-notification-center"
          >
            <ChevronLeft className="w-5 h-5" />
          </button>

          <h1 className="text-[17px] font-semibold text-[#F5F1E8]">Notifications</h1>

          <div className="w-9" aria-hidden="true" />
        </header>

        {/* Main Inset Grouped Scroll Content */}
        <div className="flex-1 space-y-5 pt-1">
          {/* GROUP 1: EMERGENCY & UTILITIES */}
          <div>
            <div className="text-[13px] font-medium text-[#A6ACC0] px-5 pt-4 pb-1 uppercase tracking-wide">
              Emergency & Utilities
            </div>
            <div className="mx-4 my-1 bg-[#161F30] rounded-2xl border border-[#2B3854] overflow-hidden shadow-sm">
              {/* Row 1 */}
              <div className="px-4 py-3.5 flex items-center justify-between text-[15px] text-[#F5F1E8]">
                <div className="flex items-center gap-3 pr-2">
                  <div className="w-7 h-7 rounded-lg bg-[#1C2740]/50 text-[#F5F1E8] flex items-center justify-center shrink-0">
                    <Zap className="w-4 h-4 text-[#A9B4CC]" />
                  </div>
                  <span className="font-normal leading-snug">Power & Generator Outages</span>
                </div>
                <IosToggle
                  checked={prefs.powerOutages}
                  onChange={(val) => updatePref("powerOutages", val)}
                  ariaLabel="Toggle Power Outages"
                  id="toggle-power-outages"
                />
              </div>

              {/* Row 2 */}
              <div className="border-t border-[#2B3854] ml-4" />
              <div className="px-4 py-3.5 flex items-center justify-between text-[15px] text-[#F5F1E8]">
                <div className="flex items-center gap-3 pr-2">
                  <div className="w-7 h-7 rounded-lg bg-[#1C2740]/50 text-[#F5F1E8] flex items-center justify-center shrink-0">
                    <Droplets className="w-4 h-4 text-[#8FBF8A]" />
                  </div>
                  <span className="font-normal leading-snug">Municipal Water Supply Alerts</span>
                </div>
                <IosToggle
                  checked={prefs.waterSupply}
                  onChange={(val) => updatePref("waterSupply", val)}
                  ariaLabel="Toggle Water Supply Alerts"
                  id="toggle-water-supply"
                />
              </div>

              {/* Row 3 */}
              <div className="border-t border-[#2B3854] ml-4" />
              <div className="px-4 py-3.5 flex items-center justify-between text-[15px] text-[#F5F1E8]">
                <div className="flex items-center gap-3 pr-2">
                  <div className="w-7 h-7 rounded-lg bg-[#1C2740]/50 text-[#F5F1E8] flex items-center justify-center shrink-0">
                    <ArrowUpDown className="w-4 h-4 text-[#A6ACC0]" />
                  </div>
                  <span className="font-normal leading-snug">Lift & Elevator Maintenance</span>
                </div>
                <IosToggle
                  checked={prefs.liftMaintenance}
                  onChange={(val) => updatePref("liftMaintenance", val)}
                  ariaLabel="Toggle Lift Maintenance"
                  id="toggle-lift-maintenance"
                />
              </div>
            </div>
            <div className="text-[12px] text-[#A6ACC0]/80 px-5 pt-1.5 pb-1 leading-relaxed">
              Critical infrastructure alerts deliver instant audible push notifications regardless of quiet hours.
            </div>
          </div>

          {/* GROUP 2: GOVERNANCE & NOTICES */}
          <div>
            <div className="text-[13px] font-medium text-[#A6ACC0] px-5 pt-4 pb-1 uppercase tracking-wide">
              Governance & Notices
            </div>
            <div className="mx-4 my-1 bg-[#161F30] rounded-2xl border border-[#2B3854] overflow-hidden shadow-sm">
              {/* Row 1 */}
              <div className="px-4 py-3.5 flex items-center justify-between text-[15px] text-[#F5F1E8]">
                <div className="flex items-center gap-3 pr-2">
                  <div className="w-7 h-7 rounded-lg bg-[#1C2740]/50 text-[#F5F1E8] flex items-center justify-center shrink-0">
                    <FileText className="w-4 h-4 text-[#F5F1E8]" />
                  </div>
                  <span className="font-normal leading-snug">New Official Circulars</span>
                </div>
                <IosToggle
                  checked={prefs.officialCirculars}
                  onChange={(val) => updatePref("officialCirculars", val)}
                  ariaLabel="Toggle Official Circulars"
                  id="toggle-official-circulars"
                />
              </div>

              {/* Row 2 */}
              <div className="border-t border-[#2B3854] ml-4" />
              <div className="px-4 py-3.5 flex items-center justify-between text-[15px] text-[#F5F1E8]">
                <div className="flex items-center gap-3 pr-2">
                  <div className="w-7 h-7 rounded-lg bg-[#1C2740]/50 text-[#F5F1E8] flex items-center justify-center shrink-0">
                    <Users className="w-4 h-4 text-[#A6ACC0]" />
                  </div>
                  <span className="font-normal leading-snug">AGM & Committee Minutes</span>
                </div>
                <IosToggle
                  checked={prefs.agmMinutes}
                  onChange={(val) => updatePref("agmMinutes", val)}
                  ariaLabel="Toggle AGM Minutes"
                  id="toggle-agm-minutes"
                />
              </div>

              {/* Row 3: Navigation row for Alert Preview */}
              <div className="border-t border-[#2B3854] ml-4" />
              <button
                type="button"
                onClick={() => setPreviewSheetOpen(true)}
                className="w-full px-4 py-3.5 flex items-center justify-between text-[15px] text-[#F5F1E8] hover:bg-[#1C2740]/30 transition text-left cursor-pointer"
                id="row-show-alert-preview"
              >
                <div className="flex items-center gap-3 pr-2">
                  <div className="w-7 h-7 rounded-lg bg-[#1C2740]/50 text-[#F5F1E8] flex items-center justify-center shrink-0">
                    <Sparkles className="w-4 h-4 text-[#F5F1E8]" />
                  </div>
                  <span className="font-normal leading-snug">Show Alert Preview</span>
                </div>
                <span className="text-[#A6ACC0] flex items-center gap-1 text-[14px]">
                  {prefs.alertPreviewMode === "summary_decisions"
                    ? "Summary & Decisions"
                    : prefs.alertPreviewMode === "full_notice"
                    ? "Full Notice"
                    : "Urgent Banner"}
                  <ChevronRight className="w-4 h-4" />
                </span>
              </button>
            </div>
            <div className="text-[12px] text-[#A6ACC0]/80 px-5 pt-1.5 pb-1 leading-relaxed">
              Notices and meeting summaries will appear with AI-translated key decision bullet points.
            </div>
          </div>

          {/* GROUP 3: SOCIETY BILLING & AMENITIES */}
          <div>
            <div className="text-[13px] font-medium text-[#A6ACC0] px-5 pt-4 pb-1 uppercase tracking-wide">
              Society Billing & Amenities
            </div>
            <div className="mx-4 my-1 bg-[#161F30] rounded-2xl border border-[#2B3854] overflow-hidden shadow-sm">
              {/* Row 1 */}
              <div className="px-4 py-3.5 flex items-center justify-between text-[15px] text-[#F5F1E8]">
                <div className="flex items-center gap-3 pr-2">
                  <div className="w-7 h-7 rounded-lg bg-[#1C2740]/50 text-[#F5F1E8] flex items-center justify-center shrink-0">
                    <CreditCard className="w-4 h-4 text-[#A9B4CC]" />
                  </div>
                  <span className="font-normal leading-snug">Maintenance Due Reminders</span>
                </div>
                <IosToggle
                  checked={prefs.maintenanceReminders}
                  onChange={(val) => updatePref("maintenanceReminders", val)}
                  ariaLabel="Toggle Maintenance Due Reminders"
                  id="toggle-maintenance-reminders"
                />
              </div>

              {/* Row 2 */}
              <div className="border-t border-[#2B3854] ml-4" />
              <div className="px-4 py-3.5 flex items-center justify-between text-[15px] text-[#F5F1E8]">
                <div className="flex items-center gap-3 pr-2">
                  <div className="w-7 h-7 rounded-lg bg-[#1C2740]/50 text-[#F5F1E8] flex items-center justify-center shrink-0">
                    <FileCheck className="w-4 h-4 text-[#8FBF8A]" />
                  </div>
                  <span className="font-normal leading-snug">Document & NOC Approvals</span>
                </div>
                <IosToggle
                  checked={prefs.documentApprovals}
                  onChange={(val) => updatePref("documentApprovals", val)}
                  ariaLabel="Toggle Document & NOC Approvals"
                  id="toggle-doc-approvals"
                />
              </div>

              {/* Row 3 */}
              <div className="border-t border-[#2B3854] ml-4" />
              <div className="px-4 py-3.5 flex items-center justify-between text-[15px] text-[#F5F1E8]">
                <div className="flex items-center gap-3 pr-2">
                  <div className="w-7 h-7 rounded-lg bg-[#1C2740]/50 text-[#F5F1E8] flex items-center justify-center shrink-0">
                    <Calendar className="w-4 h-4 text-[#A6ACC0]" />
                  </div>
                  <span className="font-normal leading-snug">Clubhouse & Ground Bookings</span>
                </div>
                <IosToggle
                  checked={prefs.facilityBookings}
                  onChange={(val) => updatePref("facilityBookings", val)}
                  ariaLabel="Toggle Clubhouse & Ground Bookings"
                  id="toggle-facility-bookings"
                />
              </div>
            </div>
          </div>

          {/* GROUP 4: PREFERENCES */}
          <div>
            <div className="text-[13px] font-medium text-[#A6ACC0] px-5 pt-4 pb-1 uppercase tracking-wide">
              Preferences
            </div>
            <div className="mx-4 my-1 bg-[#161F30] rounded-2xl border border-[#2B3854] overflow-hidden shadow-sm">
              {/* Row 1: Notification Sound Navigation */}
              <button
                type="button"
                onClick={() => setSoundSheetOpen(true)}
                className="w-full px-4 py-3.5 flex items-center justify-between text-[15px] text-[#F5F1E8] hover:bg-[#1C2740]/30 transition text-left cursor-pointer"
                id="row-notification-sound"
              >
                <div className="flex items-center gap-3 pr-2">
                  <div className="w-7 h-7 rounded-lg bg-[#1C2740]/50 text-[#F5F1E8] flex items-center justify-center shrink-0">
                    <Volume2 className="w-4 h-4 text-[#F5F1E8]" />
                  </div>
                  <span className="font-normal leading-snug">Notification Sound</span>
                </div>
                <span className="text-[#A6ACC0] flex items-center gap-1 text-[14px]">
                  {prefs.soundType} <ChevronRight className="w-4 h-4" />
                </span>
              </button>

              {/* Row 2 */}
              <div className="border-t border-[#2B3854] ml-4" />
              <div className="px-4 py-3.5 flex items-center justify-between text-[15px] text-[#F5F1E8]">
                <div className="flex items-center gap-3 pr-2">
                  <div className="w-7 h-7 rounded-lg bg-[#1C2740]/50 text-[#F5F1E8] flex items-center justify-center shrink-0">
                    <span className="text-xs font-bold font-mono">📳</span>
                  </div>
                  <span className="font-normal leading-snug">Vibrate On Delivery</span>
                </div>
                <IosToggle
                  checked={prefs.vibrate}
                  onChange={(val) => updatePref("vibrate", val)}
                  ariaLabel="Toggle Vibrate On Delivery"
                  id="toggle-vibrate"
                />
              </div>
            </div>
          </div>

          {/* GROUP 5: SYSTEM ACTIONS */}
          <div className="space-y-3 pt-2">
            {/* Separate Card 1: Send Test Society Notification */}
            <div className="mx-4 bg-[#161F30] rounded-2xl border border-[#2B3854] overflow-hidden shadow-sm">
              <button
                type="button"
                onClick={handleSendTestNotification}
                className="w-full py-3.5 text-center text-[#F5F1E8] font-medium hover:bg-[#1C2740]/40 active:scale-[0.99] transition cursor-pointer text-[15px]"
                id="btn-send-test-notification"
              >
                Send Test Society Notification
              </button>
            </div>

            {/* Separate Card 2: Reset All Notification Preferences */}
            <div className="mx-4 bg-[#161F30] rounded-2xl border border-[#2B3854] overflow-hidden shadow-sm">
              <button
                type="button"
                onClick={() => setResetConfirmOpen(true)}
                className="w-full py-3.5 text-center text-[#E2685B] font-medium hover:bg-[#2A1418]/40 active:scale-[0.99] transition cursor-pointer text-[15px]"
                id="btn-reset-notification-prefs"
              >
                Reset All Notification Preferences
              </button>
            </div>
          </div>
        </div>

        {/* MODAL 1: Notification Sound Picker Sheet */}
        {soundSheetOpen && (
          <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-0 sm:p-4 bg-black/75 backdrop-blur-sm animate-fade-in">
            <div className="modal-pop-in w-full max-w-sm bg-[#161F30] border border-[#2B3854] rounded-t-3xl sm:rounded-2xl p-5 space-y-4 shadow-sm">
              <div className="flex items-center justify-between border-b border-[#2B3854] pb-3">
                <h3 className="text-base font-bold text-[#F5F1E8]">Notification Sound</h3>
                <button
                  onClick={() => setSoundSheetOpen(false)}
                  className="w-8 h-8 rounded-full bg-[#1C2740]/50 text-[#A6ACC0] hover:text-[#F5F1E8] flex items-center justify-center"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>

              <div className="space-y-1">
                {SOUND_OPTIONS.map((snd) => {
                  const isSelected = prefs.soundType === snd;
                  return (
                    <button
                      key={snd}
                      onClick={() => {
                        updatePref("soundType", snd);
                        playSoundPreview(snd);
                      }}
                      className={`w-full px-3.5 py-3 rounded-xl flex items-center justify-between transition text-left cursor-pointer ${
                        isSelected
                          ? "bg-[#1C2740]/60 text-[#F5F1E8] font-bold"
                          : "text-[#A6ACC0] hover:text-[#F5F1E8] hover:bg-[#1C2740]/30"
                      }`}
                    >
                      <span className="text-sm">{snd}</span>
                      {isSelected && <Check className="w-4 h-4 text-[#4EBA86]" />}
                    </button>
                  );
                })}
              </div>

              <button
                onClick={() => setSoundSheetOpen(false)}
                className="w-full py-3 bg-[#E8B565] hover:bg-[#F0C87D] text-[#0E1420] font-bold rounded-xl text-xs shadow-sm transition"
              >
                Done
              </button>
            </div>
          </div>
        )}

        {/* MODAL 2: Alert Preview Mode Picker Sheet */}
        {previewSheetOpen && (
          <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-0 sm:p-4 bg-black/75 backdrop-blur-sm animate-fade-in">
            <div className="modal-pop-in w-full max-w-sm bg-[#161F30] border border-[#2B3854] rounded-t-3xl sm:rounded-2xl p-5 space-y-4 shadow-sm">
              <div className="flex items-center justify-between border-b border-[#2B3854] pb-3">
                <h3 className="text-base font-bold text-[#F5F1E8]">Show Alert Preview</h3>
                <button
                  onClick={() => setPreviewSheetOpen(false)}
                  className="w-8 h-8 rounded-full bg-[#1C2740]/50 text-[#A6ACC0] hover:text-[#F5F1E8] flex items-center justify-center"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>

              <div className="space-y-2">
                {PREVIEW_OPTIONS.map((opt) => {
                  const isSelected = prefs.alertPreviewMode === opt.id;
                  return (
                    <button
                      key={opt.id}
                      onClick={() => {
                        updatePref("alertPreviewMode", opt.id);
                      }}
                      className={`w-full p-3 rounded-xl flex items-start justify-between gap-2 transition text-left cursor-pointer border ${
                        isSelected
                          ? "bg-[#1C2740]/60 border-[#E8B565]/30 text-[#F5F1E8]"
                          : "bg-[#0E1420]/50 border-transparent text-[#A6ACC0] hover:text-[#F5F1E8]"
                      }`}
                    >
                      <div>
                        <div className="text-sm font-bold text-[#F5F1E8]">{opt.label}</div>
                        <div className="text-[11px] text-[#A6ACC0] mt-0.5">{opt.desc}</div>
                      </div>
                      {isSelected && <Check className="w-4 h-4 text-[#4EBA86] shrink-0 mt-0.5" />}
                    </button>
                  );
                })}
              </div>

              <button
                onClick={() => setPreviewSheetOpen(false)}
                className="w-full py-3 bg-[#E8B565] hover:bg-[#F0C87D] text-[#0E1420] font-bold rounded-xl text-xs shadow-sm transition"
              >
                Done
              </button>
            </div>
          </div>
        )}

        {/* MODAL 3: Reset Confirmation Dialog */}
        {resetConfirmOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/75 backdrop-blur-sm animate-fade-in">
            <div className="modal-pop-in w-full max-w-sm bg-[#161F30] border border-[#2B3854] rounded-2xl p-5 space-y-4 shadow-sm text-center">
              <div className="w-12 h-12 rounded-2xl bg-[#2A1418] text-[#E2685B] border border-[#E2685B]/30 flex items-center justify-center mx-auto">
                <AlertTriangle className="w-6 h-6" />
              </div>
              <div>
                <h3 className="text-base font-bold text-[#F5F1E8]">Reset All Preferences?</h3>
                <p className="text-xs text-[#A6ACC0] mt-1.5 leading-relaxed">
                  All alert switches, chime sounds, and preview rules will be restored to their society default settings.
                </p>
              </div>

              <div className="grid grid-cols-2 gap-2 pt-1">
                <button
                  type="button"
                  onClick={() => setResetConfirmOpen(false)}
                  className="py-2.5 rounded-xl bg-[#1C2740]/50 text-[#A6ACC0] hover:text-[#F5F1E8] text-xs font-semibold"
                >
                  Cancel
                </button>
                <button
                  type="button"
                  onClick={handleResetPreferences}
                  className="py-2.5 rounded-xl bg-[#2A1418] text-[#E2685B] border border-[#E2685B]/30 hover:bg-[#2A1418]/80 text-xs font-bold"
                  id="btn-confirm-reset-prefs"
                >
                  Reset Defaults
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
