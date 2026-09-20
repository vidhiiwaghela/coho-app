"use client";

import React, { useState } from "react";
import { Notice, FlatUser } from "../../types";
import { NOTICE_TRANSLATIONS } from "../../lib/translations";
import {
  Pin,
  Languages,
  Plus,
  Clock,
  User,
  Sparkles,
  Loader2,
} from "lucide-react";

interface NoticesViewProps {
  notices: Notice[];
  currentUser: FlatUser;
  onAddNoticeClick?: () => void;
}

const LANGUAGES = [
  { code: "en", label: "English" },
  { code: "hi", label: "हिंदी" },
  { code: "mr", label: "मराठी" },
  { code: "gu", label: "ગુજરાતી" },
];

export const NoticesView: React.FC<NoticesViewProps> = ({
  notices,
  currentUser,
  onAddNoticeClick,
}) => {
  const [selectedLang, setSelectedLang] = useState<string>("en");
  const [filterCategory, setFilterCategory] = useState<string>("all");
  const [translationCache, setTranslationCache] = useState<
    Record<string, { title: string; body: string }>
  >({});
  const [loadingMap, setLoadingMap] = useState<Record<string, boolean>>({});

  const handleLanguageSelect = async (langCode: string) => {
    setSelectedLang(langCode);

    // If target is English ('en'), immediately switch back to original text without calling the API
    if (langCode === "en") {
      return;
    }

    // Find notices that have not been cached yet for this language
    const uncachedNotices = notices.filter(
      (n) => !translationCache[`${n.id}_${langCode}`]
    );

    if (uncachedNotices.length === 0) {
      return;
    }

    // Mark as loading for uncached notices
    setLoadingMap((prev) => {
      const updated = { ...prev };
      uncachedNotices.forEach((n) => {
        updated[n.id] = true;
      });
      return updated;
    });

    // Call /api/translate in chunks of 2 for uncached notices
    const BATCH_SIZE = 2;
    for (let i = 0; i < uncachedNotices.length; i += BATCH_SIZE) {
      const chunk = uncachedNotices.slice(i, i + BATCH_SIZE);
      await Promise.all(
        chunk.map(async (notice) => {
          try {
            const textToTranslate =
              notice.body || notice.content || notice.description || "";

            const [titleRes, bodyRes] = await Promise.all([
              fetch("/api/translate", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                  text: notice.title,
                  targetLanguage: langCode,
                }),
              }),
              fetch("/api/translate", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                  text: textToTranslate,
                  targetLanguage: langCode,
                }),
              }),
            ]);

            const titleData = await titleRes.json().catch(() => ({}));
            const bodyData = await bodyRes.json().catch(() => ({}));

            const translatedTitle =
              titleData.translatedText ||
              notice.translations?.[langCode]?.title ||
              NOTICE_TRANSLATIONS[notice.id]?.[langCode]?.title ||
              notice.title;

            const translatedBody =
              bodyData.translatedText ||
              notice.translations?.[langCode]?.body ||
              notice.translations?.[langCode]?.content ||
              NOTICE_TRANSLATIONS[notice.id]?.[langCode]?.body ||
              NOTICE_TRANSLATIONS[notice.id]?.[langCode]?.content ||
              textToTranslate;

            setTranslationCache((prev) => ({
              ...prev,
              [`${notice.id}_${langCode}`]: {
                title: translatedTitle,
                body: translatedBody,
              },
            }));
          } catch (err) {
            console.error(
              `Failed to translate notice ${notice.id} to ${langCode}:`,
              err
            );
            // Fallback to pre-configured translation dictionary if network fails
            const fallbackTitle =
              notice.translations?.[langCode]?.title ||
              NOTICE_TRANSLATIONS[notice.id]?.[langCode]?.title ||
              notice.title;
            const fallbackBody =
              notice.translations?.[langCode]?.body ||
              notice.translations?.[langCode]?.content ||
              NOTICE_TRANSLATIONS[notice.id]?.[langCode]?.body ||
              notice.body ||
              notice.content ||
              "";

            setTranslationCache((prev) => ({
              ...prev,
              [`${notice.id}_${langCode}`]: {
                title: fallbackTitle,
                body: fallbackBody,
              },
            }));
          } finally {
            setLoadingMap((prev) => ({ ...prev, [notice.id]: false }));
          }
        })
      );
    }
  };

  const filteredNotices = notices.filter((notice) => {
    if (filterCategory === "all") return true;
    if (filterCategory === "urgent") return notice.category === "urgent";
    if (filterCategory === "maintenance")
      return notice.category === "maintenance";
    return notice.category === "general" || notice.category === "event";
  });

  return (
    <div className="space-y-4 pb-24 animate-fade-in">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-xl font-extrabold text-[#F3F5F9] tracking-tight">
            Notices & Circulars
          </h2>
          <p className="text-xs text-[#8C97AD]">
            Official announcements broadcast to all society members
          </p>
        </div>

        {currentUser.role === "admin" && onAddNoticeClick && (
          <button
            onClick={onAddNoticeClick}
            className="bg-[#111C2E] text-[#F3F5F9] border border-[#22304A] text-xs font-bold px-3.5 py-2 rounded-xl flex items-center gap-1.5 shadow-sm hover:bg-[#16233A] transition-all"
          >
            <Plus className="w-3.5 h-3.5" />
            <span>Post Notice</span>
          </button>
        )}
      </div>

      {/* Global Translation Selector */}
      <div className="bg-[#111C2E] border border-[#22304A] rounded-2xl p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3 shadow-sm">
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-xl bg-[#EFE4CC]/15 text-[#F3F5F9] flex items-center justify-center font-bold">
            <Languages className="w-4 h-4" />
          </div>
          <div>
            <div className="text-xs font-bold text-[#F3F5F9]">
              Multi-Language Notice Feed
            </div>
            <div className="text-[11px] text-[#8C97AD]">
              Translate circulars on the fly into regional languages with Groq AI
            </div>
          </div>
        </div>

        <div className="flex items-center gap-1 bg-[#0A1120] p-1 rounded-full border border-[#22304A]">
          {LANGUAGES.map((lang) => (
            <button
              key={lang.code}
              onClick={() => handleLanguageSelect(lang.code)}
              id={`lang-btn-${lang.code}`}
              className={`pill-btn text-xs font-bold px-3.5 py-1 rounded-full transition-all cursor-pointer ${
                selectedLang === lang.code
                  ? "bg-[#EFE4CC] text-[#0A1120] shadow-sm font-black"
                  : "text-[#8C97AD] hover:text-[#F3F5F9]"
              }`}
            >
              {lang.label}
            </button>
          ))}
        </div>
      </div>

      {/* Filter Category Tabs */}
      <div className="flex items-center gap-2">
        <button
          onClick={() => setFilterCategory("all")}
          className={`pill-btn text-xs font-bold px-3.5 py-1.5 rounded-full transition-all ${
            filterCategory === "all"
              ? "bg-[#EFE4CC] text-[#0A1120] font-bold shadow-sm"
              : "bg-[#111C2E] text-[#8C97AD] border border-[#22304A] hover:border-[#22304A] hover:text-[#F3F5F9]"
          }`}
        >
          All Notices ({notices.length})
        </button>
        <button
          onClick={() => setFilterCategory("urgent")}
          className={`pill-btn text-xs font-bold px-3.5 py-1.5 rounded-full transition-all ${
            filterCategory === "urgent"
              ? "bg-[#EFE4CC] text-[#0A1120] font-bold shadow-sm"
              : "bg-[#111C2E] text-[#8C97AD] border border-[#22304A] hover:border-[#22304A] hover:text-[#F3F5F9]"
          }`}
        >
          Urgent / Critical
        </button>
        <button
          onClick={() => setFilterCategory("maintenance")}
          className={`pill-btn text-xs font-bold px-3.5 py-1.5 rounded-full transition-all ${
            filterCategory === "maintenance"
              ? "bg-[#EFE4CC] text-[#0A1120] font-bold shadow-sm"
              : "bg-[#111C2E] text-[#8C97AD] border border-[#22304A] hover:border-[#22304A] hover:text-[#F3F5F9]"
          }`}
        >
          Facility Maintenance
        </button>
      </div>

      {/* Notice Cards List */}
      <div className="space-y-3.5">
        {filteredNotices.map((notice) => {
          const isUrgent = notice.category === "urgent";
          const cacheKey = `${notice.id}_${selectedLang}`;
          const cached = translationCache[cacheKey];
          const isLoading =
            Boolean(loadingMap[notice.id]) && selectedLang !== "en";

          const displayTitle =
            selectedLang === "en"
              ? notice.title
              : cached?.title ||
                notice.translations?.[selectedLang]?.title ||
                NOTICE_TRANSLATIONS[notice.id]?.[selectedLang]?.title ||
                notice.title;

          const displayBody =
            selectedLang === "en"
              ? notice.body || notice.content || notice.description || ""
              : cached?.body ||
                notice.translations?.[selectedLang]?.body ||
                notice.translations?.[selectedLang]?.content ||
                NOTICE_TRANSLATIONS[notice.id]?.[selectedLang]?.body ||
                NOTICE_TRANSLATIONS[notice.id]?.[selectedLang]?.content ||
                notice.body ||
                notice.content ||
                notice.description ||
                "";

          return (
            <div
              key={notice.id}
              className={`rounded-2xl p-5 border transition-all ${
                isUrgent
                  ? "bg-[#2A1418] border-[#F0736A]/30 shadow-sm"
                  : "bg-[#111C2E] border-[#22304A] shadow-sm"
              }`}
            >
              {/* Card Header */}
              <div className="flex items-start justify-between gap-3 mb-2.5">
                <div className="flex items-center gap-2">
                  {notice.isPinned && (
                    <span className="bg-[#16233A] text-[#F3F5F9] border border-[#22304A] p-1 rounded-md">
                      <Pin className="w-3 h-3 fill-[#EFE4CC]" />
                    </span>
                  )}
                  <span
                    className={`text-[10px] uppercase font-bold tracking-wider px-2.5 py-0.5 rounded-full ${
                      isUrgent
                        ? "bg-[#2A1418] text-[#F0736A] border border-[#F0736A]/30"
                        : "bg-[#111C2E] text-[#4FD1A1] border border-[#4FD1A1]/30"
                    }`}
                  >
                    {notice.category}
                  </span>
                  {selectedLang !== "en" && (
                    isLoading ? (
                      <span className="text-[10px] font-bold text-[#F3F5F9] bg-[#111C2E] border border-[#EFE4CC]/40 px-2 py-0.5 rounded-full flex items-center gap-1.5 animate-pulse">
                        <Loader2 className="w-2.5 h-2.5 animate-spin" />
                        Translating...
                      </span>
                    ) : (
                      <span className="text-[10px] font-bold text-[#F3F5F9] bg-[#111C2E] border border-[#EFE4CC]/30 px-2 py-0.5 rounded-full flex items-center gap-1">
                        <Sparkles className="w-2.5 h-2.5 text-[#F3F5F9]" />
                        {selectedLang.toUpperCase()} Translation
                      </span>
                    )
                  )}
                </div>

                <span className="text-[11px] text-[#8C97AD] font-medium">
                  {notice.postedAt}
                </span>
              </div>

              {/* Title & Body with Skeleton Shimmer while loading */}
              {isLoading ? (
                <div
                  className="space-y-2.5 my-2 animate-pulse"
                  aria-label="Loading translation"
                >
                  <div className="h-5 bg-[#16233A] rounded-lg w-3/4" />
                  <div className="space-y-1.5 pt-1">
                    <div className="h-3.5 bg-[#16233A]/80 rounded-md w-full" />
                    <div className="h-3.5 bg-[#16233A]/80 rounded-md w-11/12" />
                    <div className="h-3.5 bg-[#16233A]/60 rounded-md w-4/5" />
                  </div>
                </div>
              ) : (
                <>
                  <h3
                    className="text-base font-bold leading-snug mb-2 text-[#F3F5F9]"
                  >
                    {displayTitle}
                  </h3>

                  <p
                    className={`text-xs leading-relaxed ${
                      isUrgent ? "text-[#F0736A]/90" : "text-[#8C97AD]"
                    }`}
                  >
                    {displayBody}
                  </p>
                </>
              )}

              {/* Card Footer */}
              <div className="mt-3.5 pt-3 border-t border-[#22304A] flex items-center justify-between text-[11px] text-[#8C97AD]">
                <span className="flex items-center gap-1">
                  <User className="w-3 h-3 text-[#8C97AD]" />
                  <span>Posted by: {notice.postedBy}</span>
                </span>
                <span className="flex items-center gap-1">
                  <Clock className="w-3 h-3 text-[#8C97AD]" />
                  <span>Permanent Record</span>
                </span>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};

