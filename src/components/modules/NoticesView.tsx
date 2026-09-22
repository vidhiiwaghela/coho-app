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
      {/* Global Translation Selector */}
      <div className="bg-[#161F30] border border-[#2B3854] rounded-2xl p-3 sm:p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3 shadow-sm">
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-xl bg-[#E8B565]/15 text-[#F5F1E8] flex items-center justify-center font-bold shrink-0">
            <Languages className="w-4 h-4" />
          </div>
          <div>
            <div className="text-xs font-bold text-[#F5F1E8]">
              Translate Notices
            </div>
          </div>
        </div>

        <div className="flex items-center gap-1 bg-[#0E1420] p-1 rounded-full border border-[#2B3854]">
          {LANGUAGES.map((lang) => (
            <button
              key={lang.code}
              onClick={() => handleLanguageSelect(lang.code)}
              id={`lang-btn-${lang.code}`}
              className={`pill-btn text-xs font-bold px-3.5 py-1 rounded-full transition-all cursor-pointer ${
                selectedLang === lang.code
                  ? "bg-[#E8B565] text-[#0E1420] shadow-sm font-black"
                  : "text-[#A6ACC0] hover:text-[#F5F1E8]"
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
              ? "bg-[#E8B565] text-[#0E1420] font-bold shadow-sm"
              : "bg-[#161F30] text-[#A6ACC0] border border-[#2B3854] hover:border-[#2B3854] hover:text-[#F5F1E8]"
          }`}
        >
          All Notices ({notices.length})
        </button>
        <button
          onClick={() => setFilterCategory("urgent")}
          className={`pill-btn text-xs font-bold px-3.5 py-1.5 rounded-full transition-all ${
            filterCategory === "urgent"
              ? "bg-[#E8B565] text-[#0E1420] font-bold shadow-sm"
              : "bg-[#161F30] text-[#A6ACC0] border border-[#2B3854] hover:border-[#2B3854] hover:text-[#F5F1E8]"
          }`}
        >
          Urgent / Critical
        </button>
        <button
          onClick={() => setFilterCategory("maintenance")}
          className={`pill-btn text-xs font-bold px-3.5 py-1.5 rounded-full transition-all ${
            filterCategory === "maintenance"
              ? "bg-[#E8B565] text-[#0E1420] font-bold shadow-sm"
              : "bg-[#161F30] text-[#A6ACC0] border border-[#2B3854] hover:border-[#2B3854] hover:text-[#F5F1E8]"
          }`}
        >
          Facility Maintenance
        </button>
      </div>

      {/* Notice Cards List */}
      <div className="space-y-3.5">
        {filteredNotices.map((notice, idx) => {
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
              className={`list-item-in rounded-2xl p-5 border transition-all ${
                isUrgent
                  ? "bg-[#2A1418] border-[#E2685B]/30 shadow-sm"
                  : "bg-[#161F30] border-[#2B3854] shadow-sm"
              }`}
              style={{ "--stagger-delay": `${Math.min(idx * 40, 320)}ms` } as React.CSSProperties}
            >
              {/* Card Header */}
              <div className="flex items-start justify-between gap-3 mb-2.5">
                <div className="flex items-center gap-2">
                  {notice.isPinned && (
                    <span className="bg-[#1C2740] text-[#F5F1E8] border border-[#2B3854] p-1 rounded-md">
                      <Pin className="w-3 h-3 fill-[#E8B565]" />
                    </span>
                  )}
                  <span
                    className={`text-[10px] uppercase font-bold tracking-wider px-2.5 py-0.5 rounded-full ${
                      isUrgent
                        ? "bg-[#2A1418] text-[#E2685B] border border-[#E2685B]/30"
                        : "bg-[#161F30] text-[#8FBF8A] border border-[#8FBF8A]/30"
                    }`}
                  >
                    {notice.category}
                  </span>
                  {selectedLang !== "en" && (
                    isLoading ? (
                      <span className="text-[10px] font-bold text-[#F5F1E8] bg-[#161F30] border border-[#E8B565]/40 px-2 py-0.5 rounded-full flex items-center gap-1.5 animate-pulse">
                        <Loader2 className="w-2.5 h-2.5 animate-spin" />
                        Translating...
                      </span>
                    ) : (
                      <span className="text-[10px] font-bold text-[#F5F1E8] bg-[#161F30] border border-[#E8B565]/30 px-2 py-0.5 rounded-full flex items-center gap-1">
                        <Sparkles className="w-2.5 h-2.5 text-[#F5F1E8]" />
                        {selectedLang.toUpperCase()} Translation
                      </span>
                    )
                  )}
                </div>

                <span className="text-[11px] text-[#A6ACC0] font-medium">
                  {notice.postedAt}
                </span>
              </div>

              {/* Title & Body with Skeleton Shimmer while loading */}
              {isLoading ? (
                <div
                  className="space-y-2.5 my-2 animate-pulse"
                  aria-label="Loading translation"
                >
                  <div className="h-5 bg-[#1C2740] rounded-lg w-3/4" />
                  <div className="space-y-1.5 pt-1">
                    <div className="h-3.5 bg-[#1C2740]/80 rounded-md w-full" />
                    <div className="h-3.5 bg-[#1C2740]/80 rounded-md w-11/12" />
                    <div className="h-3.5 bg-[#1C2740]/60 rounded-md w-4/5" />
                  </div>
                </div>
              ) : (
                <>
                  <h3
                    className="text-base font-bold leading-snug mb-2 text-[#F5F1E8]"
                  >
                    {displayTitle}
                  </h3>

                  <p
                    className={`text-xs leading-relaxed ${
                      isUrgent ? "text-[#E2685B]/90" : "text-[#A6ACC0]"
                    }`}
                  >
                    {displayBody}
                  </p>
                </>
              )}

              {/* Card Footer */}
              <div className="mt-3.5 pt-3 border-t border-[#2B3854] flex items-center justify-between text-[11px] text-[#A6ACC0]">
                <span className="flex items-center gap-1">
                  <User className="w-3 h-3 text-[#A6ACC0]" />
                  <span>Posted by: {notice.postedBy}</span>
                </span>
                <span className="flex items-center gap-1">
                  <Clock className="w-3 h-3 text-[#A6ACC0]" />
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

