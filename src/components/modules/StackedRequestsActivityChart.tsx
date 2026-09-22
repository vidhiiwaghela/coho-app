"use client";

import React from "react";
import { DocumentRequest, FacilityBooking, ComplaintTicket } from "../../types";
import { FileText, Calendar, AlertTriangle, BarChart3, ChevronRight } from "lucide-react";

interface StackedRequestsActivityChartProps {
  isAdmin: boolean;
  docRequests: DocumentRequest[];
  bookings: FacilityBooking[];
  complaints: ComplaintTicket[];
  onOpenDocRequests: (filter?: "all" | "pending" | "fulfilled" | "unavailable" | "not_available") => void;
  onOpenBookings: (filter?: "all" | "pending" | "approved" | "rejected") => void;
  onOpenComplaints: (filter?: "all" | "pending" | "in_progress" | "resolved") => void;
}

export const StackedRequestsActivityChart: React.FC<StackedRequestsActivityChartProps> = ({
  isAdmin,
  docRequests,
  bookings,
  complaints,
  onOpenDocRequests,
  onOpenBookings,
  onOpenComplaints,
}) => {
  // 1. Doc requests segments
  const docPending = docRequests.filter((r) => r.status === "pending").length;
  const docFulfilled = docRequests.filter((r) => r.status === "fulfilled").length;
  const docNotAvailable = docRequests.filter((r) => r.status === "unavailable" || r.status === "not_available").length;
  const docTotal = docRequests.length;

  // 2. Bookings segments
  const bookingPending = bookings.filter((b) => b.status === "pending").length;
  const bookingApproved = bookings.filter((b) => b.status === "approved").length;
  const bookingRejected = bookings.filter((b) => b.status === "rejected").length;
  const bookingTotal = bookings.length;

  // 3. Complaints segments
  const complaintPending = complaints.filter((c) => c.status === "pending").length;
  const complaintResolved = complaints.filter((c) => c.status === "resolved").length;
  const complaintInProgress = complaints.filter((c) => c.status === "in_progress").length;
  const complaintTotal = complaints.length;

  const categories = [
    {
      id: "docs",
      label: "Document Requests",
      icon: FileText,
      total: docTotal,
      onOpenRow: () => onOpenDocRequests("all"),
      segments: [
        {
          key: "pending",
          label: "Pending",
          count: docPending,
          color: "#A9B4CC", // Slate
          onClick: () => onOpenDocRequests("pending"),
        },
        {
          key: "fulfilled",
          label: "Fulfilled",
          count: docFulfilled,
          color: "#8FBF8A", // Mint green
          onClick: () => onOpenDocRequests("fulfilled"),
        },
        {
          key: "not_available",
          label: "Not Available",
          count: docNotAvailable,
          color: "#E2685B", // Coral red
          onClick: () => onOpenDocRequests("unavailable"),
        },
      ],
    },
    {
      id: "bookings",
      label: "Facility Bookings",
      icon: Calendar,
      total: bookingTotal,
      onOpenRow: () => onOpenBookings("all"),
      segments: [
        {
          key: "pending",
          label: "Pending",
          count: bookingPending,
          color: "#A9B4CC", // Slate
          onClick: () => onOpenBookings("pending"),
        },
        {
          key: "approved",
          label: "Approved",
          count: bookingApproved,
          color: "#8FBF8A", // Mint green
          onClick: () => onOpenBookings("approved"),
        },
        {
          key: "rejected",
          label: "Rejected",
          count: bookingRejected,
          color: "#E2685B", // Coral red
          onClick: () => onOpenBookings("rejected"),
        },
      ],
    },
    {
      id: "complaints",
      label: "Complaints & Tickets",
      icon: AlertTriangle,
      total: complaintTotal,
      onOpenRow: () => onOpenComplaints("all"),
      segments: [
        {
          key: "pending",
          label: "Pending",
          count: complaintPending,
          color: "#A9B4CC", // Slate
          onClick: () => onOpenComplaints("pending"),
        },
        {
          key: "resolved",
          label: "Resolved",
          count: complaintResolved,
          color: "#8FBF8A", // Mint green
          onClick: () => onOpenComplaints("resolved"),
        },
        {
          key: "in_progress",
          label: "In Progress",
          count: complaintInProgress,
          color: "#E2685B", // Coral red (in-progress / action)
          onClick: () => onOpenComplaints("in_progress"),
        },
      ],
    },
  ];

  // If Resident: Render clear, informative bar graph with clickable rows
  if (!isAdmin) {
    const residentCategories = [
      {
        id: "docs",
        label: "Document Requests",
        icon: FileText,
        total: docTotal,
        onOpenRow: () => onOpenDocRequests("all"),
        segments: [
          {
            key: "pending",
            label: "Pending",
            count: docPending,
            color: "#A9B4CC", // Slate
            onClick: () => onOpenDocRequests("pending"),
          },
          {
            key: "fulfilled",
            label: "Fulfilled",
            count: docFulfilled,
            color: "#8FBF8A", // Mint green
            onClick: () => onOpenDocRequests("fulfilled"),
          },
          {
            key: "not_available",
            label: "Not Available",
            count: docNotAvailable,
            color: "#E2685B", // Coral red
            onClick: () => onOpenDocRequests("unavailable"),
          },
        ],
      },
      {
        id: "bookings",
        label: "Facility Bookings",
        icon: Calendar,
        total: bookingTotal,
        onOpenRow: () => onOpenBookings("all"),
        segments: [
          {
            key: "pending",
            label: "Pending",
            count: bookingPending,
            color: "#A9B4CC", // Slate
            onClick: () => onOpenBookings("pending"),
          },
          {
            key: "approved",
            label: "Approved",
            count: bookingApproved,
            color: "#8FBF8A", // Mint green
            onClick: () => onOpenBookings("approved"),
          },
          {
            key: "rejected",
            label: "Rejected",
            count: bookingRejected,
            color: "#E2685B", // Coral red
            onClick: () => onOpenBookings("rejected"),
          },
        ],
      },
      {
        id: "complaints",
        label: "Complaints & Tickets",
        icon: AlertTriangle,
        total: complaintTotal,
        onOpenRow: () => onOpenComplaints("all"),
        segments: [
          {
            key: "pending",
            label: "Pending",
            count: complaintPending,
            color: "#A9B4CC", // Slate
            onClick: () => onOpenComplaints("pending"),
          },
          {
            key: "in_progress",
            label: "In Progress",
            count: complaintInProgress,
            color: "#F59E0B", // Amber / warm action
            onClick: () => onOpenComplaints("in_progress"),
          },
          {
            key: "resolved",
            label: "Resolved",
            count: complaintResolved,
            color: "#8FBF8A", // Mint green
            onClick: () => onOpenComplaints("resolved"),
          },
        ],
      },
    ];

    return (
      <div className="bg-[var(--card)] text-[var(--text)] rounded-2xl p-4 sm:p-5 border border-[var(--border)] shadow-sm space-y-3.5 cursor-default select-none">
        {/* Resident Header */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-xl bg-[var(--accent)]/15 text-[var(--text)] border border-[var(--accent)]/20 flex items-center justify-center shrink-0">
              <BarChart3 className="w-4 h-4 text-[var(--accent)]" />
            </div>
            <div>
              <h4 className="text-xs font-bold text-[var(--text)]">
                My Requests & Activity Status
              </h4>
              <p className="text-[10px] text-[var(--text-secondary)]">
                Summary of your active & past requests
              </p>
            </div>
          </div>

          <span className="text-[10px] font-bold text-[var(--accent)] bg-[var(--surface)] border border-[var(--border)] px-2.5 py-1 rounded-full shrink-0">
            {docTotal + bookingTotal + complaintTotal} Total
          </span>
        </div>

        {/* Plain Non-Stacked Bars (One distinct bar per category with proportional breakdown) */}
        <div className="space-y-3 pt-1">
          {residentCategories.map((cat) => {
            const Icon = cat.icon;
            const activeSegments = cat.segments.filter((seg) => seg.count > 0);

            return (
              <div
                key={cat.id}
                onClick={cat.onOpenRow}
                className="bg-[var(--surface)]/50 hover:bg-[var(--surface)] border border-[var(--border)] hover:border-[var(--accent)]/50 rounded-xl p-3 space-y-2 cursor-pointer transition-all active:scale-[0.99] group shadow-sm"
              >
                {/* Category Header */}
                <div className="flex items-center justify-between gap-2">
                  <div className="flex items-center gap-2 min-w-0">
                    <div className="w-6 h-6 rounded-lg bg-[var(--card)] border border-[var(--border)] flex items-center justify-center shrink-0 group-hover:border-[var(--accent)]/50 transition-colors">
                      <Icon className="w-3.5 h-3.5 text-[var(--text)]" />
                    </div>
                    <span className="text-xs font-bold text-[var(--text)] group-hover:text-[var(--accent)] transition-colors truncate">
                      {cat.label}
                    </span>
                  </div>

                  <div className="flex items-center gap-1 shrink-0">
                    <span className="text-[11px] font-medium text-[var(--text-secondary)]">
                      {cat.total} {cat.total === 1 ? "request" : "requests"}
                    </span>
                    <ChevronRight className="w-3.5 h-3.5 text-[var(--text-secondary)] group-hover:translate-x-0.5 transition-transform" />
                  </div>
                </div>

                {/* Proportional Horizontal Bar Track & Multi-tone Segments */}
                <div className="h-2.5 w-full bg-[var(--bg)] rounded-full overflow-hidden border border-[var(--border)] shadow-inner flex">
                  {cat.total > 0 &&
                    activeSegments.map((seg) => {
                      const widthPercent = (seg.count / cat.total) * 100;
                      return (
                        <div
                          key={seg.key}
                          style={{
                            width: `${widthPercent}%`,
                            backgroundColor: seg.color,
                          }}
                          title={`${seg.count} ${seg.label}`}
                          className="h-full transition-all duration-300 first:rounded-l-full last:rounded-r-full"
                        />
                      );
                    })}
                </div>

                {/* Status Breakdown Text with Colored Indicator Dots */}
                <div className="flex items-center gap-2 text-[10px] text-[var(--text-secondary)] pt-0.5 flex-wrap">
                  {activeSegments.length > 0 ? (
                    activeSegments.map((seg, idx) => (
                      <span key={seg.key} className="flex items-center gap-1.5">
                        {idx > 0 && <span className="text-[var(--text-secondary)]/40">•</span>}
                        <span
                          className="w-2 h-2 rounded-full shrink-0 inline-block shadow-sm"
                          style={{ backgroundColor: seg.color }}
                        />
                        <span className="font-medium text-[var(--text)]/90">
                          {seg.count} {seg.label}
                        </span>
                      </span>
                    ))
                  ) : (
                    <span className="text-[var(--text-secondary)]/60">No requests submitted</span>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </div>
    );
  }

  // Admin View: Full interactive stacked bar chart with navigation
  return (
    <div className="bg-[var(--card)] text-[var(--text)] rounded-2xl p-4 sm:p-5 border border-[var(--border)] shadow-sm space-y-4">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-xl bg-[var(--accent)]/15 text-[var(--text)] border border-[var(--accent)]/20 flex items-center justify-center shrink-0">
            <BarChart3 className="w-4 h-4 text-[var(--accent)]" />
          </div>
          <div>
            <h4 className="text-xs font-bold text-[var(--text)] flex items-center gap-1.5">
              <span>Society Requests & Activity Status</span>
            </h4>
            <p className="text-[10px] text-[var(--text-secondary)]">
              Tap any status segment to review queue
            </p>
          </div>
        </div>

        <span className="text-[10px] font-bold text-[var(--accent)] bg-[var(--surface)] border border-[var(--border)] px-2.5 py-1 rounded-full shrink-0">
          {docTotal + bookingTotal + complaintTotal} Total
        </span>
      </div>

      {/* 3 Stacked Bars */}
      <div className="space-y-3.5 pt-1">
        {categories.map((cat) => {
          const Icon = cat.icon;
          const activeSegments = cat.segments.filter((s) => s.count > 0);

          return (
            <div
              key={cat.id}
              onClick={cat.onOpenRow}
              className="bg-[var(--surface)]/50 hover:bg-[var(--surface)]/80 border border-[var(--border)] hover:border-[var(--accent)]/40 rounded-xl p-3 space-y-2 transition-all cursor-pointer group"
              id={`chart-row-${cat.id}`}
            >
              {/* Category Header Row */}
              <div className="flex items-center justify-between gap-2">
                <div className="flex items-center gap-2 min-w-0">
                  <div className="w-6 h-6 rounded-lg bg-[var(--card)] border border-[var(--border)] flex items-center justify-center shrink-0 group-hover:scale-105 transition-transform">
                    <Icon className="w-3.5 h-3.5 text-[var(--text)]" />
                  </div>
                  <span className="text-xs font-bold text-[var(--text)] truncate">
                    {cat.label}
                  </span>
                </div>

                <div className="flex items-center gap-1.5 shrink-0">
                  <span className="text-[11px] font-semibold text-[#A6ACC0]">
                    {cat.total} {cat.total === 1 ? "item" : "items"}
                  </span>
                  <ChevronRight className="w-3.5 h-3.5 text-[#A6ACC0] group-hover:text-[#F5F1E8] group-hover:translate-x-0.5 transition-all" />
                </div>
              </div>

              {/* Stacked Horizontal Bar */}
              {cat.total === 0 ? (
                <div className="h-3 w-full bg-[#1C2740] rounded-full border border-[#2B3854]/60 flex items-center justify-center px-2">
                  <span className="text-[9px] font-semibold text-[#A6ACC0]/70">
                    No requests recorded
                  </span>
                </div>
              ) : (
                <div className="h-3.5 w-full bg-[#1C2740] rounded-full overflow-hidden flex border border-[#2B3854]/60 shadow-inner">
                  {cat.segments.map((seg) => {
                    if (seg.count === 0) return null;
                    const pct = Math.round((seg.count / cat.total) * 100);

                    return (
                      <button
                        key={seg.key}
                        type="button"
                        onClick={(e) => {
                          e.stopPropagation();
                          seg.onClick();
                        }}
                        style={{
                          width: `${(seg.count / cat.total) * 100}%`,
                          backgroundColor: seg.color,
                        }}
                        className="h-full relative group/seg transition-all hover:brightness-125 cursor-pointer first:rounded-l-full last:rounded-r-full focus:outline-none"
                        title={`${cat.label} • ${seg.label}: ${seg.count} (${pct}%) — Tap to view`}
                        aria-label={`${cat.label} ${seg.label}: ${seg.count}`}
                      />
                    );
                  })}
                </div>
              )}

              {/* Segment Counts Breakdown */}
              <div className="flex items-center justify-between text-[10px] text-[#A6ACC0] pt-0.5 flex-wrap gap-x-2">
                {activeSegments.length > 0 ? (
                  activeSegments.map((s) => (
                    <button
                      key={s.key}
                      type="button"
                      onClick={(e) => {
                        e.stopPropagation();
                        s.onClick();
                      }}
                      className="hover:underline flex items-center gap-1 cursor-pointer transition-colors hover:text-[#F5F1E8]"
                    >
                      <span
                        className="w-1.5 h-1.5 rounded-full shrink-0"
                        style={{ backgroundColor: s.color }}
                      />
                      <span>
                        {s.count} {s.label}
                      </span>
                    </button>
                  ))
                ) : (
                  <span className="text-[10px] text-[#A6ACC0]/60">
                    Zero activity in this category
                  </span>
                )}
              </div>
            </div>
          );
        })}
      </div>

      {/* Unified Mobile-Friendly Legend */}
      <div className="grid grid-cols-3 gap-1 pt-2.5 border-t border-[#2B3854] text-[10px]">
        <div className="flex items-center gap-1.5 text-[#A6ACC0] truncate">
          <span className="w-2 h-2 rounded-full bg-[#A9B4CC] shrink-0" />
          <span className="truncate">Pending</span>
        </div>
        <div className="flex items-center gap-1.5 text-[#A6ACC0] truncate">
          <span className="w-2 h-2 rounded-full bg-[#8FBF8A] shrink-0" />
          <span className="truncate">Fulfilled / Done</span>
        </div>
        <div className="flex items-center gap-1.5 text-[#A6ACC0] truncate">
          <span className="w-2 h-2 rounded-full bg-[#E2685B] shrink-0" />
          <span className="truncate">Action / Rejected</span>
        </div>
      </div>
    </div>
  );
};
