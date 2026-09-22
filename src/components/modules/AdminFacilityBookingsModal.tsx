"use client";

import React, { useState } from "react";
import { FacilityBooking } from "../../types";
import {
  Calendar,
  Clock,
  X,
  CheckCircle2,
  XCircle,
  Building,
  User,
  Filter,
} from "lucide-react";

interface AdminFacilityBookingsModalProps {
  isOpen: boolean;
  onClose: () => void;
  bookings: FacilityBooking[];
  onUpdateStatus: (
    bookingId: string,
    status: "approved" | "rejected",
    adminNotes?: string
  ) => void;
  initialFilter?: "all" | "pending" | "approved" | "rejected";
  isAdmin?: boolean;
  onBookNewFacility?: () => void;
}

export const AdminFacilityBookingsModal: React.FC<
  AdminFacilityBookingsModalProps
> = ({
  isOpen,
  onClose,
  bookings,
  onUpdateStatus,
  initialFilter = "all",
  isAdmin = true,
  onBookNewFacility,
}) => {
  const [filter, setFilter] = useState<"all" | "pending" | "approved" | "rejected">(initialFilter);
  const [respondingId, setRespondingId] = useState<string | null>(null);
  const [adminNote, setAdminNote] = useState<string>("");

  React.useEffect(() => {
    if (initialFilter) {
      setFilter(initialFilter);
    }
  }, [initialFilter, isOpen]);

  if (!isOpen) return null;

  const filteredBookings = bookings.filter((b) => {
    if (filter === "all") return true;
    return b.status === filter;
  });

  const pendingCount = bookings.filter((b) => b.status === "pending").length;

  const handleAction = (bookingId: string, status: "approved" | "rejected") => {
    onUpdateStatus(bookingId, status, adminNote.trim() || undefined);
    setRespondingId(null);
    setAdminNote("");
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-fade-in">
      <div className="modal-pop-in w-full max-w-lg bg-[#161F30] border border-[#2B3854] rounded-2xl shadow-sm p-6 relative text-[#F5F1E8] overflow-hidden max-h-[85vh] flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between pb-3 border-b border-[#2B3854] mb-3 shrink-0">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-xl bg-[#E8B565]/15 text-[#F5F1E8] flex items-center justify-center shrink-0">
              <Calendar className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="text-base font-extrabold text-[#F5F1E8]">
                  {isAdmin ? "Facility Booking Queue" : "My Facility Bookings"}
                </h3>
                {pendingCount > 0 && (
                  <span className="text-[#A9B4CC] bg-[#161F30] border border-[#A9B4CC]/30 text-[10px] font-bold px-2 py-0.5 rounded-full">
                    {pendingCount} Pending
                  </span>
                )}
              </div>
              <p className="text-[11px] text-[#A6ACC0]">
                {isAdmin
                  ? "Managing Committee approval console for Clubhouse, Ground & Halls"
                  : "Track your reservations for Clubhouse, Hall & Ground"}
              </p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            {!isAdmin && onBookNewFacility && (
              <button
                type="button"
                onClick={() => {
                  onClose();
                  onBookNewFacility();
                }}
                className="bg-[#E8B565] hover:bg-[#F0C87D] text-[#0E1420] font-bold text-xs px-3 py-1.5 rounded-xl shadow-sm transition active:scale-95 shrink-0 cursor-pointer"
              >
                + New Booking
              </button>
            )}
            <button
              onClick={onClose}
              className="w-8 h-8 rounded-full bg-[#1C2740] border border-[#2B3854] text-[#A6ACC0] hover:text-[#F5F1E8] flex items-center justify-center transition-all cursor-pointer"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Filter Pills */}
        <div className="flex items-center gap-1.5 pb-3 border-b border-[#2B3854] mb-3 shrink-0 overflow-x-auto no-scrollbar">
          {(["all", "pending", "approved", "rejected"] as const).map((tab) => (
            <button
              key={tab}
              onClick={() => setFilter(tab)}
              className={`text-[11px] font-bold px-3 py-1.5 rounded-full transition-all capitalize whitespace-nowrap cursor-pointer ${
                filter === tab
                  ? "bg-[#E8B565] text-[#0E1420] font-bold shadow-sm"
                  : "bg-[#161F30] text-[#A6ACC0] border border-[#2B3854] hover:border-[#2B3854] hover:text-[#F5F1E8]"
              }`}
            >
              {tab === "all"
                ? `All (${bookings.length})`
                : `${tab.charAt(0).toUpperCase() + tab.slice(1)} (${bookings.filter((b) => b.status === tab).length})`}
            </button>
          ))}
        </div>

        {/* Bookings List */}
        <div className="flex-1 overflow-y-auto space-y-3 pr-1">
          {filteredBookings.length === 0 ? (
            <div className="py-12 text-center text-[#A6ACC0] text-xs">
              No facility bookings found in this category.
            </div>
          ) : (
            filteredBookings.map((b) => (
              <div
                key={b.id}
                className="bg-[#0E1420]/70 border border-[#2B3854] rounded-xl p-4 space-y-2.5"
              >
                <div className="flex items-start justify-between gap-2">
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="text-xs font-black text-[#F5F1E8]">
                        {b.facility}
                      </span>
                      <span className="text-[11px] bg-[#1C2740] text-[#F5F1E8] px-2 py-0.5 rounded-md font-bold">
                        Flat {b.flatNumber}
                      </span>
                    </div>
                    <span className="text-[11px] text-[#A6ACC0] block mt-0.5">
                      {b.residentName} • Requested on {b.createdAt}
                    </span>
                  </div>

                  <span
                    className={`text-[10px] font-bold uppercase tracking-wider px-2.5 py-0.5 rounded-full border shrink-0 ${
                      b.status === "approved"
                        ? "text-[#8FBF8A] bg-[#161F30] border-[#8FBF8A]/30"
                        : b.status === "rejected"
                        ? "text-[#E2685B] bg-[#2A1418] border-[#E2685B]/30"
                        : "text-[#A9B4CC] bg-[#161F30] border-[#A9B4CC]/30"
                    }`}
                  >
                    {b.status}
                  </span>
                </div>

                {/* Event Date & Slot */}
                <div className="grid grid-cols-2 gap-2 text-[11px] bg-[#161F30] p-2 rounded-lg border border-[#2B3854]">
                  <div className="flex items-center gap-1.5 text-[#F5F1E8]">
                    <Calendar className="w-3.5 h-3.5 text-[#F5F1E8]" />
                    <span>{b.date}</span>
                  </div>
                  <div className="flex items-center gap-1.5 text-[#A6ACC0]">
                    <Clock className="w-3.5 h-3.5 text-[#F5F1E8]" />
                    <span className="truncate">{b.timeSlot.split("(")[0]}</span>
                  </div>
                </div>

                <div className="text-xs text-[#F5F1E8] bg-[#161F30]/60 p-2 rounded-lg border border-[#2B3854]">
                  <span className="text-[#A6ACC0] block text-[10px] font-semibold">
                    Purpose:
                  </span>
                  {b.purpose}
                </div>

                {b.adminNotes && (
                  <div className="text-[11px] text-[#F5F1E8] bg-[#E8B565]/10 border border-[#E8B565]/20 p-2 rounded-lg">
                    <span className="font-bold">MC Note: </span>
                    {b.adminNotes}
                  </div>
                )}

                {/* Action buttons if Pending */}
                {b.status === "pending" && (
                  <div className="pt-1">
                    {!isAdmin ? (
                      <div className="text-[11px] text-[#A6ACC0] bg-[#161F30] p-2.5 rounded-xl border border-[#2B3854]">
                        Reservation submitted. Awaiting Managing Committee review & slot confirmation.
                      </div>
                    ) : respondingId === b.id ? (
                      <div className="space-y-2 bg-[#161F30] p-2.5 rounded-xl border border-[#2B3854]">
                        <input
                          type="text"
                          placeholder="Optional note (e.g. Deposit verified, volume limit)"
                          value={adminNote}
                          onChange={(e) => setAdminNote(e.target.value)}
                          className="w-full bg-[#0E1420] border border-[#2B3854] rounded-lg p-2 text-xs text-[#F5F1E8] focus:outline-none focus:border-[#E8B565]"
                        />
                        <div className="flex gap-2 justify-end">
                          <button
                            type="button"
                            onClick={() => setRespondingId(null)}
                            className="px-2.5 py-1 text-xs text-[#A6ACC0] hover:text-[#F5F1E8] cursor-pointer"
                          >
                            Cancel
                          </button>
                          <button
                            type="button"
                            onClick={() => handleAction(b.id, "rejected")}
                            className="px-3 py-1 text-xs font-bold bg-[#2A1418]/60 text-[#E2685B] border border-[#E2685B]/30 rounded-lg hover:bg-[#2A1418]/80 cursor-pointer"
                          >
                            Reject
                          </button>
                          <button
                            type="button"
                            onClick={() => handleAction(b.id, "approved")}
                            className="px-3 py-1 text-xs font-bold bg-[#161F30] text-[#8FBF8A] border border-[#8FBF8A]/30 rounded-lg hover:opacity-90 cursor-pointer"
                          >
                            Approve
                          </button>
                        </div>
                      </div>
                    ) : (
                      <div className="flex items-center gap-2 justify-end">
                        <button
                          onClick={() => {
                            setRespondingId(b.id);
                            setAdminNote("");
                          }}
                          className="px-3 py-1.5 rounded-lg bg-[#E8B565] hover:bg-[#F0C87D] text-[#0E1420] text-xs font-bold transition-all shadow-sm cursor-pointer"
                        >
                          Review & Decide
                        </button>
                      </div>
                    )}
                  </div>
                )}
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
};
