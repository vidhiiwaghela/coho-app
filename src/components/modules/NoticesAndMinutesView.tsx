"use client";

import React, { useState, useEffect } from "react";
import { Notice, MeetingRecord, FlatUser } from "../../types";
import { NoticesView } from "./NoticesView";
import { MeetingsView } from "./MeetingsView";
import { Bell, Users } from "lucide-react";

export type FilterCategory = "notices" | "minutes";

interface NoticesAndMinutesViewProps {
  notices: Notice[];
  meetings: MeetingRecord[];
  currentUser: FlatUser;
  initialCategory?: FilterCategory;
  onCategoryChange?: (category: FilterCategory) => void;
  onAddNoticeClick?: () => void;
  onAddMeetingClick?: () => void;
  onSummarizeMeeting?: (meetingId: string) => void;
}

export const NoticesAndMinutesView: React.FC<NoticesAndMinutesViewProps> = ({
  notices,
  meetings,
  currentUser,
  initialCategory = "notices",
  onCategoryChange,
  onAddNoticeClick,
  onAddMeetingClick,
  onSummarizeMeeting,
}) => {
  const [activeCategory, setActiveCategory] = useState<FilterCategory>(
    initialCategory === "minutes" ? "minutes" : "notices"
  );

  useEffect(() => {
    if (initialCategory === "notices" || initialCategory === "minutes") {
      setActiveCategory(initialCategory);
    }
  }, [initialCategory]);

  const handleSelectCategory = (category: FilterCategory) => {
    setActiveCategory(category);
    onCategoryChange?.(category);
  };

  const filterTabs: { id: FilterCategory; label: string; icon: React.ElementType; count: number }[] = [
    { id: "notices", label: "Notices", icon: Bell, count: notices.length },
    { id: "minutes", label: "Minutes", icon: Users, count: meetings.length },
  ];

  return (
    <div className="space-y-4 pb-24 animate-fade-in">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-xl font-extrabold text-[#F3F5F9] tracking-tight">
            {activeCategory === "minutes"
              ? "Meeting Minutes & AGM"
              : "Notices & Circulars"}
          </h2>
          <p className="text-xs text-[#8C97AD]">
            {activeCategory === "minutes"
              ? "Official AGM/EGM minutes, attendee rosters & AI executive summaries"
              : "Official announcements broadcast to all society members"}
          </p>
        </div>
      </div>

      {/* Persistent Top Filter Pills: Strictly [ Notices (X) | Minutes (Y) ] */}
      <div className="flex items-center gap-1.5 overflow-x-auto no-scrollbar pb-1">
        {filterTabs.map((tab) => {
          const Icon = tab.icon;
          const isActive = activeCategory === tab.id;

          return (
            <button
              key={tab.id}
              onClick={() => handleSelectCategory(tab.id)}
              className={`pill-btn text-xs font-bold px-4 py-2 rounded-full flex items-center gap-2 transition-all shrink-0 ${
                isActive
                  ? "bg-[#EFE4CC] text-[#0A1120] font-bold shadow-sm"
                  : "bg-[#111C2E] text-[#8C97AD] border border-[#22304A] hover:border-[#22304A] hover:text-[#F3F5F9]"
              }`}
              id={`tab-filter-${tab.id}`}
            >
              <Icon className="w-3.5 h-3.5" />
              <span>{tab.label}</span>
              <span
                className={`text-[10px] px-1.5 py-0.2 rounded-full font-bold ml-0.5 ${
                  isActive
                    ? "bg-[#0A1120]/25 text-[#0A1120]"
                    : "bg-[#0A1120] text-[#8C97AD] border border-[#22304A]"
                }`}
              >
                {tab.count}
              </span>
            </button>
          );
        })}
      </div>

      {/* Content strictly based on Active Pill */}
      {activeCategory === "notices" && (
        <NoticesView
          notices={notices}
          currentUser={currentUser}
          onAddNoticeClick={onAddNoticeClick}
        />
      )}

      {activeCategory === "minutes" && (
        <MeetingsView
          meetings={meetings}
          currentUser={currentUser}
          onAddMeetingClick={onAddMeetingClick}
          onSummarizeMeeting={onSummarizeMeeting}
        />
      )}
    </div>
  );
};
