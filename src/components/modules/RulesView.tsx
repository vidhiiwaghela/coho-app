"use client";

import React, { useState } from "react";
import { SocietyRule, FlatUser } from "../../types";
import { RULE_TRANSLATIONS } from "../../lib/translations";
import { PillSearchBar } from "../common/PillSearchBar";
import {
  Scale,
  Calendar,
  AlertOctagon,
  Clock,
  Plus,
  Car,
  Dog,
  VolumeX,
  Hammer,
  Trash2,
  Dumbbell,
  ShieldCheck,
  Tag,
  SearchX,
  Loader2,
} from "lucide-react";

interface RulesViewProps {
  rules: SocietyRule[];
  currentUser: FlatUser;
  onAddRuleClick?: () => void;
  hideHeader?: boolean;
}

const LANGUAGES = [
  { code: "en", label: "English" },
  { code: "hi", label: "हिंदी" },
  { code: "mr", label: "मराठी" },
  { code: "gu", label: "ગુજરાતી" },
];

const CATEGORY_MAP: Record<string, { label: string; icon: React.ElementType }> = {
  all: { label: "All Rules", icon: Scale },
  parking: { label: "Parking & EV", icon: Car },
  renovation: { label: "Renovation Hours", icon: Hammer },
  pets: { label: "Pet Guidelines", icon: Dog },
  noise: { label: "Noise & Parties", icon: VolumeX },
  waste_management: { label: "Waste Segregation", icon: Trash2 },
  clubhouse: { label: "Clubhouse & Gym", icon: Dumbbell },
};

export const RulesView: React.FC<RulesViewProps> = ({
  rules,
  currentUser,
  onAddRuleClick,
  hideHeader = false,
}) => {
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCategory, setSelectedCategory] = useState<string>("all");
  const [selectedLang, setSelectedLang] = useState<"en" | "hi" | "mr" | "gu">("en");
  const [translationsMap, setTranslationsMap] = useState<
    Record<
      string,
      Record<string, { title: string; description: string; penaltyInfo?: string }>
    >
  >({});
  const [loadingMap, setLoadingMap] = useState<Record<string, boolean>>({});
  const [isTranslating, setIsTranslating] = useState<boolean>(false);

  const handleLanguageSelect = async (langCode: "en" | "hi" | "mr" | "gu") => {
    setSelectedLang(langCode);

    if (langCode === "en") {
      return;
    }

    const uncachedRules = rules.filter(
      (r) => !translationsMap[r.id]?.[langCode]
    );

    if (uncachedRules.length === 0) {
      return;
    }

    setIsTranslating(true);
    setLoadingMap((prev) => {
      const updated = { ...prev };
      uncachedRules.forEach((r) => {
        updated[r.id] = true;
      });
      return updated;
    });

    const BATCH_SIZE = 2;
    for (let i = 0; i < uncachedRules.length; i += BATCH_SIZE) {
      const chunk = uncachedRules.slice(i, i + BATCH_SIZE);
      await Promise.all(
        chunk.map(async (rule) => {
          try {
            const [titleRes, descRes, penaltyRes] = await Promise.all([
              fetch("/api/translate", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                  text: rule.title,
                  targetLanguage: langCode,
                }),
              }),
              fetch("/api/translate", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                  text: rule.description,
                  targetLanguage: langCode,
                }),
              }),
              rule.penaltyInfo
                ? fetch("/api/translate", {
                    method: "POST",
                    headers: { "Content-Type": "application/json" },
                    body: JSON.stringify({
                      text: rule.penaltyInfo,
                      targetLanguage: langCode,
                    }),
                  })
                : Promise.resolve(null),
            ]);

            const titleData = await titleRes.json().catch(() => ({}));
            const descData = await descRes.json().catch(() => ({}));
            const penaltyData = penaltyRes
              ? await penaltyRes.json().catch(() => ({}))
              : null;

            const fallback = RULE_TRANSLATIONS[rule.id]?.[langCode];

            const translatedTitle =
              titleData.translatedText || fallback?.title || rule.title;
            const translatedDesc =
              descData.translatedText || fallback?.description || rule.description;
            const translatedPenalty =
              penaltyData?.translatedText || fallback?.penaltyInfo || rule.penaltyInfo;

            setTranslationsMap((prev) => ({
              ...prev,
              [rule.id]: {
                ...(prev[rule.id] || {}),
                [langCode]: {
                  title: translatedTitle,
                  description: translatedDesc,
                  penaltyInfo: translatedPenalty,
                },
              },
            }));
          } catch (err) {
            console.error(
              `Failed to translate rule ${rule.id} to ${langCode}:`,
              err
            );
            const fallback = RULE_TRANSLATIONS[rule.id]?.[langCode];
            setTranslationsMap((prev) => ({
              ...prev,
              [rule.id]: {
                ...(prev[rule.id] || {}),
                [langCode]: {
                  title: fallback?.title || rule.title,
                  description: fallback?.description || rule.description,
                  penaltyInfo: fallback?.penaltyInfo || rule.penaltyInfo,
                },
              },
            }));
          } finally {
            setLoadingMap((prev) => ({ ...prev, [rule.id]: false }));
          }
        })
      );
    }
    setIsTranslating(false);
  };

  const filteredRules = rules.filter((rule) => {
    const matchesCategory =
      selectedCategory === "all" || rule.category === selectedCategory;

    const q = searchQuery.toLowerCase().trim();
    if (!q) return matchesCategory;

    const translated =
      selectedLang !== "en" ? translationsMap[rule.id]?.[selectedLang] : null;
    const ruleTitle = (translated?.title || rule.title).toLowerCase();
    const ruleDesc = (translated?.description || rule.description).toLowerCase();

    const matchesSearch =
      ruleTitle.includes(q) ||
      ruleDesc.includes(q) ||
      rule.originMeeting.toLowerCase().includes(q) ||
      rule.category.toLowerCase().includes(q);

    return matchesCategory && matchesSearch;
  });

  // Check if search matches across other categories
  const globalMatchesCount = searchQuery
    ? rules.filter((r) => {
        const q = searchQuery.toLowerCase().trim();
        const translated =
          selectedLang !== "en" ? translationsMap[r.id]?.[selectedLang] : null;
        const ruleTitle = (translated?.title || r.title).toLowerCase();
        const ruleDesc = (translated?.description || r.description).toLowerCase();

        return (
          ruleTitle.includes(q) ||
          ruleDesc.includes(q) ||
          r.originMeeting.toLowerCase().includes(q) ||
          r.category.toLowerCase().includes(q)
        );
      }).length
    : 0;

  return (
    <div className={`space-y-4 ${hideHeader ? "" : "pb-24"} animate-fade-in`}>
      {/* Header & Description */}
      {!hideHeader && (
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-xl font-extrabold text-primaryText tracking-tight">
              Society Rules & Bylaws
            </h2>
            <p className="text-xs text-secondaryText">
              Searchable, dated regulations with AGM resolution history
            </p>
          </div>

          {currentUser.role === "admin" && onAddRuleClick && (
            <button
              onClick={onAddRuleClick}
              className="bg-[#16233A] text-[#F3F5F9] border border-[#22304A] hover:bg-[#8C97AD]/10 text-xs font-bold px-3.5 py-2 rounded-xl flex items-center gap-1.5 shadow-sm transition-all"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>Add Rule</span>
            </button>
          )}
        </div>
      )}

      {/* Language Selection Pill Bar */}
      <div className="flex items-center gap-1.5 overflow-x-auto no-scrollbar py-2">
        <div className="flex items-center gap-1 bg-[#0A1120] p-1 rounded-full border border-[#22304A]">
          {LANGUAGES.map((lang) => (
            <button
              key={lang.code}
              onClick={() =>
                handleLanguageSelect(lang.code as "en" | "hi" | "mr" | "gu")
              }
              id={`rules-lang-btn-${lang.code}`}
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
        {isTranslating && (
          <div className="flex items-center gap-1.5 text-xs text-[#8C97AD] ml-2 animate-pulse">
            <Loader2 className="w-3.5 h-3.5 animate-spin text-[#F3F5F9]" />
            <span>Translating bylaws...</span>
          </div>
        )}
      </div>

      {/* 1. Pill Search Bar */}
      <PillSearchBar
        value={searchQuery}
        onChange={setSearchQuery}
        placeholder="Search rules (e.g., parking, drilling hours, dog leash, noise)..."
      />

      {/* 2. Category Filter Pills */}
      <div className="flex items-center gap-1.5 overflow-x-auto no-scrollbar pb-1">
        {Object.entries(CATEGORY_MAP).map(([key, item]) => {
          const Icon = item.icon;
          const isActive = selectedCategory === key;
          return (
            <button
              key={key}
              onClick={() => setSelectedCategory(key)}
              className={`pill-btn text-xs font-bold px-3 py-1.5 flex items-center gap-1.5 whitespace-nowrap transition-all ${
                isActive
                  ? "bg-[#EFE4CC] text-[#0A1120] font-bold shadow-sm"
                  : "bg-[#111C2E] text-[#8C97AD] border border-[#22304A] hover:border-[#22304A] hover:text-[#F3F5F9]"
              }`}
            >
              <Icon className={`w-3.5 h-3.5 ${isActive ? "text-[#0A1120]" : "text-[#8C97AD]"}`} />
              <span>{item.label}</span>
            </button>
          );
        })}
      </div>

      {/* 3. Search stats */}
      <div className="flex justify-between items-center text-xs text-[#8C97AD] px-1">
        <span>Showing {filteredRules.length} registered society bylaws</span>
        {searchQuery && (
          <button
            onClick={() => setSearchQuery("")}
            className="text-[#F3F5F9] font-semibold underline"
          >
            Clear Search
          </button>
        )}
      </div>

      {/* 4. Rules List */}
      <div className="space-y-3.5">
        {filteredRules.length > 0 ? (
          filteredRules.map((rule) => {
            const CatIcon = CATEGORY_MAP[rule.category]?.icon || Tag;
            const translated =
              selectedLang !== "en"
                ? translationsMap[rule.id]?.[selectedLang]
                : null;
            const fallback =
              selectedLang !== "en"
                ? RULE_TRANSLATIONS[rule.id]?.[selectedLang]
                : null;

            const displayTitle =
              translated?.title || fallback?.title || rule.title;
            const displayDesc =
              translated?.description || fallback?.description || rule.description;
            const displayPenalty =
              translated?.penaltyInfo ||
              fallback?.penaltyInfo ||
              rule.penaltyInfo;
            const isRuleLoading = loadingMap[rule.id] || false;

            return (
              <div
                key={rule.id}
                className={`bg-[#111C2E] rounded-2xl p-5 border border-[#22304A] shadow-sm space-y-3 hover:border-[#EFE4CC]/40 transition-all ${
                  isRuleLoading ? "opacity-75 animate-pulse" : ""
                }`}
              >
                {/* Rule Title & Category */}
                <div className="flex items-start justify-between gap-3">
                  <div className="flex items-start gap-2.5">
                    <div className="w-8 h-8 rounded-xl bg-[#EFE4CC]/15 text-[#F3F5F9] flex items-center justify-center shrink-0 mt-0.5">
                      <CatIcon className="w-4 h-4" />
                    </div>
                    <div>
                      <h3 className="text-sm font-bold text-[#F3F5F9] leading-snug">
                        {displayTitle}
                      </h3>
                      <span className="text-[10px] text-[#8C97AD] uppercase tracking-wider font-semibold">
                        {rule.category.replace("_", " ")} • Version {rule.version}
                      </span>
                    </div>
                  </div>
                  {isRuleLoading ? (
                    <span className="text-[10px] font-mono text-[#F3F5F9] bg-[#16233A] border border-[#EFE4CC]/30 px-2 py-0.5 rounded-full whitespace-nowrap flex items-center gap-1">
                      <Loader2 className="w-2.5 h-2.5 animate-spin" />
                      Translating
                    </span>
                  ) : (
                    <span className="text-[10px] font-mono font-bold text-[#4FD1A1] bg-[#111C2E] border border-[#4FD1A1]/30 px-2.5 py-0.5 rounded-full whitespace-nowrap">
                      Active
                    </span>
                  )}
                </div>

                {/* Rule Description */}
                <p className="text-xs text-[#F3F5F9]/90 leading-relaxed pl-1">
                  {displayDesc}
                </p>

                {/* Penalty info if present */}
                {displayPenalty && (
                  <div className="flex items-start gap-2 bg-[#2A1418]/60 border border-[#F0736A]/30 rounded-xl p-2.5 text-xs text-[#F0736A]">
                    <AlertOctagon className="w-4 h-4 text-[#F0736A] shrink-0 mt-0.5" />
                    <div>
                      <span className="font-bold">Violation Fine / Penalty: </span>
                      <span>{displayPenalty}</span>
                    </div>
                  </div>
                )}

                {/* Origin Meeting & Dated History Footprint */}
                <div className="pt-2.5 border-t border-[#22304A] flex flex-wrap items-center justify-between gap-2 text-[11px] text-[#8C97AD]">
                  <div className="flex items-center gap-1 bg-[#16233A] border border-[#22304A] px-2.5 py-1 rounded-full">
                    <Clock className="w-3 h-3 text-[#8C97AD]" />
                    <span>Origin: {rule.originMeeting}</span>
                  </div>

                  <div className="flex items-center gap-1">
                    <Calendar className="w-3 h-3 text-[#8C97AD]" />
                    <span>Effective from: {rule.effectiveDate}</span>
                  </div>
                </div>
              </div>
            );
          })
        ) : (
          <div className="bg-[#111C2E] rounded-2xl p-8 text-center border border-[#22304A] space-y-3 shadow-sm">
            <SearchX className="w-8 h-8 text-[#8C97AD] mx-auto" />
            <div>
              <h4 className="font-bold text-sm text-[#F3F5F9]">No matching rules in this category</h4>
              <p className="text-xs text-[#8C97AD] mt-1">
                No rules matched "{searchQuery}" under {CATEGORY_MAP[selectedCategory]?.label}.
              </p>
            </div>

            {selectedCategory !== "all" && globalMatchesCount > 0 && (
              <button
                onClick={() => setSelectedCategory("all")}
                className="pill-btn bg-[#EFE4CC] text-[#0A1120] text-xs font-bold px-4 py-2 shadow-sm"
              >
                Search in All Categories ({globalMatchesCount} matches found)
              </button>
            )}
          </div>
        )}
      </div>
    </div>
  );
};
