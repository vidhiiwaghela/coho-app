"use client";

import React, { useState, useEffect } from "react";
import { Notice, MeetingRecord, FlatUser } from "../../types";
import { NoticesView } from "./NoticesView";
import { MeetingsView } from "./MeetingsView";
import { Bell, Users, Plus } from "lucide-react";

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
      <div className="flex items-center justify-between gap-3">
        <div className="min-w-0">
          <h2 className="text-xl font-extrabold text-[#F5F1E8] tracking-tight">
            {activeCategory === "minutes"
              ? "Meeting Minutes & AGM"
              : "Notices & Circulars"}
          </h2>
          <p className="text-xs text-[#A6ACC0] truncate">
            {activeCategory === "minutes"
              ? "Official AGM & EGM records"
              : "Official announcements broadcast to members"}
          </p>
        </div>

        {currentUser.role === "admin" && (
          <div>
            {activeCategory === "notices" && onAddNoticeClick && (
              <button
                onClick={onAddNoticeClick}
                className="bg-[#161F30] hover:bg-[#1C2740] text-[#F5F1E8] border border-[#2B3854] hover:border-[#E8B565]/50 text-xs font-bold px-3.5 py-2 rounded-xl flex items-center gap-1.5 shadow-sm transition-all shrink-0 cursor-pointer"
                id="btn-add-notice-top"
              >
                <Plus className="w-3.5 h-3.5" />
                <span>Post Notice</span>
              </button>
            )}

            {activeCategory === "minutes" && onAddMeetingClick && (
              <button
                onClick={onAddMeetingClick}
                className="bg-[#161F30] hover:bg-[#1C2740] text-[#F5F1E8] border border-[#2B3854] hover:border-[#E8B565]/50 text-xs font-bold px-3.5 py-2 rounded-xl flex items-center gap-1.5 shadow-sm transition-all shrink-0 cursor-pointer"
                id="btn-add-meeting-top"
              >
                <Plus className="w-3.5 h-3.5" />
                <span>Record Meeting</span>
              </button>
            )}
          </div>
        )}
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
                  ? "bg-[#E8B565] text-[#0E1420] font-bold shadow-sm"
                  : "bg-[#161F30] text-[#A6ACC0] border border-[#2B3854] hover:border-[#2B3854] hover:text-[#F5F1E8]"
              }`}
              id={`tab-filter-${tab.id}`}
            >
              <Icon className="w-3.5 h-3.5" />
              <span>{tab.label}</span>
              <span
                className={`text-[10px] px-1.5 py-0.2 rounded-full font-bold ml-0.5 ${
                  isActive
                    ? "bg-[#0E1420]/25 text-[#0E1420]"
                    : "bg-[#0E1420] text-[#A6ACC0] border border-[#2B3854]"
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
