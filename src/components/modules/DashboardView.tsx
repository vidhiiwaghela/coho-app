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
} from "lucide-react";

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
  onOpenAdminRequests?: () => void;
  onOpenAdminComplaints?: () => void;
  onOpenAdminBookings?: () => void;
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
  const latestNotice = notices[0];

  const activeReminder = !isAdmin
    ? notifications.find(
        (n) => n.flatNumber === currentUser.flatNumber && n.type === "due_reminder" && !n.read
      )
    : undefined;

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
      <div className="bg-[#111C2E] border border-[#22304A] rounded-2xl p-5 shadow-sm">
        <div className="flex items-center justify-between">
          <h1 className="text-xl font-bold text-[var(--text)] tracking-tight">
            {isAdmin ? "Managing Committee Console" : `Welcome, ${currentUser.residentName}`}
          </h1>
          <div className="text-right shrink-0">
            <span className="text-[10px] font-bold uppercase tracking-wider text-[#8C97AD] block">
              Billing Cycle
            </span>
            <span className="text-xs font-bold text-[#F3F5F9] mt-0.5 block">
              October 2026
            </span>
          </div>
        </div>
      </div>

      {/* 2. Action Buttons: Admin vs Member */}
      {isAdmin ? (
        <div className="px-4 py-2 w-full grid grid-cols-3 gap-3">
          <button
            onClick={onOpenAdminRequests}
            className="bg-[#111C2E] border border-[#22304A] rounded-2xl p-3.5 flex flex-col items-start justify-between hover:border-[#EFE4CC] hover:bg-[#16233A] transition-all cursor-pointer group text-left shadow-sm"
            id="btn-admin-view-requests"
          >
            <div className="w-9 h-9 rounded-xl bg-[#EFE4CC]/15 text-[#F3F5F9] flex items-center justify-center mb-2.5 group-hover:scale-110 transition-transform shrink-0">
              <FileText className="w-5 h-5" />
            </div>
            <div className="min-w-0 w-full">
              <div className="text-sm font-bold text-[#F3F5F9]">Doc Requests</div>
              <div className="text-xs text-[#F3F5F9] font-semibold truncate w-full">
                {pendingRequestsCount} Pending
              </div>
            </div>
          </button>

          <button
            onClick={onOpenAdminBookings}
            className="bg-[#111C2E] border border-[#22304A] rounded-2xl p-3.5 flex flex-col items-start justify-between hover:border-[#EFE4CC] hover:bg-[#16233A] transition-all cursor-pointer group text-left shadow-sm"
            id="btn-admin-view-bookings"
          >
            <div className="w-9 h-9 rounded-xl bg-[#EFE4CC]/15 text-[#F3F5F9] flex items-center justify-center mb-2.5 group-hover:scale-110 transition-transform shrink-0">
              <Calendar className="w-5 h-5" />
            </div>
            <div className="min-w-0 w-full">
              <div className="text-sm font-bold text-[#F3F5F9]">Bookings</div>
              <div className="text-xs text-[#F3F5F9] font-semibold truncate w-full">
                {pendingBookingsCount} Pending
              </div>
            </div>
          </button>

          <button
            onClick={onOpenAdminComplaints}
            className="bg-[#111C2E] border border-[#22304A] rounded-2xl p-3.5 flex flex-col items-start justify-between hover:border-[#EFE4CC] hover:bg-[#16233A] transition-all cursor-pointer group text-left shadow-sm"
            id="btn-admin-view-complaints"
          >
            <div className="w-9 h-9 rounded-xl bg-[#EFE4CC]/15 text-[#F3F5F9] flex items-center justify-center mb-2.5 group-hover:scale-110 transition-transform shrink-0">
              <AlertTriangle className="w-5 h-5" />
            </div>
            <div className="min-w-0 w-full">
              <div className="text-sm font-bold text-[#F3F5F9]">Complaints</div>
              <div className="text-xs text-[#F3F5F9] font-semibold truncate w-full">
                {pendingComplaintsCount} Active
              </div>
            </div>
          </button>
        </div>
      ) : (
        <div className="px-4 py-2 w-full grid grid-cols-3 gap-3">
          <button
            onClick={onRequestDocument}
            className="bg-[#111C2E] border border-[#22304A] rounded-2xl p-3.5 flex flex-col items-start justify-between hover:border-[#EFE4CC] hover:bg-[#16233A] transition-all cursor-pointer group text-left shadow-sm"
            id="btn-request-document"
          >
            <div className="w-9 h-9 rounded-xl bg-[#EFE4CC]/15 text-[#F3F5F9] flex items-center justify-center mb-2.5 group-hover:scale-110 transition-transform shrink-0">
              <FileText className="w-5 h-5" />
            </div>
            <div className="min-w-0 w-full">
              <div className="text-sm font-bold text-[#F3F5F9]">Document</div>
              <div className="text-xs text-[#8C97AD] truncate w-full">NOC, Certs</div>
            </div>
          </button>

          <button
            onClick={onBookFacility}
            className="bg-[#111C2E] border border-[#22304A] rounded-2xl p-3.5 flex flex-col items-start justify-between hover:border-[#EFE4CC] hover:bg-[#16233A] transition-all cursor-pointer group text-left shadow-sm"
            id="btn-book-facility"
          >
            <div className="w-9 h-9 rounded-xl bg-[#EFE4CC]/15 text-[#F3F5F9] flex items-center justify-center mb-2.5 group-hover:scale-110 transition-transform shrink-0">
              <Calendar className="w-5 h-5" />
            </div>
            <div className="min-w-0 w-full">
              <div className="text-sm font-bold text-[#F3F5F9]">Facility</div>
              <div className="text-xs text-[#8C97AD] truncate w-full">Clubhouse, Ground</div>
            </div>
          </button>

          <button
            onClick={onLodgeComplaint}
            className="bg-[#111C2E] border border-[#22304A] rounded-2xl p-3.5 flex flex-col items-start justify-between hover:border-[#EFE4CC] hover:bg-[#16233A] transition-all cursor-pointer group text-left shadow-sm"
            id="btn-lodge-complaint"
          >
            <div className="w-9 h-9 rounded-xl bg-[#EFE4CC]/15 text-[#F3F5F9] flex items-center justify-center mb-2.5 group-hover:scale-110 transition-transform shrink-0">
              <AlertTriangle className="w-5 h-5" />
            </div>
            <div className="min-w-0 w-full">
              <div className="text-sm font-bold text-[#F3F5F9]">Complaint</div>
              <div className="text-xs text-[#8C97AD] truncate w-full">Issue Ticket</div>
            </div>
          </button>
        </div>
      )}

      {/* 3. Active Requests & Activity Live Tracker Card */}
      <div className="bg-[#111C2E] rounded-2xl p-5 border border-[#22304A] shadow-sm space-y-3.5">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-7 h-7 rounded-lg bg-[#EFE4CC]/15 text-[#F3F5F9] flex items-center justify-center">
              <Clock className="w-4 h-4" />
            </div>
            <div>
              <h4 className="text-xs font-bold text-[#F3F5F9]">
                {isAdmin ? "Active Society Requests & Activity" : "Active Requests & Activity"}
              </h4>
              <p className="text-[10px] text-[#8C97AD]">
                {isAdmin
                  ? "Live queue across documents, facility bookings & member tickets"
                  : "Live tracking of your documents, facility bookings & complaints"}
              </p>
            </div>
          </div>
        </div>

        {/* Dynamic Activity List */}
        {(() => {
          const userDocRequests = isAdmin
            ? documentRequests
            : documentRequests.filter((r) => r.flatId === currentUser.id);
          const userBookings = isAdmin
            ? facilityBookings
            : facilityBookings.filter((b) => b.flatId === currentUser.id);
          const userComplaints = isAdmin
            ? complaints
            : complaints.filter((c) => c.flatId === currentUser.id);

          const items: {
            id: string;
            type: "doc" | "facility" | "complaint";
            title: string;
            subtitle: string;
            status: string;
            date: string;
          }[] = [
            ...userDocRequests.map((r) => ({
              id: r.id,
              type: "doc" as const,
              title: r.documentName,
              subtitle: `${isAdmin ? `Flat ${r.flatNumber} • ` : ""}${r.copyType === "digital" ? "Digital PDF" : "Physical Copy"}${r.note ? ` • ${r.note}` : ""}`,
              status: r.status,
              date: r.requestedAt,
            })),
            ...userBookings.map((b) => ({
              id: b.id,
              type: "facility" as const,
              title: `${b.facility} Booking`,
              subtitle: `${isAdmin ? `Flat ${b.flatNumber} • ` : ""}${b.date} • ${b.timeSlot.split("(")[0]} • ${b.purpose}`,
              status: b.status,
              date: b.createdAt,
            })),
            ...userComplaints.map((c) => ({
              id: c.id,
              type: "complaint" as const,
              title: `${c.categoryLabel}: ${c.description.slice(0, 32)}...`,
              subtitle: `${isAdmin ? `Flat ${c.flatNumber} • ` : ""}${c.adminResponse || "Ticket logged"}`,
              status: c.status,
              date: c.createdAt,
            })),
          ];

          if (items.length === 0) {
            return (
              <div className="bg-[#0A1120]/60 border border-[#22304A] rounded-xl p-4 text-center">
                <p className="text-xs text-[#8C97AD]">No active requests at the moment.</p>
                <p className="text-[10px] text-[#8C97AD]/60 mt-1">
                  Use the quick action buttons above to request documents, book facilities, or log maintenance tickets.
                </p>
              </div>
            );
          }

          return (
            <div className="space-y-2">
              {items.slice(0, 5).map((item) => (
                <div
                  key={item.id}
                  onClick={() => {
                    if (isAdmin) {
                      if (item.type === "doc") onOpenAdminRequests?.();
                      else if (item.type === "facility") onOpenAdminBookings?.();
                      else if (item.type === "complaint") onOpenAdminComplaints?.();
                    }
                  }}
                  className={`bg-[#0A1120]/70 border border-[#22304A] rounded-xl p-3 flex items-center justify-between gap-3 hover:border-[#EFE4CC]/40 transition-colors ${
                    isAdmin ? "cursor-pointer active:scale-[0.99]" : ""
                  }`}
                >
                  <div className="flex items-center gap-2.5 min-w-0">
                    <div className="w-8 h-8 rounded-lg bg-[#111C2E] border border-[#22304A] flex items-center justify-center shrink-0">
                      {item.type === "doc" ? (
                        <FileText className="w-4 h-4 text-[#F3F5F9]" />
                      ) : item.type === "facility" ? (
                        <Calendar className="w-4 h-4 text-[#F3F5F9]" />
                      ) : (
                        <AlertTriangle className="w-4 h-4 text-[#F3F5F9]" />
                      )}
                    </div>
                    <div className="min-w-0">
                      <div className="text-xs font-bold text-[#F3F5F9] truncate">
                        {item.title}
                      </div>
                      <div className="text-[10px] text-[#8C97AD] truncate">
                        {item.subtitle}
                      </div>
                    </div>
                  </div>

                  <span
                    className={`text-[10px] font-bold uppercase tracking-wider px-2.5 py-0.5 rounded-full border shrink-0 ${
                      item.status === "approved" || item.status === "fulfilled" || item.status === "resolved"
                        ? "text-[#4FD1A1] bg-[#111C2E] border-[#4FD1A1]/30"
                        : item.status === "rejected"
                        ? "text-[#F0736A] bg-[#2A1418] border-[#F0736A]/30"
                        : "text-[#A9B4CC] bg-[#111C2E] border-[#A9B4CC]/30"
                    }`}
                  >
                    {item.status.replace("_", " ")}
                  </span>
                </div>
              ))}
            </div>
          );
        })()}
      </div>

      {/* 4. Latest Urgent Announcement Broadcast Ticker */}
      {latestNotice && (
        <div
          onClick={() => onNavigate("notices")}
          className={`${
            latestNotice.category === "urgent"
              ? "bg-[#2A1418]/60 border-[#F0736A]/30 text-[#F0736A]"
              : "bg-[#111C2E] border-[#22304A] text-[#F3F5F9]"
          } border rounded-2xl p-4 flex flex-col justify-between overflow-hidden break-words cursor-pointer hover:opacity-90 transition-all shadow-sm`}
        >
          <div className="flex items-center justify-between mb-2">
            <div className={`flex items-center gap-1.5 font-bold text-xs ${latestNotice.category === "urgent" ? "text-[#F0736A]" : "text-[#F3F5F9]"}`}>
              <AlertTriangle className={`w-4 h-4 shrink-0 ${latestNotice.category === "urgent" ? "text-[#F0736A]" : "text-[#F3F5F9]"}`} />
              <span>LATEST NOTICE • {latestNotice.category.toUpperCase()}</span>
            </div>
            <span className={`text-[10px] font-medium shrink-0 ${latestNotice.category === "urgent" ? "text-[#F0736A]/80" : "text-[#8C97AD]"}`}>{latestNotice.postedAt}</span>
          </div>
          <h4 className={`text-sm font-bold leading-snug break-words ${latestNotice.category === "urgent" ? "text-[#F3F5F9]" : "text-[#F3F5F9]"}`}>{latestNotice.title}</h4>
          <p className={`text-xs mt-1.5 line-clamp-2 leading-relaxed break-words ${latestNotice.category === "urgent" ? "text-[#F0736A]/90" : "text-[#8C97AD]"}`}>{latestNotice.content}</p>
          <div className={`mt-2.5 flex items-center justify-between text-xs font-semibold ${latestNotice.category === "urgent" ? "text-[#F0736A]" : "text-[#F3F5F9]"}`}>
            <span className="text-[11px] underline">Read in Hindi/Marathi & details</span>
            <ChevronRight className="w-3.5 h-3.5" />
          </div>
        </div>
      )}

      {/* 6. Flat Profile / Society Summary */}
      <div className="bg-[#111C2E] rounded-2xl p-4 border border-[#22304A] shadow-sm">
        <div className="text-xs font-bold uppercase tracking-wider text-[#8C97AD] mb-2.5">
          {isAdmin ? "Managing Committee RWA Registration" : "Flat Profile & Allocation"}
        </div>
        <div className="grid grid-cols-2 gap-3 text-xs">
          <div className="flex items-center gap-2 bg-[#16233A]/50 border border-transparent p-2.5 rounded-xl">
            <Car className="w-4 h-4 text-[#8C97AD]" />
            <div>
              <span className="text-[10px] text-[#8C97AD] block">
                {isAdmin ? "Office Wing" : "Assigned Parking"}
              </span>
              <span className="font-bold text-[#F3F5F9] text-[11px] truncate block">
                {currentUser.parkingSlot}
              </span>
            </div>
          </div>
          <div className="flex items-center gap-2 bg-[#16233A]/50 border border-transparent p-2.5 rounded-xl">
            <Calendar className="w-4 h-4 text-[#8C97AD]" />
            <div>
              <span className="text-[10px] text-[#8C97AD] block">
                {isAdmin ? "RWA Registration" : "Possession Since"}
              </span>
              <span className="font-bold text-[#F3F5F9] text-[11px]">
                {isAdmin ? "Reg: BOM/HSG/2012/981" : currentUser.possessionDate}
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* 7. Emergency Society Contacts */}
      <div className="bg-[#111C2E] border border-[#22304A] rounded-2xl p-4 flex items-center justify-between shadow-sm">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-full bg-[#EFE4CC]/15 flex items-center justify-center text-[#F3F5F9]">
            <PhoneCall className="w-4 h-4" />
          </div>
          <div>
            <div className="text-xs font-bold text-[#F3F5F9]">Emergency Gate & Security</div>
            <div className="text-[11px] text-[#8C97AD]">Main Gate: Ext 101 • Facility Mgr: +91 98200 01122</div>
          </div>
        </div>
        <a
          href="tel:101"
          className="bg-[#EFE4CC] hover:bg-[#F7F0DF] text-[#0A1120] text-[11px] font-bold px-3.5 py-1.5 rounded-xl shadow-sm transition-all"
        >
          Call
        </a>
      </div>
    </div>
  );
};
