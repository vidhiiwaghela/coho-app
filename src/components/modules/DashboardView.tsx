"use client";

import React from "react";
import {
  FlatUser,
  MaintenanceBill,
  Notice,
  SocietyRule,
  ActiveTab,
  SponsorshipCampaign,
  DocumentRequest,
  ComplaintTicket,
  FacilityBooking,
  Notification,
} from "../../types";
import {
  FileText,
  ChevronRight,
  AlertTriangle,
  Car,
  Calendar,
  Clock,
  PhoneCall,
  X,
  Wallet,
  Bell,
  Sparkles,
} from "lucide-react";
import { StackedRequestsActivityChart } from "./StackedRequestsActivityChart";

interface DashboardViewProps {
  currentUser: FlatUser;
  bills: MaintenanceBill[];
  notices: Notice[];
  rules: SocietyRule[];
  sponsorships: SponsorshipCampaign[];
  documentRequests?: DocumentRequest[];
  complaints?: ComplaintTicket[];
  facilityBookings?: FacilityBooking[];
  notifications?: Notification[];
  onNavigate: (tab: ActiveTab) => void;
  onPayBillModal?: (bill: MaintenanceBill) => void;
  onRequestDocument?: () => void;
  onLodgeComplaint?: () => void;
  onBookFacility?: () => void;
  onOpenAdminRequests?: (filter?: "all" | "pending" | "fulfilled" | "unavailable" | "not_available") => void;
  onOpenAdminComplaints?: (filter?: "all" | "pending" | "in_progress" | "resolved") => void;
  onOpenAdminBookings?: (filter?: "all" | "pending" | "approved" | "rejected") => void;
  onDismissNotification?: (notificationId: string) => void;
  pendingRequestsCount?: number;
  pendingComplaintsCount?: number;
  pendingBookingsCount?: number;
}

export const DashboardView: React.FC<DashboardViewProps> = ({
  currentUser,
  bills,
  notices,
  rules,
  sponsorships,
  documentRequests = [],
  complaints = [],
  facilityBookings = [],
  notifications = [],
  onNavigate,
  onPayBillModal,
  onRequestDocument,
  onLodgeComplaint,
  onBookFacility,
  onOpenAdminRequests,
  onOpenAdminComplaints,
  onOpenAdminBookings,
  onDismissNotification,
  pendingRequestsCount = 0,
  pendingComplaintsCount = 0,
  pendingBookingsCount = 0,
}) => {
  const isAdmin = currentUser.role === "admin";

  const activeReminder = !isAdmin
    ? notifications.find(
        (n) => n.flatNumber === currentUser.flatNumber && n.type === "due_reminder" && !n.read
      )
    : undefined;

  const greeting = (() => {
    const hour = new Date().getHours();
    if (hour < 12) return "Good morning";
    if (hour < 17) return "Good afternoon";
    return "Good evening";
  })();

  const initials = isAdmin
    ? "MC"
    : currentUser.residentName
        .split(" ")
        .map((p) => p[0])
        .filter(Boolean)
        .slice(0, 2)
        .join("")
        .toUpperCase();

  const relevantBills = isAdmin
    ? bills
    : bills.filter((b) => b.flatId === currentUser.id);
  const duesOutstanding = relevantBills
    .filter((b) => b.status === "pending" || b.status === "overdue")
    .reduce((sum, b) => sum + b.totalAmount, 0);
  const urgentNoticeCount = notices.filter((n) => n.category === "urgent").length;

  return (
    <div className="space-y-5 pb-24 animate-fade-in">
      {/* 0. Payment Reminder Amber Notification Banner for Flat Owner/Resident */}
      {activeReminder && (
        <div
          className="bg-[var(--surface)] border border-[var(--border)] rounded-2xl p-4 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 animate-fade-in"
          id="banner-payment-reminder"
        >
          <div className="flex items-start gap-3 min-w-0">
            <span className="text-xl shrink-0 leading-none mt-0.5" role="img" aria-label="warning">
              ⚠️
            </span>
            <div>
              <h4 className="text-xs font-bold text-[var(--accent)]">
                Payment Reminder from Society Office
              </h4>
              <p className="text-xs text-[var(--text-secondary)] mt-0.5 leading-relaxed">
                Your maintenance dues of <span className="font-bold text-[var(--text)]">₹{activeReminder.amount ? activeReminder.amount.toLocaleString("en-IN") : "0"}</span> for <span className="font-bold text-[var(--text)]">{activeReminder.month || "this period"}</span> are pending. Please clear them by the due date.
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2 w-full sm:w-auto shrink-0 justify-end">
            <button
              onClick={() => onNavigate("payments")}
              className="pill-btn bg-[var(--accent)] hover:bg-[var(--accent-hover)] text-[var(--on-accent)] text-xs font-bold px-3.5 py-1.5 rounded-full flex items-center gap-1 transition-all"
              id="btn-reminder-pay-now"
            >
              <span>Pay Now</span>
              <ChevronRight className="w-3.5 h-3.5" />
            </button>
            <button
              onClick={() => onDismissNotification?.(activeReminder.id)}
              className="pill-btn bg-transparent hover:bg-[var(--card)] text-[var(--text-secondary)] hover:text-[var(--text)] text-xs font-medium px-2.5 py-1.5 rounded-full border border-[var(--border)] transition-all flex items-center gap-1"
              id="btn-reminder-dismiss"
            >
              <X className="w-3.5 h-3.5" />
              <span>Dismiss</span>
            </button>
          </div>
        </div>
      )}

      {/* 1. Member Welcome & Society Header */}
      <div className="card-elevated relative overflow-hidden border border-[#2B3854] rounded-3xl p-6 bg-gradient-to-br from-[#1B2740] via-[#161F30] to-[#111827]">
        {/* Warm accent glow */}
        <div
          aria-hidden
          className="pointer-events-none absolute -top-16 -right-10 w-56 h-56 rounded-full blur-3xl"
          style={{ background: "radial-gradient(circle, rgba(232,181,101,0.24), transparent 70%)" }}
        />
        {/* Cool secondary glow */}
        <div
          aria-hidden
          className="pointer-events-none absolute -bottom-20 -left-12 w-56 h-56 rounded-full blur-3xl"
          style={{ background: "radial-gradient(circle, rgba(127,170,209,0.10), transparent 70%)" }}
        />
        {/* Hairline top highlight */}
        <div
          aria-hidden
          className="pointer-events-none absolute inset-x-0 top-0 h-px"
          style={{ background: "linear-gradient(90deg, transparent, rgba(255,255,255,0.14), transparent)" }}
        />
        {/* Fine dot-grid texture for depth */}
        <div
          aria-hidden
          className="pointer-events-none absolute inset-0 opacity-[0.05]"
          style={{
            backgroundImage: "radial-gradient(rgba(245,241,232,0.7) 1px, transparent 1px)",
            backgroundSize: "16px 16px",
          }}
        />

        <div className="relative z-10">
          <div className="flex items-start justify-between gap-3">
            <div className="flex items-center gap-3 min-w-0">
              <div className="accent-glow shrink-0 w-12 h-12 rounded-2xl bg-gradient-to-br from-[#E8B565] to-[#D9A24F] flex items-center justify-center text-[#14100A] font-extrabold text-sm tracking-tight">
                {initials}
              </div>
              <div className="min-w-0">
                <span className="text-[10px] font-bold uppercase tracking-wider text-[#A6ACC0] flex items-center gap-1">
                  <Sparkles className="w-3 h-3 text-[#E8B565]" />
                  {greeting}
                </span>
                <h1 className="text-xl font-extrabold text-[var(--text)] tracking-tight truncate">
                  {isAdmin ? "Managing Committee Console" : currentUser.residentName}
                </h1>
              </div>
            </div>
            <div className="text-right shrink-0">
              <span className="text-[10px] font-bold uppercase tracking-wider text-[#A6ACC0] block">
                Billing Cycle
              </span>
              <span className="text-xs font-bold text-[#F5F1E8] mt-0.5 block">
                October 2026
              </span>
            </div>
          </div>

          <div className="mt-4 pt-4 border-t border-white/[0.06] flex items-center justify-between">
            <div className="text-xs text-[#A6ACC0]">
              {isAdmin ? "Society Overview" : `Flat ${currentUser.flatNumber} • ${currentUser.isOwner ? "Owner" : "Resident"}`}
            </div>
            {duesOutstanding > 0 ? (
              <button
                onClick={() => onNavigate("payments")}
                className="tap-scale-soft flex items-center gap-1.5 text-[11px] font-bold text-[#E2A94D] bg-[#E2A94D]/10 border border-[#E2A94D]/25 rounded-full px-2.5 py-1"
              >
                <Wallet className="w-3 h-3" />
                ₹{duesOutstanding.toLocaleString("en-IN")} due
              </button>
            ) : (
              <span className="flex items-center gap-1.5 text-[11px] font-bold text-[#8FBF8A] bg-[#8FBF8A]/10 border border-[#8FBF8A]/25 rounded-full px-2.5 py-1">
                All dues clear
              </span>
            )}
          </div>
        </div>
      </div>

      {/* 1b. At-a-glance KPI strip */}
      <div className="grid grid-cols-2 gap-3">
        <button
          onClick={() => onNavigate("payments")}
          className="list-item-in tap-scale-soft text-left bg-[#161F30] border border-[#2B3854] rounded-2xl p-3 flex flex-col gap-2 hover:border-[#E8B565] hover:bg-[#1C2740] transition-all shadow-sm"
          style={{ "--stagger-delay": "0ms" } as React.CSSProperties}
        >
          <div className="w-7 h-7 rounded-lg bg-[#E2A94D]/15 text-[#E2A94D] flex items-center justify-center">
            <Wallet className="w-3.5 h-3.5" />
          </div>
          <div>
            <div className="text-base font-extrabold text-[#F5F1E8] leading-none">
              ₹{duesOutstanding > 999 ? `${(duesOutstanding / 1000).toFixed(1)}k` : duesOutstanding}
            </div>
            <div className="text-[10px] text-[#A6ACC0] mt-1 font-medium">Dues Due</div>
          </div>
        </button>

        <button
          onClick={() => onNavigate("notices")}
          className="list-item-in tap-scale-soft text-left bg-[#161F30] border border-[#2B3854] rounded-2xl p-3 flex flex-col gap-2 hover:border-[#E8B565] hover:bg-[#1C2740] transition-all shadow-sm"
          style={{ "--stagger-delay": "60ms" } as React.CSSProperties}
        >
          <div className="w-7 h-7 rounded-lg bg-[#E2685B]/15 text-[#E2685B] flex items-center justify-center">
            <Bell className="w-3.5 h-3.5" />
          </div>
          <div>
            <div className="text-base font-extrabold text-[#F5F1E8] leading-none">{urgentNoticeCount}</div>
            <div className="text-[10px] text-[#A6ACC0] mt-1 font-medium">Urgent Notices</div>
          </div>
        </button>
      </div>

      {/* 2. Action Bento Tiles: Consistent Styling for Admin & Resident */}
      {(() => {
        const userPendingDocCount = documentRequests.filter(
          (r) =>
            (r.flatId === currentUser.id || r.flatNumber === currentUser.flatNumber) &&
            r.status === "pending"
        ).length;
        const userPendingBookingCount = facilityBookings.filter(
          (b) =>
            (b.flatId === currentUser.id || b.flatNumber === currentUser.flatNumber) &&
            b.status === "pending"
        ).length;
        const userPendingComplaintCount = complaints.filter(
          (c) =>
            (c.flatId === currentUser.id || c.flatNumber === currentUser.flatNumber) &&
            c.status === "pending"
        ).length;

        const userDocRequests = isAdmin
          ? documentRequests
          : documentRequests.filter(
              (r) => r.flatId === currentUser.id || r.flatNumber === currentUser.flatNumber
            );
        const userBookings = isAdmin
          ? facilityBookings
          : facilityBookings.filter(
              (b) => b.flatId === currentUser.id || b.flatNumber === currentUser.flatNumber
            );
        const userComplaints = isAdmin
          ? complaints
          : complaints.filter(
              (c) => c.flatId === currentUser.id || c.flatNumber === currentUser.flatNumber
            );

        return (
          <>
            {!isAdmin && (
              <div className="px-4 py-2 w-full grid grid-cols-3 gap-3">
              {/* Doc Requests Tile */}
              <button
                onClick={() => onOpenAdminRequests?.("all")}
                className="list-item-in bg-[#161F30] border border-[#2B3854] rounded-2xl p-3.5 flex flex-col items-start justify-between hover:border-[#E8B565] hover:bg-[#1C2740] transition-all cursor-pointer group text-left shadow-sm min-h-[96px] active:scale-[0.98]"
                style={{ "--stagger-delay": "0ms" } as React.CSSProperties}
                id={isAdmin ? "btn-admin-view-requests" : "btn-request-document"}
              >
                <div className="w-9 h-9 rounded-xl bg-[#E8B565]/15 text-[#F5F1E8] border border-[#E8B565]/20 flex items-center justify-center mb-2.5 group-hover:scale-110 transition-transform shrink-0">
                  <FileText className="w-5 h-5" />
                </div>
                <div className="min-w-0 w-full">
                  <div className="text-sm font-bold text-[#F5F1E8]">Doc Requests</div>
                  <div className="text-xs truncate w-full">
                    {isAdmin ? (
                      <span className="text-[#F5F1E8] font-semibold">
                        {pendingRequestsCount} Pending
                      </span>
                    ) : userPendingDocCount > 0 ? (
                      <span className="text-[#F5F1E8] font-semibold">
                        {userPendingDocCount} Pending
                      </span>
                    ) : userDocRequests.some((r) => r.status === "unavailable" || r.status === "not_available") ? (
                      <span className="text-[#E2685B] font-semibold">
                        Not Available
                      </span>
                    ) : userDocRequests.length > 0 ? (
                      <span className="text-[#8FBF8A] font-semibold">
                        {userDocRequests.length} Active
                      </span>
                    ) : (
                      <span className="text-[#A6ACC0]">Request NOC</span>
                    )}
                  </div>
                </div>
              </button>

              {/* Facility Bookings Tile */}
              <button
                onClick={isAdmin ? () => onOpenAdminBookings?.() : onBookFacility}
                className="list-item-in bg-[#161F30] border border-[#2B3854] rounded-2xl p-3.5 flex flex-col items-start justify-between hover:border-[#E8B565] hover:bg-[#1C2740] transition-all cursor-pointer group text-left shadow-sm min-h-[96px] active:scale-[0.98]"
                style={{ "--stagger-delay": "60ms" } as React.CSSProperties}
                id={isAdmin ? "btn-admin-view-bookings" : "btn-book-facility"}
              >
                <div className="w-9 h-9 rounded-xl bg-[#E8B565]/15 text-[#F5F1E8] border border-[#E8B565]/20 flex items-center justify-center mb-2.5 group-hover:scale-110 transition-transform shrink-0">
                  <Calendar className="w-5 h-5" />
                </div>
                <div className="min-w-0 w-full">
                  <div className="text-sm font-bold text-[#F5F1E8]">Bookings</div>
                  <div className="text-xs truncate w-full">
                    {isAdmin ? (
                      <span className="text-[#F5F1E8] font-semibold">
                        {pendingBookingsCount} Pending
                      </span>
                    ) : userPendingBookingCount > 0 ? (
                      <span className="text-[#F5F1E8] font-semibold">
                        {userPendingBookingCount} Pending
                      </span>
                    ) : (
                      <span className="text-[#A6ACC0]">Reserve Hall</span>
                    )}
                  </div>
                </div>
              </button>

              {/* Complaints Tile */}
              <button
                onClick={isAdmin ? () => onOpenAdminComplaints?.() : onLodgeComplaint}
                className="list-item-in bg-[#161F30] border border-[#2B3854] rounded-2xl p-3.5 flex flex-col items-start justify-between hover:border-[#E8B565] hover:bg-[#1C2740] transition-all cursor-pointer group text-left shadow-sm min-h-[96px] active:scale-[0.98]"
                style={{ "--stagger-delay": "120ms" } as React.CSSProperties}
                id={isAdmin ? "btn-admin-view-complaints" : "btn-lodge-complaint"}
              >
                <div className="w-9 h-9 rounded-xl bg-[#E8B565]/15 text-[#F5F1E8] border border-[#E8B565]/20 flex items-center justify-center mb-2.5 group-hover:scale-110 transition-transform shrink-0">
                  <AlertTriangle className="w-5 h-5" />
                </div>
                <div className="min-w-0 w-full">
                  <div className="text-sm font-bold text-[#F5F1E8]">Complaints</div>
                  <div className="text-xs truncate w-full">
                    {isAdmin ? (
                      <span className="text-[#F5F1E8] font-semibold">
                        {pendingComplaintsCount} Active
                      </span>
                    ) : userPendingComplaintCount > 0 ? (
                      <span className="text-[#F5F1E8] font-semibold">
                        {userPendingComplaintCount} Active
                      </span>
                    ) : (
                      <span className="text-[#A6ACC0]">Raise Ticket</span>
                    )}
                  </div>
                </div>
              </button>
            </div>
            )}

            {/* 3. Stacked Requests & Activity Status Chart (Admin & Resident) */}
            <StackedRequestsActivityChart
              isAdmin={isAdmin}
              docRequests={userDocRequests}
              bookings={userBookings}
              complaints={userComplaints}
              onOpenDocRequests={(f) => onOpenAdminRequests?.(f)}
              onOpenBookings={(f) => onOpenAdminBookings?.(f)}
              onOpenComplaints={(f) => onOpenAdminComplaints?.(f)}
            />
          </>
        );
      })()}

      {/* 6. Flat Profile / Society Summary */}
      <div className="bg-[#161F30] rounded-2xl p-4 border border-[#2B3854] shadow-sm">
        <div className="text-xs font-bold uppercase tracking-wider text-[#A6ACC0] mb-2.5">
          {isAdmin ? "Managing Committee RWA Registration" : "Flat Profile & Allocation"}
        </div>
        <div className="grid grid-cols-2 gap-3 text-xs">
          <div className="flex items-center gap-2 bg-[#1C2740]/50 border border-transparent p-2.5 rounded-xl">
            <Car className="w-4 h-4 text-[#A6ACC0]" />
            <div>
              <span className="text-[10px] text-[#A6ACC0] block">
                {isAdmin ? "Office Wing" : "Assigned Parking"}
              </span>
              <span className="font-bold text-[#F5F1E8] text-[11px] truncate block">
                {currentUser.parkingSlot}
              </span>
            </div>
          </div>
          <div className="flex items-center gap-2 bg-[#1C2740]/50 border border-transparent p-2.5 rounded-xl">
            <Calendar className="w-4 h-4 text-[#A6ACC0]" />
            <div>
              <span className="text-[10px] text-[#A6ACC0] block">
                {isAdmin ? "RWA Registration" : "Possession Since"}
              </span>
              <span className="font-bold text-[#F5F1E8] text-[11px]">
                {isAdmin ? "Reg: BOM/HSG/2012/981" : currentUser.possessionDate}
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* 7. Emergency Society Contacts */}
      <div className="bg-[#161F30] border border-[#2B3854] rounded-2xl p-4 flex items-center justify-between shadow-sm">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-full bg-[#E8B565]/15 flex items-center justify-center text-[#F5F1E8]">
            <PhoneCall className="w-4 h-4" />
          </div>
          <div>
            <div className="text-xs font-bold text-[#F5F1E8]">Emergency Gate & Security</div>
            <div className="text-[11px] text-[#A6ACC0]">Main Gate: Ext 101 • Facility Mgr: +91 98200 01122</div>
          </div>
        </div>
        <a
          href="tel:101"
          className="tap-scale bg-[#E8B565] hover:bg-[#F0C87D] text-[#0E1420] text-[11px] font-bold px-3.5 py-1.5 rounded-xl shadow-sm transition-all"
        >
          Call
        </a>
      </div>
    </div>
  );
};
