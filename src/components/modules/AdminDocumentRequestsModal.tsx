"use client";

import React, { useState } from "react";
import { DocumentRequest } from "../../types";
import { DEFAULT_UNAVAILABLE_DOC_MESSAGE } from "../../lib/constants";
import {
  X,
  FileText,
  CheckCircle2,
  Clock,
  DownloadCloud,
  FileCheck,
  Check,
  Upload,
  Send,
  Loader2,
  Mail,
  Paperclip,
  AlertCircle,
} from "lucide-react";

interface AdminDocumentRequestsModalProps {
  isOpen: boolean;
  onClose: () => void;
  requests: DocumentRequest[];
  onFulfillRequest: (requestId: string, fileName?: string) => void;
  onMarkNotAvailable?: (requestId: string, reason?: string) => void;
  initialFilter?: "all" | "pending" | "fulfilled" | "unavailable" | "not_available";
  isAdmin?: boolean;
  onRequestNewDoc?: () => void;
}

export const AdminDocumentRequestsModal: React.FC<AdminDocumentRequestsModalProps> = ({
  isOpen,
  onClose,
  requests,
  onFulfillRequest,
  onMarkNotAvailable,
  initialFilter = "all",
  isAdmin = true,
  onRequestNewDoc,
}) => {
  const [filter, setFilter] = useState<"all" | "pending" | "fulfilled" | "unavailable">("all");
  const [selectedFiles, setSelectedFiles] = useState<Record<string, File>>({});
  const [sendingStates, setSendingStates] = useState<Record<string, boolean>>({});
  const [errorMessages, setErrorMessages] = useState<Record<string, string>>({});
  const [rejectingId, setRejectingId] = useState<string | null>(null);
  const [rejectReason, setRejectReason] = useState<string>("");
  const [toastMessage, setToastMessage] = useState<{
    title: string;
    description: string;
    isError?: boolean;
  } | null>(null);

  React.useEffect(() => {
    if (initialFilter) {
      if (initialFilter === "not_available") {
        setFilter("unavailable");
      } else {
        setFilter(initialFilter as any);
      }
    }
  }, [initialFilter, isOpen]);

  if (!isOpen) return null;

  const filteredRequests = requests.filter((r) => {
    if (filter === "pending") return r.status === "pending";
    if (filter === "fulfilled") return r.status === "fulfilled";
    if (filter === "unavailable") return r.status === "unavailable" || r.status === "not_available";
    return true;
  });

  const pendingCount = requests.filter((r) => r.status === "pending").length;

  const handleFileChange = (requestId: string, e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setSelectedFiles((prev) => ({ ...prev, [requestId]: file }));
      setErrorMessages((prev) => {
        const copy = { ...prev };
        delete copy[requestId];
        return copy;
      });
    }
  };

  const handleRemoveFile = (requestId: string) => {
    setSelectedFiles((prev) => {
      const copy = { ...prev };
      delete copy[requestId];
      return copy;
    });
  };

  const formatFileSize = (bytes: number) => {
    if (bytes < 1024 * 1024) {
      return `${(bytes / 1024).toFixed(1)} KB`;
    }
    return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
  };

  const handleSendDocument = async (req: DocumentRequest) => {
    const file = selectedFiles[req.id];
    if (!file) return;

    const emailToSend = req.deliveryEmail?.trim();
    if (!emailToSend) {
      const errText = "No recipient delivery email found for this request.";
      setErrorMessages((prev) => ({
        ...prev,
        [req.id]: errText,
      }));
      setToastMessage({
        title: "Dispatch Failed",
        description: errText,
        isError: true,
      });
      return;
    }

    setSendingStates((prev) => ({ ...prev, [req.id]: true }));
    setErrorMessages((prev) => {
      const copy = { ...prev };
      delete copy[req.id];
      return copy;
    });

    try {
      // Convert file to base64 for reliable transmission
      const fileBase64 = await new Promise<string>((resolve, reject) => {
        const reader = new FileReader();
        reader.onload = () => resolve(reader.result as string);
        reader.onerror = () => reject(new Error("Failed to read file from local disk."));
        reader.readAsDataURL(file);
      });

      const res = await fetch("/api/send-document", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          toEmail: emailToSend,
          documentTitle: req.documentName,
          flatNumber: req.flatNumber,
          residentName: req.residentName,
          fileName: file.name,
          fileBase64: fileBase64,
          requestId: req.id,
        }),
      });

      const data = await res.json().catch(() => ({}));

      // STRICT VALIDATION: Check for HTTP 200 and explicit success: true
      if (!res.ok || !data.success) {
        const errorText = data.error || `Failed to dispatch email (HTTP ${res.status})`;
        throw new Error(errorText);
      }

      // ONLY mark as fulfilled when the API explicitly returns success: true
      onFulfillRequest(req.id, file.name);

      // Clear selected file for this request
      setSelectedFiles((prev) => {
        const copy = { ...prev };
        delete copy[req.id];
        return copy;
      });

      // Show success toast
      setToastMessage({
        title: "Document Dispatched Successfully!",
        description: `Emailed verified ${file.name} to ${emailToSend}`,
        isError: false,
      });

      setTimeout(() => {
        setToastMessage(null);
      }, 5000);
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : "Failed to dispatch email.";
      setErrorMessages((prev) => ({
        ...prev,
        [req.id]: msg,
      }));
      // Display alert toast showing the exact error message from backend
      setToastMessage({
        title: "Email Dispatch Failed",
        description: msg,
        isError: true,
      });
    } finally {
      setSendingStates((prev) => ({ ...prev, [req.id]: false }));
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-fade-in">
      {/* Toast Notification (Success or Error Alert) */}
      {toastMessage && (
        <div className="fixed top-5 inset-x-4 max-w-md mx-auto z-50 animate-bounce">
          <div
            className={`rounded-2xl p-4 shadow-sm flex items-start justify-between gap-3 text-left border ${
              toastMessage.isError
                ? "bg-[#2A1418] border-[#E2685B]/30 text-[#E2685B]"
                : "bg-[#161F30] border-[#8FBF8A]/30 text-[#F5F1E8]"
            }`}
          >
            <div className="flex items-start gap-3">
              <div
                className={`w-8 h-8 rounded-xl flex items-center justify-center shrink-0 mt-0.5 ${
                  toastMessage.isError
                    ? "bg-[#E2685B]/20 text-[#E2685B]"
                    : "bg-[#8FBF8A]/20 text-[#8FBF8A]"
                }`}
              >
                {toastMessage.isError ? (
                  <AlertCircle className="w-5 h-5 text-[#E2685B]" />
                ) : (
                  <CheckCircle2 className="w-4 h-4 text-[#8FBF8A]" />
                )}
              </div>
              <div>
                <h4
                  className={`text-xs font-bold ${
                    toastMessage.isError ? "text-[#E2685B]" : "text-[#F5F1E8]"
                  }`}
                >
                  {toastMessage.title}
                </h4>
                <p
                  className={`text-[11px] mt-0.5 leading-relaxed ${
                    toastMessage.isError ? "text-[#E2685B]/90 font-mono" : "text-[#A6ACC0]"
                  }`}
                >
                  {toastMessage.description}
                </p>
              </div>
            </div>
            <button
              onClick={() => setToastMessage(null)}
              className="text-[#A6ACC0] hover:text-[#F5F1E8] p-1 rounded-full hover:bg-black/30 transition cursor-pointer"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>
      )}

      <div className="bg-[#161F30] border border-[#2B3854] rounded-2xl w-full max-w-xl shadow-sm p-6 relative animate-scale-up space-y-5 text-[#F5F1E8] max-h-[90vh] flex flex-col">
        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 text-[#A6ACC0] hover:text-[#F5F1E8] p-1.5 rounded-full hover:bg-[#1C2740] transition-colors"
          id="btn-close-admin-doc-modal"
          aria-label="Close Modal"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Modal Header */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-[#E8B565]/15 text-[#F5F1E8] border border-[#E8B565]/30 flex items-center justify-center shrink-0">
              <FileText className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="text-base font-bold text-[#F5F1E8]">
                  {isAdmin ? "Member Document Requests Queue" : "My Document Requests"}
                </h3>
                {pendingCount > 0 && (
                  <span className="text-[#A9B4CC] bg-[#161F30] border border-[#A9B4CC]/30 text-[10px] font-bold px-2 py-0.5 rounded-full">
                    {pendingCount} Pending
                  </span>
                )}
              </div>
              <p className="text-xs text-[#A6ACC0]">
                {isAdmin
                  ? "Review, upload stamped file & email official NOCs and certificates directly to residents"
                  : "Track the status of your requested society certificates and NOCs"}
              </p>
            </div>
          </div>
          {!isAdmin && onRequestNewDoc && (
            <button
              type="button"
              onClick={() => {
                onClose();
                onRequestNewDoc();
              }}
              className="mr-8 bg-[#E8B565] hover:bg-[#F0C87D] text-[#0E1420] font-bold text-xs px-3.5 py-1.5 rounded-xl shadow-sm transition active:scale-95 shrink-0 cursor-pointer"
            >
              + New Request
            </button>
          )}
        </div>

        {/* Filter Tabs */}
        <div className="flex items-center gap-1.5 overflow-x-auto no-scrollbar">
          {(["all", "pending", "fulfilled", "unavailable"] as const).map((f) => (
            <button
              key={f}
              onClick={() => setFilter(f)}
              className={`pill-btn text-xs font-bold px-3 py-1.5 rounded-full transition-all whitespace-nowrap cursor-pointer ${
                filter === f
                  ? "bg-[#E8B565] text-[#0E1420] font-bold shadow-sm"
                  : "bg-[#161F30] text-[#A6ACC0] border border-[#2B3854] hover:border-[#2B3854] hover:text-[#F5F1E8]"
              }`}
            >
              {f === "all"
                ? `All (${requests.length})`
                : f === "unavailable"
                ? `Not Available (${requests.filter((r) => r.status === "unavailable" || r.status === "not_available").length})`
                : `${f.charAt(0).toUpperCase() + f.slice(1)} (${requests.filter((r) => r.status === f).length})`}
            </button>
          ))}
        </div>

        {/* Request Queue List */}
        <div className="flex-1 overflow-y-auto space-y-3.5 pr-1">
          {filteredRequests.length > 0 ? (
            filteredRequests.map((req) => {
              const isFulfilled = req.status === "fulfilled";
              const isNotAvailable = req.status === "unavailable" || req.status === "not_available";
              const isPending = req.status === "pending";
              const selectedFile = selectedFiles[req.id];
              const isSending = Boolean(sendingStates[req.id]);
              const errorMsg = errorMessages[req.id];

              return (
                <div
                  key={req.id}
                  className="p-4 rounded-xl bg-[#1C2740]/40 border border-[#2B3854] space-y-3 transition-all shadow-sm"
                >
                  {/* Card Header: Flat, Title & Status */}
                  <div className="flex items-start justify-between gap-3">
                    <div className="min-w-0">
                      <div className="flex items-center gap-2 flex-wrap">
                        <span className="text-xs font-bold text-[#F5F1E8] bg-[#161F30] border border-[#2B3854] px-2 py-0.5 rounded-md shrink-0">
                          Flat {req.flatNumber}
                        </span>
                        <h4 className="text-sm font-bold text-[#F5F1E8] truncate">
                          {req.documentName}
                        </h4>
                      </div>
                      <p className="text-xs text-[#A6ACC0] mt-1">
                        Requested by <strong>{req.residentName}</strong> • {req.requestedAt}
                      </p>
                    </div>

                    <div className="shrink-0">
                      {isFulfilled ? (
                        <span className="inline-flex items-center gap-1 text-[10px] font-bold text-[#8FBF8A] bg-[#161F30] border border-[#8FBF8A]/30 px-2.5 py-0.5 rounded-full">
                          <CheckCircle2 className="w-3 h-3 text-[#8FBF8A]" />
                          <span>Fulfilled</span>
                        </span>
                      ) : isNotAvailable ? (
                        <span className="inline-flex items-center gap-1 text-[10px] font-bold text-[#E2685B] bg-[#2A1418] border border-[#E2685B]/30 px-2.5 py-0.5 rounded-full">
                          <AlertCircle className="w-3 h-3 text-[#E2685B]" />
                          <span>Not Available</span>
                        </span>
                      ) : (
                        <span className="inline-flex items-center gap-1 text-[10px] font-bold text-[#A9B4CC] bg-[#161F30] border border-[#A9B4CC]/30 px-2.5 py-0.5 rounded-full">
                          <Clock className="w-3 h-3 text-[#A9B4CC]" />
                          <span>Pending</span>
                        </span>
                      )}
                    </div>
                  </div>

                  {/* Delivery Email Banner for digital requests */}
                  {req.copyType === "digital" && (
                    <div className="flex items-center gap-2 text-xs bg-[#0E1420] px-3 py-2 rounded-xl border border-[#2B3854]">
                      <Mail className="w-3.5 h-3.5 text-[#F5F1E8] shrink-0" />
                      <span className="text-[#A6ACC0] text-[11px]">Delivery Email:</span>
                      <span className="font-semibold text-[#F5F1E8] text-[12px] truncate">
                        {req.deliveryEmail || "Not specified (using resident registered email)"}
                      </span>
                    </div>
                  )}

                  {/* Format & Completed timestamp */}
                  <div className="flex items-center justify-between text-xs pt-1 border-t border-[#2B3854]">
                    <div className="flex items-center gap-2 text-[11px] text-[#A6ACC0]">
                      <span className="font-semibold uppercase text-[#F5F1E8]">Format:</span>
                      <span className="inline-flex items-center gap-1">
                        {req.copyType === "digital" ? (
                          <>
                            <DownloadCloud className="w-3 h-3 text-[#F5F1E8]" />
                            <span>Digital Copy (PDF)</span>
                          </>
                        ) : (
                          <>
                            <FileCheck className="w-3 h-3 text-[#F5F1E8]" />
                            <span>Physical Copy (Signed Hardcopy)</span>
                          </>
                        )}
                      </span>
                    </div>

                    {isFulfilled && req.fulfilledAt && (
                      <span className="text-[11px] text-[#8FBF8A] font-medium">
                        Completed: {req.fulfilledAt}
                      </span>
                    )}
                  </div>

                  {req.note && (
                    <div className="text-[11px] text-[#A6ACC0] bg-[#161F30] p-2.5 rounded-lg border border-[#2B3854]">
                      <strong className="text-[#F5F1E8]">Note from Resident:</strong> {req.note}
                    </div>
                  )}

                  {/* Office Status: Not Available Reason Callout with Configurable Default Message */}
                  {isNotAvailable && (
                    <div className="flex items-start gap-2.5 text-xs bg-[#2A1418] border border-[#E2685B]/40 p-3.5 rounded-xl text-[#E2685B] shadow-sm animate-fade-in">
                      <AlertCircle className="w-4 h-4 shrink-0 mt-0.5 text-[#E2685B]" />
                      <div className="space-y-1">
                        <span className="font-bold text-[11px] block uppercase tracking-wider text-[#E2685B]">
                          Office Status: Document Not Available
                        </span>
                        <p className="text-[12px] text-[#F5F1E8]/90 leading-relaxed font-normal">
                          {req.notAvailableReason?.trim() || DEFAULT_UNAVAILABLE_DOC_MESSAGE}
                        </p>
                      </div>
                    </div>
                  )}

                  {/* Attached File Display for Fulfilled Digital Requests */}
                  {isFulfilled && req.copyType === "digital" && req.fulfilledFileName && (
                    <div className="flex items-center gap-2 text-xs text-[#8FBF8A] bg-[#0E1420] px-3 py-2 rounded-xl border border-[#8FBF8A]/30">
                      <Paperclip className="w-3.5 h-3.5" />
                      <span className="text-[11px] font-medium">
                        Dispatched Document: <strong>{req.fulfilledFileName}</strong>
                      </span>
                    </div>
                  )}

                  {/* Fulfilled Physical Request Banner */}
                  {isFulfilled && req.copyType === "physical" && (
                    <div className="flex items-center gap-2 text-xs text-[#8FBF8A] bg-[#0E1420] px-3 py-2 rounded-xl border border-[#8FBF8A]/30">
                      <CheckCircle2 className="w-3.5 h-3.5" />
                      <span className="text-[11px] font-medium">
                        Physical copy signed, stamped & ready for collection at Society Office.
                      </span>
                    </div>
                  )}

                  {/* Pending State for Residents */}
                  {isPending && !isAdmin && (
                    <div className="text-[11px] text-[#A6ACC0] bg-[#161F30] p-2.5 rounded-xl border border-[#2B3854]">
                      Under review by Society Managing Committee. You will receive an update once processed.
                    </div>
                  )}

                  {/* Admin Resolution Actions for Pending Requests */}
                  {isPending && isAdmin && (
                    <>
                      {req.copyType === "physical" ? (
                        /* PHYSICAL COPY: EXACTLY TWO ACTIONS (Mark as Done vs Document Not Available) */
                        <div className="pt-2 border-t border-[#2B3854] space-y-2">
                          {rejectingId === req.id ? (
                            <div className="space-y-2.5 bg-[#161F30] p-3 rounded-xl border border-[#E2685B]/40 animate-fade-in">
                              <div className="flex items-center justify-between text-xs">
                                <span className="font-bold text-[#E2685B]">Reason for Unavailability:</span>
                                <span className="text-[10px] text-[#A6ACC0]">Visible to resident</span>
                              </div>
                              <input
                                type="text"
                                value={rejectReason}
                                onChange={(e) => setRejectReason(e.target.value)}
                                placeholder={DEFAULT_UNAVAILABLE_DOC_MESSAGE}
                                className="w-full bg-[#0E1420] border border-[#2B3854] rounded-xl p-2.5 text-xs text-[#F5F1E8] placeholder-[#A6ACC0]/40 focus:outline-none focus:border-[#E2685B]"
                                autoFocus
                              />
                              <div className="flex items-center justify-end gap-2">
                                <button
                                  type="button"
                                  onClick={() => {
                                    setRejectingId(null);
                                    setRejectReason("");
                                  }}
                                  className="px-3 py-1.5 text-xs text-[#A6ACC0] hover:text-[#F5F1E8] cursor-pointer"
                                >
                                  Cancel
                                </button>
                                <button
                                  type="button"
                                  onClick={() => {
                                    onMarkNotAvailable?.(req.id, rejectReason.trim() || DEFAULT_UNAVAILABLE_DOC_MESSAGE);
                                    setRejectingId(null);
                                    setRejectReason("");
                                  }}
                                  className="bg-[#2A1418] hover:bg-[#381B20] text-[#E2685B] border border-[#E2685B]/50 font-bold text-xs px-3.5 py-1.5 rounded-xl shadow-sm transition active:scale-95 cursor-pointer"
                                >
                                  Confirm Not Available
                                </button>
                              </div>
                            </div>
                          ) : (
                            <div className="flex items-center justify-between gap-3 pt-1">
                              <button
                                type="button"
                                onClick={() => {
                                  setRejectingId(req.id);
                                  setRejectReason("");
                                }}
                                className="bg-[#2A1418] hover:bg-[#381B20] text-[#E2685B] border border-[#E2685B]/40 font-bold text-xs px-3.5 py-2 rounded-xl transition cursor-pointer active:scale-95"
                              >
                                Document Not Available
                              </button>
                              <button
                                type="button"
                                onClick={() => onFulfillRequest(req.id)}
                                className="bg-[#8FBF8A] hover:bg-[#5CE0AF] text-[#0E1420] font-black text-xs px-4 py-2 rounded-xl flex items-center gap-1.5 shadow-sm transition active:scale-95 cursor-pointer"
                              >
                                <Check className="w-4 h-4" />
                                <span>Mark as Done</span>
                              </button>
                            </div>
                          )}
                        </div>
                      ) : (
                        /* DIGITAL COPY: FILE UPLOAD + EMAIL DISPATCH OR MARK NOT AVAILABLE */
                        <div className="pt-2 border-t border-[#2B3854] space-y-3">
                          {rejectingId === req.id ? (
                            <div className="space-y-2.5 bg-[#161F30] p-3 rounded-xl border border-[#E2685B]/40 animate-fade-in">
                              <div className="flex items-center justify-between text-xs">
                                <span className="font-bold text-[#E2685B]">Reason for Unavailability:</span>
                                <span className="text-[10px] text-[#A6ACC0]">Visible to resident</span>
                              </div>
                              <input
                                type="text"
                                value={rejectReason}
                                onChange={(e) => setRejectReason(e.target.value)}
                                placeholder={DEFAULT_UNAVAILABLE_DOC_MESSAGE}
                                className="w-full bg-[#0E1420] border border-[#2B3854] rounded-xl p-2.5 text-xs text-[#F5F1E8] placeholder-[#A6ACC0]/40 focus:outline-none focus:border-[#E2685B]"
                                autoFocus
                              />
                              <div className="flex items-center justify-end gap-2">
                                <button
                                  type="button"
                                  onClick={() => {
                                    setRejectingId(null);
                                    setRejectReason("");
                                  }}
                                  className="px-3 py-1.5 text-xs text-[#A6ACC0] hover:text-[#F5F1E8] cursor-pointer"
                                >
                                  Cancel
                                </button>
                                <button
                                  type="button"
                                  onClick={() => {
                                    onMarkNotAvailable?.(req.id, rejectReason.trim() || DEFAULT_UNAVAILABLE_DOC_MESSAGE);
                                    setRejectingId(null);
                                    setRejectReason("");
                                  }}
                                  className="bg-[#2A1418] hover:bg-[#381B20] text-[#E2685B] border border-[#E2685B]/50 font-bold text-xs px-3.5 py-1.5 rounded-xl shadow-sm transition active:scale-95 cursor-pointer"
                                >
                                  Confirm Not Available
                                </button>
                              </div>
                            </div>
                          ) : (
                            <>
                              {/* Hidden File Input */}
                              <input
                                type="file"
                                id={`file-input-${req.id}`}
                                accept=".pdf,.png,.jpg,.jpeg,application/pdf,image/png,image/jpeg"
                                onChange={(e) => handleFileChange(req.id, e)}
                                className="hidden"
                              />

                              {/* File Selection Box */}
                              {!selectedFile ? (
                                <label
                                  htmlFor={`file-input-${req.id}`}
                                  className="cursor-pointer flex items-center justify-between p-3 rounded-xl border border-dashed border-[#2B3854] hover:border-[#E8B565] hover:bg-[#1C2740]/50 transition group"
                                  id={`upload-box-${req.id}`}
                                >
                                  <div className="flex items-center gap-3">
                                    <div className="w-8 h-8 rounded-lg bg-[#161F30] text-[#F5F1E8] flex items-center justify-center group-hover:scale-105 transition-transform shrink-0">
                                      <Upload className="w-4 h-4 text-[#F5F1E8]" />
                                    </div>
                                    <div>
                                      <div className="text-xs font-bold text-[#F5F1E8]">
                                        Upload Document / Picture
                                      </div>
                                      <div className="text-[10px] text-[#A6ACC0]">
                                        PDF, PNG, JPG, JPEG from your device/drive
                                      </div>
                                    </div>
                                  </div>
                                  <span className="text-xs font-bold text-[#F5F1E8] bg-[#161F30] border border-[#2B3854] px-3 py-1.5 rounded-lg group-hover:border-[#E8B565] transition">
                                    Browse File
                                  </span>
                                </label>
                              ) : (
                                <div className="flex items-center justify-between p-3 rounded-xl bg-[#0E1420] border border-[#8FBF8A]/30 animate-fade-in">
                                  <div className="flex items-center gap-3 min-w-0 pr-2">
                                    <div className="w-8 h-8 rounded-lg bg-[#8FBF8A]/15 text-[#8FBF8A] flex items-center justify-center shrink-0">
                                      <FileCheck className="w-4 h-4" />
                                    </div>
                                    <div className="min-w-0">
                                      <div className="text-xs font-bold text-[#F5F1E8] truncate">
                                        {selectedFile.name}
                                      </div>
                                      <div className="text-[10px] text-[#A6ACC0]">
                                        {formatFileSize(selectedFile.size)} • Ready to send via email
                                      </div>
                                    </div>
                                  </div>

                                  <div className="flex items-center gap-2 shrink-0">
                                    <label
                                      htmlFor={`file-input-${req.id}`}
                                      className="text-[11px] font-semibold text-[#A6ACC0] hover:text-[#F5F1E8] underline cursor-pointer"
                                    >
                                      Replace
                                    </label>
                                    <button
                                      type="button"
                                      onClick={() => handleRemoveFile(req.id)}
                                      className="text-[#A6ACC0] hover:text-[#E2685B] p-1 rounded-md hover:bg-[#1C2740]/30 transition"
                                      title="Remove file"
                                    >
                                      <X className="w-4 h-4" />
                                    </button>
                                  </div>
                                </div>
                              )}

                              {/* Error Alert if any */}
                              {errorMsg && (
                                <div className="flex items-center gap-2 p-2.5 rounded-xl bg-[#2A1418] border border-[#E2685B]/30 text-[#E2685B] text-xs">
                                  <AlertCircle className="w-4 h-4 shrink-0" />
                                  <span className="text-[11px] leading-tight">{errorMsg}</span>
                                </div>
                              )}

                              {/* Action Bar */}
                              <div className="flex items-center justify-between pt-1">
                                <button
                                  type="button"
                                  onClick={() => {
                                    setRejectingId(req.id);
                                    setRejectReason("");
                                  }}
                                  className="text-[11px] text-[#E2685B] hover:underline cursor-pointer"
                                >
                                  Document Not Available?
                                </button>

                                <button
                                  type="button"
                                  onClick={() => handleSendDocument(req)}
                                  disabled={!selectedFile || isSending}
                                  className="bg-[#E8B565] hover:bg-[#F0C87D] text-[#0E1420] font-black text-xs px-4 py-2 rounded-xl flex items-center gap-2 shadow-sm transition disabled:opacity-40 disabled:cursor-not-allowed cursor-pointer active:scale-95"
                                  id={`btn-send-doc-${req.id}`}
                                >
                                  {isSending ? (
                                    <>
                                      <Loader2 className="w-3.5 h-3.5 animate-spin" />
                                      <span>Sending Email...</span>
                                    </>
                                  ) : (
                                    <>
                                      <Send className="w-3.5 h-3.5" />
                                      <span>Send Document</span>
                                    </>
                                  )}
                                </button>
                              </div>
                            </>
                          )}
                        </div>
                      )}
                    </>
                  )}
                </div>
              );
            })
          ) : (
            <div className="py-12 text-center text-[#A6ACC0] text-xs">
              No document requests found in this filter.
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
