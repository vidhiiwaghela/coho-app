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
}

export const AdminFacilityBookingsModal: React.FC<
  AdminFacilityBookingsModalProps
> = ({ isOpen, onClose, bookings, onUpdateStatus }) => {
  const [filter, setFilter] = useState<"all" | "pending" | "approved" | "rejected">("all");
  const [respondingId, setRespondingId] = useState<string | null>(null);
  const [adminNote, setAdminNote] = useState<string>("");

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
      <div className="w-full max-w-lg bg-[#111C2E] border border-[#22304A] rounded-2xl shadow-sm p-6 relative text-[#F3F5F9] overflow-hidden max-h-[85vh] flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between pb-3 border-b border-[#22304A] mb-3 shrink-0">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-xl bg-[#EFE4CC]/15 text-[#F3F5F9] flex items-center justify-center">
              <Calendar className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="text-base font-extrabold text-[#F3F5F9]">
                  Facility Booking Queue
                </h3>
                {pendingCount > 0 && (
                  <span className="text-[#A9B4CC] bg-[#111C2E] border border-[#A9B4CC]/30 text-[10px] font-bold px-2 py-0.5 rounded-full">
                    {pendingCount} Pending
                  </span>
                )}
              </div>
              <p className="text-[11px] text-[#8C97AD]">
                Managing Committee approval console for Clubhouse, Ground & Halls
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="w-8 h-8 rounded-full bg-[#16233A] border border-[#22304A] text-[#8C97AD] hover:text-[#F3F5F9] flex items-center justify-center transition-all"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Filter Pills */}
        <div className="flex items-center gap-1.5 pb-3 border-b border-[#22304A] mb-3 shrink-0">
          {(["all", "pending", "approved", "rejected"] as const).map((tab) => (
            <button
              key={tab}
              onClick={() => setFilter(tab)}
              className={`text-[11px] font-bold px-3 py-1.5 rounded-full transition-all capitalize ${
                filter === tab
                  ? "bg-[#EFE4CC] text-[#0A1120] font-bold shadow-sm"
                  : "bg-[#111C2E] text-[#8C97AD] border border-[#22304A] hover:border-[#22304A] hover:text-[#F3F5F9]"
              }`}
            >
              {tab}
            </button>
          ))}
        </div>

        {/* Bookings List */}
        <div className="flex-1 overflow-y-auto space-y-3 pr-1">
          {filteredBookings.length === 0 ? (
            <div className="py-12 text-center text-[#8C97AD] text-xs">
              No facility bookings found in this category.
            </div>
          ) : (
            filteredBookings.map((b) => (
              <div
                key={b.id}
                className="bg-[#0A1120]/70 border border-[#22304A] rounded-xl p-4 space-y-2.5"
              >
                <div className="flex items-start justify-between gap-2">
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="text-xs font-black text-[#F3F5F9]">
                        {b.facility}
                      </span>
                      <span className="text-[11px] bg-[#16233A] text-[#F3F5F9] px-2 py-0.5 rounded-md font-bold">
                        Flat {b.flatNumber}
                      </span>
                    </div>
                    <span className="text-[11px] text-[#8C97AD] block mt-0.5">
                      {b.residentName} • Requested on {b.createdAt}
                    </span>
                  </div>

                  <span
                    className={`text-[10px] font-bold uppercase tracking-wider px-2.5 py-0.5 rounded-full border shrink-0 ${
                      b.status === "approved"
                        ? "text-[#4FD1A1] bg-[#111C2E] border-[#4FD1A1]/30"
                        : b.status === "rejected"
                        ? "text-[#F0736A] bg-[#2A1418] border-[#F0736A]/30"
                        : "text-[#A9B4CC] bg-[#111C2E] border-[#A9B4CC]/30"
                    }`}
                  >
                    {b.status}
                  </span>
                </div>

                {/* Event Date & Slot */}
                <div className="grid grid-cols-2 gap-2 text-[11px] bg-[#111C2E] p-2 rounded-lg border border-[#22304A]">
                  <div className="flex items-center gap-1.5 text-[#F3F5F9]">
                    <Calendar className="w-3.5 h-3.5 text-[#F3F5F9]" />
                    <span>{b.date}</span>
                  </div>
                  <div className="flex items-center gap-1.5 text-[#8C97AD]">
                    <Clock className="w-3.5 h-3.5 text-[#F3F5F9]" />
                    <span className="truncate">{b.timeSlot.split("(")[0]}</span>
                  </div>
                </div>

                <div className="text-xs text-[#F3F5F9] bg-[#111C2E]/60 p-2 rounded-lg border border-[#22304A]">
                  <span className="text-[#8C97AD] block text-[10px] font-semibold">
                    Purpose:
                  </span>
                  {b.purpose}
                </div>

                {b.adminNotes && (
                  <div className="text-[11px] text-[#F3F5F9] bg-[#EFE4CC]/10 border border-[#EFE4CC]/20 p-2 rounded-lg">
                    <span className="font-bold">MC Note: </span>
                    {b.adminNotes}
                  </div>
                )}

                {/* Action buttons if Pending */}
                {b.status === "pending" && (
                  <div className="pt-1">
                    {respondingId === b.id ? (
                      <div className="space-y-2 bg-[#111C2E] p-2.5 rounded-xl border border-[#22304A]">
                        <input
                          type="text"
                          placeholder="Optional note (e.g. Deposit verified, volume limit)"
                          value={adminNote}
                          onChange={(e) => setAdminNote(e.target.value)}
                          className="w-full bg-[#0A1120] border border-[#22304A] rounded-lg p-2 text-xs text-[#F3F5F9] focus:outline-none focus:border-[#EFE4CC]"
                        />
                        <div className="flex gap-2 justify-end">
                          <button
                            type="button"
                            onClick={() => setRespondingId(null)}
                            className="px-2.5 py-1 text-xs text-[#8C97AD] hover:text-[#F3F5F9]"
                          >
                            Cancel
                          </button>
                          <button
                            type="button"
                            onClick={() => handleAction(b.id, "rejected")}
                            className="px-3 py-1 text-xs font-bold bg-[#2A1418]/60 text-[#F0736A] border border-[#F0736A]/30 rounded-lg hover:bg-[#2A1418]/80"
                          >
                            Reject
                          </button>
                          <button
                            type="button"
                            onClick={() => handleAction(b.id, "approved")}
                            className="px-3 py-1 text-xs font-bold bg-[#111C2E] text-[#4FD1A1] border border-[#4FD1A1]/30 rounded-lg hover:opacity-90"
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
                          className="px-3 py-1.5 rounded-lg bg-[#EFE4CC] hover:bg-[#F7F0DF] text-[#0A1120] text-xs font-bold transition-all shadow-sm"
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
