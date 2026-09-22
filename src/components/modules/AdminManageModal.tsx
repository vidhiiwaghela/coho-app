"use client";

import React, { useState } from "react";
import { FlatUser, Notice, SocietyRule, DocumentItem, MeetingRecord } from "../../types";
import {
  X,
  ShieldAlert,
  Bell,
  Scale,
  Upload,
  Users,
  Sparkles,
  CheckCircle2,
  BrainCircuit,
} from "lucide-react";

interface AdminManageModalProps {
  isOpen: boolean;
  onClose: () => void;
  currentUser: FlatUser;
  flats: FlatUser[];
  onAddNotice: (notice: Omit<Notice, "id" | "postedAt">) => void;
  onAddRule: (rule: Omit<SocietyRule, "id" | "lastUpdated" | "version">) => void;
  onAddDocument: (doc: Omit<DocumentItem, "id" | "uploadedAt">) => void;
  onAddMeeting: (meeting: Omit<MeetingRecord, "id">) => void;
}

type AdminTab = "notice" | "rule" | "document" | "meeting";

export const AdminManageModal: React.FC<AdminManageModalProps> = ({
  isOpen,
  onClose,
  currentUser,
  flats,
  onAddNotice,
  onAddRule,
  onAddDocument,
  onAddMeeting,
}) => {
  const [activeTab, setActiveTab] = useState<AdminTab>("notice");
  const [successMsg, setSuccessMsg] = useState("");

  // Notice Form State
  const [noticeTitle, setNoticeTitle] = useState("");
  const [noticeContent, setNoticeContent] = useState("");
  const [noticeCategory, setNoticeCategory] = useState<Notice["category"]>("general");
  const [noticePinned, setNoticePinned] = useState(false);

  // Rule Form State
  const [ruleTitle, setRuleTitle] = useState("");
  const [ruleDesc, setRuleDesc] = useState("");
  const [ruleCat, setRuleCat] = useState<SocietyRule["category"]>("parking");
  const [rulePenalty, setRulePenalty] = useState("");
  const [ruleOrigin, setRuleOrigin] = useState("AGM 2026 (Resolution 5.1)");

  // Doc Form State
  const [docTitle, setDocTitle] = useState("");
  const [docCategory, setDocCategory] = useState<DocumentItem["category"]>("noc");
  const [docTargetFlat, setDocTargetFlat] = useState("flat-b402");
  const [docIsSocietyWide, setDocIsSocietyWide] = useState(false);

  // Meeting Form State
  const [meetingTitle, setMeetingTitle] = useState("");
  const [meetingDate, setMeetingDate] = useState("28 Oct 2026");
  const [meetingMinutes, setMeetingMinutes] = useState("");
  const [isGeneratingAI, setIsGeneratingAI] = useState(false);

  if (!isOpen) return null;

  const showSuccess = (msg: string) => {
    setSuccessMsg(msg);
    setTimeout(() => {
      setSuccessMsg("");
      onClose();
    }, 1200);
  };

  const handleSubmitNotice = (e: React.FormEvent) => {
    e.preventDefault();
    if (!noticeTitle || !noticeContent) return;
    onAddNotice({
      title: noticeTitle,
      content: noticeContent,
      category: noticeCategory,
      isPinned: noticePinned,
      postedBy: "Managing Committee (Admin)",
    });
    setNoticeTitle("");
    setNoticeContent("");
    showSuccess("Notice broadcast successfully!");
  };

  const handleSubmitRule = (e: React.FormEvent) => {
    e.preventDefault();
    if (!ruleTitle || !ruleDesc) return;
    onAddRule({
      title: ruleTitle,
      description: ruleDesc,
      category: ruleCat,
      penaltyInfo: rulePenalty,
      originMeeting: ruleOrigin,
      effectiveDate: new Date().toLocaleDateString("en-IN", {
        day: "2-digit",
        month: "short",
        year: "numeric",
      }),
    });
    setRuleTitle("");
    setRuleDesc("");
    setRulePenalty("");
    showSuccess("New society rule registered!");
  };

  const handleSubmitDoc = (e: React.FormEvent) => {
    e.preventDefault();
    if (!docTitle) return;
    onAddDocument({
      title: docTitle,
      category: docCategory,
      flatId: docIsSocietyWide ? undefined : docTargetFlat,
      isSocietyWide: docIsSocietyWide,
      fileUrl: "https://example.com/mock-doc.pdf",
      fileSize: "1.2 MB",
      fileType: "pdf",
      uploadedBy: "Secretary (Emerald Heights)",
    });
    setDocTitle("");
    showSuccess("Document indexed into vault!");
  };

  const handleSubmitMeeting = (e: React.FormEvent) => {
    e.preventDefault();
    if (!meetingTitle || !meetingMinutes) return;

    onAddMeeting({
      title: meetingTitle,
      date: meetingDate,
      meeting_date: meetingDate,
      time: "11:00 AM",
      venue: "Clubhouse Conference Hall",
      agenda: ["Review and approval of agenda items"],
      attendeeCount: 45,
      minutesContent: meetingMinutes,
      minutes_text: meetingMinutes,
      summary_status: "pending",
      summary_text: null,
      aiSummary: {
        overview: "AI Summary generating via Groq (llama-3.3-70b-versatile)...",
        keyDecisions: [],
        actionItems: [],
      },
    });

    setMeetingTitle("");
    setMeetingMinutes("");
    showSuccess("Meeting minutes recorded! Groq AI summary is generating in the background.");
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/75 backdrop-blur-md animate-fade-in">
      <div className="modal-pop-in w-full max-w-lg bg-[#161F30] text-[#F5F1E8] rounded-2xl border border-[#2B3854] shadow-sm overflow-hidden flex flex-col max-h-[90vh]">
        {/* Header */}
        <div className="p-4 bg-[#1C2740] flex items-center justify-between border-b border-[#2B3854]">
          <div className="flex items-center gap-2">
            <div className="w-7 h-7 rounded-lg bg-[#E8B565] text-[#0E1420] flex items-center justify-center font-bold shadow-sm">
              <ShieldAlert className="w-4 h-4" />
            </div>
            <div>
              <h3 className="text-sm font-bold text-[#F5F1E8] leading-tight">
                Managing Committee Admin Console
              </h3>
              <p className="text-[11px] text-[#A6ACC0]">Emerald Heights RWA Executive Actions</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-full hover:bg-white/[0.08] text-[#A6ACC0] hover:text-[#F5F1E8] transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Tab Navigation */}
        <div className="flex bg-[#161F30] border-b border-[#2B3854] px-3 pt-2 gap-1 overflow-x-auto no-scrollbar">
          {[
            { id: "notice", label: "Broadcast Notice", icon: Bell },
            { id: "rule", label: "Add Rule", icon: Scale },
            { id: "document", label: "Upload Doc", icon: Upload },
            { id: "meeting", label: "Record Meeting", icon: Users },
          ].map((tab) => {
            const Icon = tab.icon;
            const isActive = activeTab === tab.id;
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id as AdminTab)}
                className={`py-2 px-3 rounded-t-xl text-xs font-bold flex items-center gap-1.5 transition-all ${
                  isActive
                    ? "bg-[#1C2740] text-[#F5F1E8] border-t-2 border-[#E8B565]"
                    : "text-[#A6ACC0] hover:text-[#F5F1E8]"
                }`}
              >
                <Icon className="w-3.5 h-3.5" />
                <span>{tab.label}</span>
              </button>
            );
          })}
        </div>

        {/* Form Body */}
        <div className="p-5 overflow-y-auto flex-1 text-xs space-y-4">
          {successMsg ? (
            <div className="py-12 text-center space-y-3 animate-fade-in">
              <CheckCircle2 className="w-12 h-12 text-[#F5F1E8] mx-auto" />
              <h4 className="text-lg font-bold text-[#F5F1E8]">{successMsg}</h4>
            </div>
          ) : (
            <>
              {/* TAB 1: Post Notice */}
              {activeTab === "notice" && (
                <form onSubmit={handleSubmitNotice} className="space-y-3.5">
                  <div>
                    <label className="text-[#A6ACC0] block mb-1 font-semibold">
                      Notice Heading
                    </label>
                    <input
                      type="text"
                      required
                      placeholder="e.g. Lift #2 Maintenance on Saturday"
                      value={noticeTitle}
                      onChange={(e) => setNoticeTitle(e.target.value)}
                      className="w-full bg-[#1C2740] text-[#F5F1E8] p-2.5 rounded-xl border border-[#2B3854] focus:outline-none focus:ring-1 focus:ring-[#F5F1E8]"
                    />
                  </div>

                  <div className="grid grid-cols-2 gap-2">
                    <div>
                      <label className="text-[#A6ACC0] block mb-1 font-semibold">Priority</label>
                      <select
                        value={noticeCategory}
                        onChange={(e) =>
                          setNoticeCategory(e.target.value as Notice["category"])
                        }
                        className="w-full bg-[#1C2740] text-[#F5F1E8] p-2.5 rounded-xl border border-[#2B3854] focus:outline-none focus:ring-1 focus:ring-[#F5F1E8]"
                      >
                        <option value="general">General</option>
                        <option value="urgent">Urgent</option>
                        <option value="maintenance">Maintenance</option>
                        <option value="event">Event</option>
                      </select>
                    </div>

                    <div className="flex items-center pt-5 pl-2">
                      <label className="flex items-center gap-2 cursor-pointer text-[#F5F1E8] font-medium">
                        <input
                          type="checkbox"
                          checked={noticePinned}
                          onChange={(e) => setNoticePinned(e.target.checked)}
                          className="w-4 h-4 rounded text-[#F5F1E8] focus:ring-[#F5F1E8] accent-[#F5F1E8]"
                        />
                        <span>Pin to top</span>
                      </label>
                    </div>
                  </div>

                  <div>
                    <label className="text-[#A6ACC0] block mb-1 font-semibold">
                      Notice Description
                    </label>
                    <textarea
                      rows={3}
                      required
                      placeholder="Detailed announcement content..."
                      value={noticeContent}
                      onChange={(e) => setNoticeContent(e.target.value)}
                      className="w-full bg-[#1C2740] text-[#F5F1E8] p-2.5 rounded-xl border border-[#2B3854] focus:outline-none focus:ring-1 focus:ring-[#F5F1E8] resize-none"
                    />
                  </div>

                  <button
                    type="submit"
                    className="w-full bg-[#E8B565] hover:bg-[#F0C87D] text-[#0E1420] font-bold py-3 rounded-xl shadow-sm transition-all"
                  >
                    Broadcast Notice to Residents
                  </button>
                </form>
              )}

              {/* TAB 2: Add Rule */}
              {activeTab === "rule" && (
                <form onSubmit={handleSubmitRule} className="space-y-3.5">
                  <div>
                    <label className="text-[#A6ACC0] block mb-1 font-semibold">Rule Title</label>
                    <input
                      type="text"
                      required
                      placeholder="e.g. Balcony Planter Safety Protocol"
                      value={ruleTitle}
                      onChange={(e) => setRuleTitle(e.target.value)}
                      className="w-full bg-[#1C2740] text-[#F5F1E8] p-2.5 rounded-xl border border-[#2B3854] focus:outline-none focus:ring-1 focus:ring-[#F5F1E8]"
                    />
                  </div>

                  <div className="grid grid-cols-2 gap-2">
                    <div>
                      <label className="text-[#A6ACC0] block mb-1 font-semibold">Category</label>
                      <select
                        value={ruleCat}
                        onChange={(e) =>
                          setRuleCat(e.target.value as SocietyRule["category"])
                        }
                        className="w-full bg-[#1C2740] text-[#F5F1E8] p-2.5 rounded-xl border border-[#2B3854] focus:outline-none focus:ring-1 focus:ring-[#F5F1E8]"
                      >
                        <option value="parking">Parking</option>
                        <option value="renovation">Renovation</option>
                        <option value="pets">Pets</option>
                        <option value="noise">Noise</option>
                        <option value="waste_management">Waste Management</option>
                        <option value="clubhouse">Clubhouse</option>
                        <option value="general">General</option>
                      </select>
                    </div>

                    <div>
                      <label className="text-[#A6ACC0] block mb-1 font-semibold">Origin AGM / Meeting</label>
                      <input
                        type="text"
                        value={ruleOrigin}
                        onChange={(e) => setRuleOrigin(e.target.value)}
                        className="w-full bg-[#1C2740] text-[#F5F1E8] p-2.5 rounded-xl border border-[#2B3854] focus:outline-none focus:ring-1 focus:ring-[#F5F1E8]"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="text-[#A6ACC0] block mb-1 font-semibold">
                      Rule Description
                    </label>
                    <textarea
                      rows={2}
                      required
                      placeholder="Details of the society regulation..."
                      value={ruleDesc}
                      onChange={(e) => setRuleDesc(e.target.value)}
                      className="w-full bg-[#1C2740] text-[#F5F1E8] p-2.5 rounded-xl border border-[#2B3854] focus:outline-none focus:ring-1 focus:ring-[#F5F1E8] resize-none"
                    />
                  </div>

                  <div>
                    <label className="text-[#A6ACC0] block mb-1 font-semibold">
                      Penalty / Fine (Optional)
                    </label>
                    <input
                      type="text"
                      placeholder="e.g. ₹500 fine per violation"
                      value={rulePenalty}
                      onChange={(e) => setRulePenalty(e.target.value)}
                      className="w-full bg-[#1C2740] text-[#F5F1E8] p-2.5 rounded-xl border border-[#2B3854] focus:outline-none focus:ring-1 focus:ring-[#F5F1E8]"
                    />
                  </div>

                  <button
                    type="submit"
                    className="w-full bg-[#E8B565] hover:bg-[#F0C87D] text-[#0E1420] font-bold py-3 rounded-xl shadow-sm transition-all"
                  >
                    Register Society Bylaw
                  </button>
                </form>
              )}

              {/* TAB 3: Upload Document */}
              {activeTab === "document" && (
                <form onSubmit={handleSubmitDoc} className="space-y-3.5">
                  <div>
                    <label className="text-[#A6ACC0] block mb-1 font-semibold">Document Title</label>
                    <input
                      type="text"
                      required
                      placeholder="e.g. Share Certificate (Duplicate Issue)"
                      value={docTitle}
                      onChange={(e) => setDocTitle(e.target.value)}
                      className="w-full bg-[#1C2740] text-[#F5F1E8] p-2.5 rounded-xl border border-[#2B3854] focus:outline-none focus:ring-1 focus:ring-[#F5F1E8]"
                    />
                  </div>

                  <div className="grid grid-cols-2 gap-2">
                    <div>
                      <label className="text-[#A6ACC0] block mb-1 font-semibold">Category</label>
                      <select
                        value={docCategory}
                        onChange={(e) =>
                          setDocCategory(e.target.value as DocumentItem["category"])
                        }
                        className="w-full bg-[#1C2740] text-[#F5F1E8] p-2.5 rounded-xl border border-[#2B3854] focus:outline-none focus:ring-1 focus:ring-[#F5F1E8]"
                      >
                        <option value="noc">Society NOC</option>
                        <option value="share_certificate">Share Certificate</option>
                        <option value="agreement">Agreement Copy</option>
                        <option value="bylaws">Society Bylaws</option>
                        <option value="insurance">Insurance / Audit</option>
                      </select>
                    </div>

                    <div>
                      <label className="text-[#A6ACC0] block mb-1 font-semibold">Scope</label>
                      <select
                        value={docIsSocietyWide ? "society" : docTargetFlat}
                        onChange={(e) => {
                          if (e.target.value === "society") {
                            setDocIsSocietyWide(true);
                          } else {
                            setDocIsSocietyWide(false);
                            setDocTargetFlat(e.target.value);
                          }
                        }}
                        className="w-full bg-[#1C2740] text-[#F5F1E8] p-2.5 rounded-xl border border-[#2B3854] focus:outline-none focus:ring-1 focus:ring-[#F5F1E8]"
                      >
                        <option value="society">Society-Wide Master Record</option>
                        {flats.map((f) => (
                          <option key={f.id} value={f.id}>
                            Flat {f.flatNumber} ({f.residentName})
                          </option>
                        ))}
                      </select>
                    </div>
                  </div>

                  <div className="p-4 border border-dashed border-white/[0.12] rounded-2xl text-center bg-[#1C2740] space-y-1">
                    <Upload className="w-6 h-6 text-[#F5F1E8] mx-auto mb-1" />
                    <span className="font-semibold text-[#F5F1E8] block">Select File (PDF / DOC)</span>
                    <span className="text-[10px] text-[#A6ACC0]">
                      (Simulation mode: attaches standard verified PDF template)
                    </span>
                  </div>

                  <button
                    type="submit"
                    className="w-full bg-[#E8B565] hover:bg-[#F0C87D] text-[#0E1420] font-bold py-3 rounded-xl shadow-sm transition-all"
                  >
                    Index into Document Vault
                  </button>
                </form>
              )}

              {/* TAB 4: Record Meeting */}
              {activeTab === "meeting" && (
                <form onSubmit={handleSubmitMeeting} className="space-y-3.5">
                  <div>
                    <label className="text-[#A6ACC0] block mb-1 font-semibold">Meeting Title</label>
                    <input
                      type="text"
                      required
                      placeholder="e.g. 53rd Annual General Meeting (AGM)"
                      value={meetingTitle}
                      onChange={(e) => setMeetingTitle(e.target.value)}
                      className="w-full bg-[#1C2740] text-[#F5F1E8] p-2.5 rounded-xl border border-[#2B3854] focus:outline-none focus:ring-1 focus:ring-[#F5F1E8]"
                    />
                  </div>

                  <div>
                    <label className="text-[#A6ACC0] block mb-1 font-semibold">
                      Official Recorded Minutes
                    </label>
                    <textarea
                      rows={4}
                      required
                      placeholder="Paste recorded minutes text here. Antigravity AI will automatically extract executive overview, key decisions, and action items..."
                      value={meetingMinutes}
                      onChange={(e) => setMeetingMinutes(e.target.value)}
                      className="w-full bg-[#1C2740] text-[#F5F1E8] p-2.5 rounded-xl border border-[#2B3854] focus:outline-none focus:ring-1 focus:ring-[#F5F1E8] resize-none"
                    />
                  </div>

                  <button
                    type="submit"
                    disabled={isGeneratingAI}
                    className="w-full bg-[#E8B565] hover:bg-[#F0C87D] text-[#0E1420] font-bold py-3 rounded-xl shadow-sm flex items-center justify-center gap-2 transition-all"
                  >
                    {isGeneratingAI ? (
                      <div className="w-4 h-4 border-2 border-[#0E1420] border-t-transparent rounded-full animate-spin" />
                    ) : (
                      <>
                        <Sparkles className="w-4 h-4 stroke-[2.5]" />
                        <span>Generate AI Summary & Publish Minutes</span>
                      </>
                    )}
                  </button>
                </form>
              )}
            </>
          )}
        </div>
      </div>
    </div>
  );
};
