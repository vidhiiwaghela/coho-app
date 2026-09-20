import React from "react";
import { cn } from "../../lib/utils";

export type StatusType = "paid" | "approved" | "pending" | "overdue" | "active" | "urgent" | "completed";

interface StatusBadgeProps {
  status: StatusType | string;
  label?: string;
  size?: "sm" | "md";
  className?: string;
}

export const StatusBadge: React.FC<StatusBadgeProps> = ({
  status,
  label,
  size = "md",
  className,
}) => {
  const normalized = status.toLowerCase();

  let dotColor = "bg-[var(--pending)]";
  let badgeStyles = "text-[var(--pending)] bg-[var(--surface)] border border-[var(--pending)]/30";
  let displayLabel = label || status;

  if (
    normalized === "paid" ||
    normalized === "approved" ||
    normalized === "completed" ||
    normalized === "active" ||
    normalized === "resolved" ||
    normalized === "fulfilled"
  ) {
    dotColor = "bg-[var(--success)]";
    badgeStyles = "text-[var(--success)] bg-[var(--surface)] border border-[var(--success)]/30";
    if (!label) {
      displayLabel = normalized === "paid" ? "Paid" : normalized === "approved" ? "Approved" : "Active";
    }
  } else if (
    normalized === "overdue" ||
    normalized === "urgent" ||
    normalized === "alert" ||
    normalized === "rejected"
  ) {
    dotColor = "bg-[var(--urgent)]";
    badgeStyles = "text-[var(--urgent)] bg-[#2A1418] border border-[var(--urgent)]/30";
    if (!label) {
      displayLabel = normalized === "overdue" ? "Overdue" : normalized === "rejected" ? "Rejected" : "Urgent";
    }
  } else if (normalized === "in_progress" || normalized === "in progress") {
    dotColor = "bg-[var(--info)]";
    badgeStyles = "text-[var(--info)] bg-[var(--surface)] border border-[var(--info)]/30";
    if (!label) {
      displayLabel = "In Progress";
    }
  } else if (normalized === "pending") {
    dotColor = "bg-[var(--pending)]";
    badgeStyles = "text-[var(--pending)] bg-[var(--surface)] border border-[var(--pending)]/30";
    if (!label) {
      displayLabel = "Pending";
    }
  }

  return (
    <div
      className={cn(
        "inline-flex items-center gap-1.5 rounded-full font-bold select-none",
        badgeStyles,
        size === "sm" ? "text-[10px] px-2 py-0.5" : "text-xs px-2.5 py-1",
        className
      )}
    >
      <span className={cn("rounded-full", dotColor, size === "sm" ? "w-1.5 h-1.5" : "w-2 h-2")} />
      <span>{displayLabel}</span>
    </div>
  );
};
