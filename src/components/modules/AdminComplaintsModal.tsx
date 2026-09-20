"use client";

import React, { useState } from "react";
import { ComplaintTicket } from "../../types";
import {
  X,
  AlertCircle,
  Clock,
  CheckCircle2,
  RefreshCw,
  MessageSquare,
  Droplets,
  Zap,
  Volume2,
  Trash2,
} from "lucide-react";

interface AdminComplaintsModalProps {
  isOpen: boolean;
  onClose: () => void;
  complaints: ComplaintTicket[];
  onUpdateStatus: (
    ticketId: string,
    status: "pending" | "in_progress" | "resolved",
    adminResponse?: string
  ) => void;
}

export const AdminComplaintsModal: React.FC<AdminComplaintsModalProps> = ({
  isOpen,
  onClose,
  complaints,
  onUpdateStatus,
}) => {
  const [filter, setFilter] = useState<"all" | "pending" | "in_progress" | "resolved">("all");
  const [editingId, setEditingId] = useState<string | null>(null);
  const [responseNote, setResponseNote] = useState("");

  if (!isOpen) return null;

  const filteredComplaints = complaints.filter((c) => {
    if (filter === "all") return true;
    return c.status === filter;
  });

  const pendingCount = complaints.filter((c) => c.status === "pending").length;

  const handleSaveResponse = (ticketId: string, status: ComplaintTicket["status"]) => {
    onUpdateStatus(ticketId, status, responseNote.trim() || undefined);
    setEditingId(null);
    setResponseNote("");
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-fade-in">
      <div className="bg-[#111C2E] border border-[#22304A] rounded-2xl w-full max-w-xl shadow-sm p-6 relative animate-scale-up space-y-5 text-[#F3F5F9] max-h-[90vh] flex flex-col">
        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 text-[#8C97AD] hover:text-[#F3F5F9] p-1.5 rounded-full hover:bg-[#16233A] transition-colors"
          id="btn-close-admin-complaints-modal"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Modal Header */}
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-[#EFE4CC]/15 text-[#F3F5F9] border border-[#EFE4CC]/30 flex items-center justify-center shrink-0">
            <AlertCircle className="w-5 h-5" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h3 className="text-base font-bold text-[#F3F5F9]">
                Society Complaints & Tickets
              </h3>
              {pendingCount > 0 && (
                <span className="text-[#A9B4CC] bg-[#111C2E] border border-[#A9B4CC]/30 text-[10px] font-bold px-2 py-0.5 rounded-full">
                  {pendingCount} Pending
                </span>
              )}
            </div>
            <p className="text-xs text-[#8C97AD]">
              Review resident tickets & progress status
            </p>
          </div>
        </div>

        {/* Filter Pills */}
        <div className="flex items-center gap-1.5 overflow-x-auto no-scrollbar">
          {(["all", "pending", "in_progress", "resolved"] as const).map((f) => (
            <button
              key={f}
              onClick={() => setFilter(f)}
              className={`pill-btn text-xs font-bold px-3 py-1.5 rounded-full transition-all whitespace-nowrap ${
                filter === f
                  ? "bg-[#EFE4CC] text-[#0A1120] font-bold shadow-sm"
                  : "bg-[#111C2E] text-[#8C97AD] border border-[#22304A] hover:border-[#22304A] hover:text-[#F3F5F9]"
              }`}
            >
              {f === "all"
                ? `All (${complaints.length})`
                : f === "in_progress"
                ? `In Progress (${complaints.filter((c) => c.status === "in_progress").length})`
                : `${f.charAt(0).toUpperCase() + f.slice(1)} (${complaints.filter((c) => c.status === f).length})`}
            </button>
          ))}
        </div>

        {/* Complaints List */}
        <div className="flex-1 overflow-y-auto space-y-3 pr-1">
          {filteredComplaints.length > 0 ? (
            filteredComplaints.map((ticket) => {
              const isEditing = editingId === ticket.id;

              return (
                <div
                  key={ticket.id}
                  className="p-4 rounded-xl bg-[#16233A]/50 border border-transparent space-y-3 transition-all"
                >
                  <div className="flex items-start justify-between gap-2">
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="text-xs font-bold text-[#F3F5F9] bg-[#111C2E] border border-[#22304A] px-2 py-0.5 rounded-md">
                          Flat {ticket.flatNumber}
                        </span>
                        <span className="text-xs font-semibold text-[#8C97AD]">
                          {ticket.categoryLabel}
                        </span>
                      </div>
                      <p className="text-xs text-[#8C97AD] mt-1">
                        Reported by <strong>{ticket.residentName}</strong> • {ticket.createdAt}
                      </p>
                    </div>

                    {/* Status Badge */}
                    <span
                      className={`inline-flex items-center gap-1 text-[10px] font-bold px-2.5 py-0.5 rounded-full border shrink-0 ${
                        ticket.status === "pending" || ticket.status === "in_progress"
                          ? "text-[#A9B4CC] bg-[#111C2E] border-[#A9B4CC]/30"
                          : "text-[#4FD1A1] bg-[#111C2E] border-[#4FD1A1]/30"
                      }`}
                    >
                      {ticket.status === "pending" && <Clock className="w-3 h-3 text-[#A9B4CC]" />}
                      {ticket.status === "in_progress" && <RefreshCw className="w-3 h-3 text-[#A9B4CC] animate-spin" />}
                      {ticket.status === "resolved" && <CheckCircle2 className="w-3 h-3 text-[#4FD1A1]" />}
                      <span className="capitalize">
                        {ticket.status === "in_progress" ? "In Progress" : ticket.status}
                      </span>
                    </span>
                  </div>

                  {/* Complaint Description */}
                  <p className="text-xs text-[#F3F5F9] bg-[#111C2E] p-3 rounded-xl border border-[#22304A] leading-relaxed">
                    {ticket.description}
                  </p>

                  {/* Admin Existing Response */}
                  {ticket.adminResponse && !isEditing && (
                    <div className="p-3 rounded-xl bg-[#111C2E] border border-[#22304A] space-y-1">
                      <div className="flex items-center justify-between text-[11px] font-bold text-[#F3F5F9]">
                        <span>Managing Committee Note:</span>
                        <span className="text-[10px] text-[#8C97AD]">Official Response</span>
                      </div>
                      <p className="text-xs text-[#F3F5F9]/90 leading-relaxed">
                        {ticket.adminResponse}
                      </p>
                    </div>
                  )}

                  {/* Admin Inline Action Row */}
                  {isEditing ? (
                    <div className="space-y-2 pt-2 border-t border-[#22304A]">
                      <textarea
                        rows={2}
                        value={responseNote}
                        onChange={(e) => setResponseNote(e.target.value)}
                        placeholder="Add committee response note (e.g., Plumber assigned, inspection tomorrow 11 AM)..."
                        className="w-full bg-[#0A1120] border border-[#22304A] rounded-xl p-2.5 text-xs text-[#F3F5F9] placeholder-[#8C97AD]/50 focus:outline-none focus:border-[#EFE4CC]"
                      />
                      <div className="flex items-center gap-2">
                        <button
                          onClick={() => handleSaveResponse(ticket.id, "in_progress")}
                          className="pill-btn bg-[#EFE4CC] text-[#0A1120] font-bold text-xs px-3 py-1.5 rounded-lg shadow-sm hover:bg-[#F7F0DF]"
                        >
                          Set In Progress
                        </button>
                        <button
                          onClick={() => handleSaveResponse(ticket.id, "resolved")}
                          className="pill-btn bg-[#16233A] text-[#F3F5F9] border border-[#EFE4CC]/40 font-bold text-xs px-3 py-1.5 rounded-lg hover:opacity-90"
                        >
                          Mark Resolved
                        </button>
                        <button
                          onClick={() => setEditingId(null)}
                          className="text-xs text-[#8C97AD] hover:text-[#F3F5F9] px-2 py-1"
                        >
                          Cancel
                        </button>
                      </div>
                    </div>
                  ) : (
                    <div className="flex items-center justify-between pt-1 border-t border-[#22304A]">
                      <span className="text-[11px] text-[#8C97AD]">
                        Update ticket status:
                      </span>
                      <div className="flex items-center gap-1.5">
                        {ticket.status !== "in_progress" && (
                          <button
                            onClick={() => {
                              setEditingId(ticket.id);
                              setResponseNote(ticket.adminResponse || "");
                            }}
                            className="pill-btn bg-[#111C2E] hover:bg-[#16233A] border border-[#22304A] text-[#F3F5F9] font-semibold text-[11px] px-2.5 py-1 rounded-lg transition-all"
                          >
                            Update Progress
                          </button>
                        )}
                        {ticket.status !== "resolved" && (
                          <button
                            onClick={() => onUpdateStatus(ticket.id, "resolved", "Resolved by Managing Committee")}
                            className="pill-btn bg-[#16233A] hover:opacity-90 text-[#F3F5F9] border border-[#EFE4CC]/40 font-bold text-[11px] px-2.5 py-1 rounded-lg transition-all"
                          >
                            Resolve Ticket
                          </button>
                        )}
                      </div>
                    </div>
                  )}
                </div>
              );
            })
          ) : (
            <div className="py-12 text-center text-[#8C97AD] text-xs">
              No complaints found in this filter.
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
