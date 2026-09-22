"use client";

import React, { useState, useEffect } from "react";
import { MeetingRecord, FlatUser } from "../../types";
import { MEETING_TRANSLATIONS } from "../../lib/translations";
import { PillSearchBar } from "../common/PillSearchBar";
import {
  Users,
  Calendar,
  Sparkles,
  Languages,
  CheckCircle2,
  Clock,
  MapPin,
  ChevronDown,
  ChevronUp,
  FileText,
  Plus,
  ArrowRight,
  BrainCircuit,
  RefreshCw,
  AlertCircle,
  Loader2,
} from "lucide-react";

interface MeetingsViewProps {
  meetings: MeetingRecord[];
  currentUser: FlatUser;
  onAddMeetingClick?: () => void;
  onSummarizeMeeting?: (meetingId: string) => void;
}

const LANGUAGES = [
  { code: "en", label: "English" },
  { code: "hi", label: "हिंदी" },
  { code: "mr", label: "मराठी" },
  { code: "gu", label: "ગુજરાતી" },
];

export const MeetingsView: React.FC<MeetingsViewProps> = ({
  meetings,
  currentUser,
  onAddMeetingClick,
  onSummarizeMeeting,
}) => {
  const [searchQuery, setSearchQuery] = useState("");
  const [expandedMeetingId, setExpandedMeetingId] = useState<string>(
    meetings[0]?.id || ""
  );
  const [selectedLanguage, setSelectedLanguage] = useState<string>("en");
  const [isTranslating, setIsTranslating] = useState<boolean>(false);
  const [translationCache, setTranslationCache] = useState<
    Record<string, { summary: string; transcript: string }>
  >({});
  const [loadingMap, setLoadingMap] = useState<Record<string, boolean>>({});

  // Translate meetings in chunks of 1-2
  const translateMeetings = async (
    targetMeetings: MeetingRecord[],
    langCode: string
  ) => {
    if (langCode === "en") return;

    const uncachedMeetings = targetMeetings.filter(
      (m) => !translationCache[`${m.id}_${langCode}`]
    );

    if (uncachedMeetings.length === 0) return;

    setIsTranslating(true);
    setLoadingMap((prev) => {
      const updated = { ...prev };
      uncachedMeetings.forEach((m) => {
        updated[m.id] = true;
      });
      return updated;
    });

    const BATCH_SIZE = 1;
    for (let i = 0; i < uncachedMeetings.length; i += BATCH_SIZE) {
      const chunk = uncachedMeetings.slice(i, i + BATCH_SIZE);
      await Promise.all(
        chunk.map(async (meeting) => {
          try {
            const rawSummary =
              meeting.summary_text || meeting.aiSummary?.overview || "";
            const rawTranscript =
              meeting.minutes_text || meeting.minutesContent || "";

            const [summaryRes, transcriptRes] = await Promise.all([
              rawSummary
                ? fetch("/api/translate", {
                    method: "POST",
                    headers: { "Content-Type": "application/json" },
                    body: JSON.stringify({
                      text: rawSummary,
                      targetLanguage: langCode,
                    }),
                  })
                : Promise.resolve(null),
              rawTranscript
                ? fetch("/api/translate", {
                    method: "POST",
                    headers: { "Content-Type": "application/json" },
                    body: JSON.stringify({
                      text: rawTranscript,
                      targetLanguage: langCode,
                    }),
                  })
                : Promise.resolve(null),
            ]);

            const summaryData = summaryRes
              ? await summaryRes.json().catch(() => ({}))
              : {};
            const transcriptData = transcriptRes
              ? await transcriptRes.json().catch(() => ({}))
              : {};

            const translatedSummary =
              summaryData.translatedText ||
              meeting.translations?.[langCode]?.overview ||
              MEETING_TRANSLATIONS[meeting.id]?.[langCode]?.overview ||
              rawSummary;

            const translatedTranscript =
              transcriptData.translatedText || rawTranscript;

            setTranslationCache((prev) => ({
              ...prev,
              [`${meeting.id}_${langCode}`]: {
                summary: translatedSummary,
                transcript: translatedTranscript,
              },
            }));
          } catch (err) {
            console.error(
              `Failed to translate meeting ${meeting.id} to ${langCode}:`,
              err
            );
            const fallbackSummary =
              meeting.translations?.[langCode]?.overview ||
              MEETING_TRANSLATIONS[meeting.id]?.[langCode]?.overview ||
              meeting.summary_text ||
              meeting.aiSummary?.overview ||
              "";
            const fallbackTranscript =
              meeting.minutes_text || meeting.minutesContent || "";

            setTranslationCache((prev) => ({
              ...prev,
              [`${meeting.id}_${langCode}`]: {
                summary: fallbackSummary,
                transcript: fallbackTranscript,
              },
            }));
          } finally {
            setLoadingMap((prev) => ({ ...prev, [meeting.id]: false }));
          }
        })
      );
    }
    setIsTranslating(false);
  };

  const handleLanguageChange = (langCode: string) => {
    setSelectedLanguage(langCode);
    if (langCode === "en") return;
    translateMeetings(meetings, langCode);
  };

  const handleToggleMeeting = (meeting: MeetingRecord) => {
    const isOpening = expandedMeetingId !== meeting.id;
    setExpandedMeetingId(isOpening ? meeting.id : "");
    if (isOpening && selectedLanguage !== "en") {
      if (!translationCache[`${meeting.id}_${selectedLanguage}`]) {
        translateMeetings([meeting], selectedLanguage);
      }
    }
  };

  const filteredMeetings = meetings.filter((m) => {
    const q = searchQuery.toLowerCase().trim();
    if (!q) return true;
    const minutes = (m.minutes_text || m.minutesContent || "").toLowerCase();
    const summary = (m.summary_text || m.aiSummary?.overview || "").toLowerCase();
    return (
      m.title.toLowerCase().includes(q) ||
      (m.date || m.meeting_date || "").toLowerCase().includes(q) ||
      minutes.includes(q) ||
      summary.includes(q)
    );
  });

  return (
    <div className="space-y-4 pb-24 animate-fade-in">
      {/* Language Selector Strip */}
      <div className="bg-[#161F30] rounded-2xl p-2.5 px-3.5 border border-[#2B3854] shadow-sm flex items-center justify-between">
        <div className="flex items-center gap-2 text-xs font-semibold text-[#F5F1E8]">
          <Languages className="w-4 h-4 text-[#F5F1E8] bg-[#1C2740] rounded-full p-0.5" />
          <span>Translate Minutes / Summaries:</span>
        </div>
        <div className="flex items-center gap-1">
          {LANGUAGES.map((lang) => (
            <button
              key={lang.code}
              onClick={() => handleLanguageChange(lang.code)}
              className={`pill-btn text-[11px] font-bold px-2.5 py-1 rounded-full transition-all ${
                selectedLanguage === lang.code
                  ? "bg-[#E8B565] text-[#0E1420] shadow-sm font-bold"
                  : "bg-[#161F30] text-[#A6ACC0] hover:text-[#F5F1E8] border border-[#2B3854]"
              }`}
            >
              {lang.label}
            </button>
          ))}
        </div>
      </div>

      {/* Search Bar */}
      <PillSearchBar
        value={searchQuery}
        onChange={setSearchQuery}
        placeholder="Search AGM resolutions, tenders, EV chargers, waterproofing..."
      />

      {/* Meetings Accordion List */}
      <div className="space-y-4">
        {filteredMeetings.map((meeting, idx) => {
          const isExpanded = expandedMeetingId === meeting.id;
          const cached =
            selectedLanguage !== "en"
              ? translationCache[`${meeting.id}_${selectedLanguage}`]
              : null;
          const isMeetingLoading = loadingMap[meeting.id] || false;

          const langTranslation = meeting.translations?.[selectedLanguage];
          const rawSummary =
            meeting.summary_text || meeting.aiSummary?.overview || "";
          const displayedSummary =
            cached?.summary ||
            (selectedLanguage === "en"
              ? rawSummary
              : langTranslation?.overview ||
                MEETING_TRANSLATIONS[meeting.id]?.[selectedLanguage]?.overview ||
                rawSummary);

          const rawMinutes = meeting.minutes_text || meeting.minutesContent || "";
          const displayedMinutes =
            selectedLanguage === "en"
              ? rawMinutes
              : cached?.transcript || rawMinutes;

          const status = meeting.summary_status || (rawSummary ? "done" : "pending");

          return (
            <div
              key={meeting.id}
              className="list-item-in bg-[#161F30] rounded-2xl overflow-hidden border border-[#2B3854] shadow-sm transition-all"
              style={{ "--stagger-delay": `${Math.min(idx * 40, 320)}ms` } as React.CSSProperties}
            >
              {/* Meeting Header Row */}
              <div
                onClick={() => handleToggleMeeting(meeting)}
                className="p-4 sm:p-5 cursor-pointer flex items-start justify-between gap-3 hover:bg-[#1C2740]/50 transition-colors"
              >
                <div className="flex items-start gap-3">
                  <div className="w-10 h-10 rounded-2xl bg-[#1C2740] text-[#F5F1E8] border border-[#2B3854] flex items-center justify-center shrink-0">
                    <Users className="w-5 h-5 text-[#F5F1E8]" />
                  </div>
                  <h3 className="text-sm font-bold text-[#F5F1E8] leading-snug">
                    {meeting.title}
                  </h3>
                </div>

                <div className="flex items-center gap-2 shrink-0">
                  {isExpanded ? (
                    <ChevronUp className="w-4 h-4 text-[#A6ACC0]" />
                  ) : (
                    <ChevronDown className="w-4 h-4 text-[#A6ACC0]" />
                  )}
                </div>
              </div>

              {/* Expanded Details */}
              {isExpanded && (
                <div className="p-5 border-t border-[#2B3854] space-y-4 animate-fade-in">

                  {/* 0. Meeting meta: date, venue, attendance, AI status — revealed on expand */}
                  <div className="flex flex-wrap items-center justify-between gap-2">
                    <div className="flex flex-wrap items-center gap-2 text-[11px] text-[#A6ACC0]">
                      <span className="flex items-center gap-1">
                        <Calendar className="w-3 h-3" /> {meeting.meeting_date || meeting.date}
                      </span>
                      <span>•</span>
                      <span className="flex items-center gap-1">
                        <MapPin className="w-3 h-3" /> {meeting.venue || "Clubhouse"}
                      </span>
                      <span>•</span>
                      <span className="font-semibold text-[#8FBF8A] bg-[#161F30] border border-[#8FBF8A]/30 px-2 py-0.2 rounded">
                        {meeting.attendeeCount || 50}+ Members Present
                      </span>
                    </div>

                    {status === "pending" ? (
                      <span className="text-[11px] font-bold text-[#F5F1E8] bg-[#161F30] border border-[#E8B565]/40 px-2.5 py-1 rounded-full flex items-center gap-1 animate-pulse">
                        <Loader2 className="w-3 h-3 animate-spin text-[#F5F1E8]" />
                        Summarizing...
                      </span>
                    ) : status === "failed" ? (
                      <span className="text-[11px] font-bold text-[#E2685B] bg-[#2A1418] border border-[#E2685B]/30 px-2.5 py-1 rounded-full flex items-center gap-1">
                        <AlertCircle className="w-3 h-3" />
                        AI Failed
                      </span>
                    ) : (
                      <span className="text-[11px] font-bold text-[#F5F1E8] bg-[#161F30] border border-[#E8B565]/40 px-2.5 py-1 rounded-full flex items-center gap-1 shadow-sm">
                        <Sparkles className="w-3 h-3" />
                        AI Summary
                      </span>
                    )}
                  </div>

                  {/* 1. Full Official Recorded Minutes (PRD Section 3.7 & Requirement 4) */}
                  <div
                    className={`bg-[#1C2740]/50 p-5 rounded-2xl space-y-2 border border-transparent transition-opacity ${
                      isMeetingLoading ? "opacity-70 animate-pulse" : ""
                    }`}
                  >
                    <div className="flex items-center justify-between text-xs font-bold text-[#F5F1E8]">
                      <span className="flex items-center gap-1.5">
                        <FileText className="w-4 h-4 text-[#A6ACC0]" />
                        Full Official Recorded Minutes
                      </span>
                      <div className="flex items-center gap-2">
                        {isMeetingLoading && (
                          <span className="text-[10px] text-[#F5F1E8] flex items-center gap-1">
                            <Loader2 className="w-3 h-3 animate-spin" />
                            Translating...
                          </span>
                        )}
                        <span className="text-[10px] text-[#A6ACC0] font-mono">Verbatim Transcript</span>
                      </div>
                    </div>
                    <p className="text-xs text-[#F5F1E8]/80 whitespace-pre-line leading-relaxed font-sans">
                      {displayedMinutes}
                    </p>
                  </div>

                  {/* 2. AI-Generated Summary (Below Full Minutes, Visually Distinct Block) */}
                  <div className="mx-auto my-3 rounded-2xl p-5 bg-[#0E1420]/60 border border-[#2B3854] text-textInverse space-y-4 relative overflow-hidden shadow-sm">
                    {/* Header with clear disclaimer */}
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-1 border-b border-[#2B3854] pb-3">
                      <div className="flex items-center gap-2 text-[#F5F1E8] text-xs font-bold uppercase tracking-wider">
                        <BrainCircuit className="w-4 h-4" />
                        <span>AI-Generated Summary</span>
                      </div>
                      <span className="text-[10px] text-[#A6ACC0] italic">
                        (AI-generated summary via Groq Llama 3.3 — not implied to be the official record)
                      </span>
                    </div>

                    {/* Pending State */}
                    {status === "pending" && (
                      <div className="py-6 flex flex-col items-center justify-center text-center space-y-3">
                        <div className="w-10 h-10 rounded-full bg-white/5 flex items-center justify-center">
                          <Loader2 className="w-5 h-5 text-[#F5F1E8] animate-spin" />
                        </div>
                        <div className="space-y-1">
                          <p className="text-xs font-bold text-[#F5F1E8]">
                            AI Summary generating via Groq...
                          </p>
                          <p className="text-[11px] text-white/60">
                            Analyzing official minutes with llama-3.3-70b-versatile
                          </p>
                        </div>
                      </div>
                    )}

                    {/* Failed State with Retry Button */}
                    {status === "failed" && (
                      <div className="bg-rose-500/10 border border-rose-500/20 rounded-xl p-3.5 space-y-2">
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-2 text-rose-400 text-xs font-semibold">
                            <AlertCircle className="w-4 h-4" />
                            <span>Failed to generate AI summary</span>
                          </div>
                          {onSummarizeMeeting && (
                            <button
                              onClick={(e) => {
                                e.stopPropagation();
                                onSummarizeMeeting(meeting.id);
                              }}
                              className="pill-btn bg-[#1C2740] text-[#F5F1E8] text-[11px] font-bold px-3 py-1 flex items-center gap-1.5 hover:bg-white/10 border border-[#E8B565]/30 transition-all"
                            >
                              <RefreshCw className="w-3 h-3 text-[#F5F1E8]" />
                              <span>Retry Summary</span>
                            </button>
                          )}
                        </div>
                        <p className="text-[11px] text-white/70">
                          {meeting.summary_text || "Groq API error. Check GROQ_API_KEY in your environment configuration."}
                        </p>
                      </div>
                    )}

                    {/* Done State */}
                    {status === "done" && (
                      <div className="space-y-4">
                        <div
                          className={`text-xs text-white/95 whitespace-pre-line leading-relaxed font-sans ${
                            isMeetingLoading ? "opacity-70 animate-pulse" : ""
                          }`}
                        >
                          {isMeetingLoading && !displayedSummary ? (
                            <span className="animate-pulse text-[#F5F1E8]">Translating summary into regional language...</span>
                          ) : (
                            displayedSummary
                          )}
                        </div>

                        {/* Key Decisions (if available in structured object) */}
                        {meeting.aiSummary?.keyDecisions && meeting.aiSummary.keyDecisions.length > 0 && (
                          <div className="pt-3 border-t border-[#2B3854]">
                            <div className="text-[11px] font-bold uppercase text-[#F5F1E8] mb-2">
                              Key Decisions:
                            </div>
                            <ul className="space-y-1.5 text-xs text-[#A6ACC0]">
                              {(langTranslation?.keyDecisions || meeting.aiSummary.keyDecisions).map(
                                (dec, i) => (
                                  <li key={i} className="flex items-start gap-2">
                                    <CheckCircle2 className="w-3.5 h-3.5 text-[#F5F1E8] shrink-0 mt-0.5" />
                                    <span className="text-white/90">{dec}</span>
                                  </li>
                                )
                              )}
                            </ul>
                          </div>
                        )}

                        {/* Action Items (if available in structured object) */}
                        {meeting.aiSummary?.actionItems && meeting.aiSummary.actionItems.length > 0 && (
                          <div className="pt-3 border-t border-[#2B3854]">
                            <div className="text-[11px] font-bold uppercase text-[#A6ACC0] mb-2">
                              Action Items:
                            </div>
                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-2 text-[11px]">
                              {meeting.aiSummary.actionItems.map((act, idx) => (
                                <div
                                  key={idx}
                                  className="p-3.5 rounded-xl border border-transparent bg-[#1C2740]/50 space-y-1"
                                >
                                  <div className="font-semibold text-white">{act.task}</div>
                                  <div className="text-[10px] text-[#A6ACC0] flex justify-between">
                                    <span>Owner: {act.assignee}</span>
                                    <span className="text-[#F5F1E8]">By: {act.deadline}</span>
                                  </div>
                                </div>
                              ))}
                            </div>
                          </div>
                        )}
                      </div>
                    )}
                  </div>

                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
};
