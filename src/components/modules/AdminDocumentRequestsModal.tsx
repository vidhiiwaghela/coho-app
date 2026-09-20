"use client";

import React, { useState } from "react";
import { DocumentRequest } from "../../types";
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
}

export const AdminDocumentRequestsModal: React.FC<AdminDocumentRequestsModalProps> = ({
  isOpen,
  onClose,
  requests,
  onFulfillRequest,
}) => {
  const [filter, setFilter] = useState<"all" | "pending" | "fulfilled">("all");
  const [selectedFiles, setSelectedFiles] = useState<Record<string, File>>({});
  const [sendingStates, setSendingStates] = useState<Record<string, boolean>>({});
  const [errorMessages, setErrorMessages] = useState<Record<string, string>>({});
  const [toastMessage, setToastMessage] = useState<{
    title: string;
    description: string;
    isError?: boolean;
  } | null>(null);

  if (!isOpen) return null;

  const filteredRequests = requests.filter((r) => {
    if (filter === "pending") return r.status === "pending";
    if (filter === "fulfilled") return r.status === "fulfilled";
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
                ? "bg-[#2A1418] border-[#F0736A]/30 text-[#F0736A]"
                : "bg-[#111C2E] border-[#4FD1A1]/30 text-[#F3F5F9]"
            }`}
          >
            <div className="flex items-start gap-3">
              <div
                className={`w-8 h-8 rounded-xl flex items-center justify-center shrink-0 mt-0.5 ${
                  toastMessage.isError
                    ? "bg-[#F0736A]/20 text-[#F0736A]"
                    : "bg-[#4FD1A1]/20 text-[#4FD1A1]"
                }`}
              >
                {toastMessage.isError ? (
                  <AlertCircle className="w-5 h-5 text-[#F0736A]" />
                ) : (
                  <CheckCircle2 className="w-4 h-4 text-[#4FD1A1]" />
                )}
              </div>
              <div>
                <h4
                  className={`text-xs font-bold ${
                    toastMessage.isError ? "text-[#F0736A]" : "text-[#F3F5F9]"
                  }`}
                >
                  {toastMessage.title}
                </h4>
                <p
                  className={`text-[11px] mt-0.5 leading-relaxed ${
                    toastMessage.isError ? "text-[#F0736A]/90 font-mono" : "text-[#8C97AD]"
                  }`}
                >
                  {toastMessage.description}
                </p>
              </div>
            </div>
            <button
              onClick={() => setToastMessage(null)}
              className="text-[#8C97AD] hover:text-[#F3F5F9] p-1 rounded-full hover:bg-black/30 transition cursor-pointer"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>
      )}

      <div className="bg-[#111C2E] border border-[#22304A] rounded-2xl w-full max-w-xl shadow-sm p-6 relative animate-scale-up space-y-5 text-[#F3F5F9] max-h-[90vh] flex flex-col">
        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 text-[#8C97AD] hover:text-[#F3F5F9] p-1.5 rounded-full hover:bg-[#16233A] transition-colors"
          id="btn-close-admin-doc-modal"
          aria-label="Close Modal"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Modal Header */}
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-[#EFE4CC]/15 text-[#F3F5F9] border border-[#EFE4CC]/30 flex items-center justify-center shrink-0">
            <FileText className="w-5 h-5" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h3 className="text-base font-bold text-[#F3F5F9]">
                Member Document Requests Queue
              </h3>
              {pendingCount > 0 && (
                <span className="text-[#A9B4CC] bg-[#111C2E] border border-[#A9B4CC]/30 text-[10px] font-bold px-2 py-0.5 rounded-full">
                  {pendingCount} Pending
                </span>
              )}
            </div>
            <p className="text-xs text-[#8C97AD]">
              Review, upload stamped file & email official NOCs and certificates directly to residents
            </p>
          </div>
        </div>

        {/* Filter Tabs */}
        <div className="flex items-center gap-2">
          {(["all", "pending", "fulfilled"] as const).map((f) => (
            <button
              key={f}
              onClick={() => setFilter(f)}
              className={`pill-btn text-xs font-bold px-3 py-1.5 rounded-full transition-all capitalize cursor-pointer ${
                filter === f
                  ? "bg-[#EFE4CC] text-[#0A1120] font-bold shadow-sm"
                  : "bg-[#111C2E] text-[#8C97AD] border border-[#22304A] hover:border-[#22304A] hover:text-[#F3F5F9]"
              }`}
            >
              {f} ({f === "all" ? requests.length : requests.filter((r) => r.status === f).length})
            </button>
          ))}
        </div>

        {/* Request Queue List */}
        <div className="flex-1 overflow-y-auto space-y-3.5 pr-1">
          {filteredRequests.length > 0 ? (
            filteredRequests.map((req) => {
              const isFulfilled = req.status === "fulfilled";
              const selectedFile = selectedFiles[req.id];
              const isSending = Boolean(sendingStates[req.id]);
              const errorMsg = errorMessages[req.id];

              return (
                <div
                  key={req.id}
                  className="p-4 rounded-xl bg-[#16233A]/40 border border-[#22304A] space-y-3 transition-all shadow-sm"
                >
                  {/* Card Header: Flat, Title & Status */}
                  <div className="flex items-start justify-between gap-3">
                    <div className="min-w-0">
                      <div className="flex items-center gap-2 flex-wrap">
                        <span className="text-xs font-bold text-[#F3F5F9] bg-[#111C2E] border border-[#22304A] px-2 py-0.5 rounded-md shrink-0">
                          Flat {req.flatNumber}
                        </span>
                        <h4 className="text-sm font-bold text-[#F3F5F9] truncate">
                          {req.documentName}
                        </h4>
                      </div>
                      <p className="text-xs text-[#8C97AD] mt-1">
                        Requested by <strong>{req.residentName}</strong> • {req.requestedAt}
                      </p>
                    </div>

                    <div className="shrink-0">
                      {isFulfilled ? (
                        <span className="inline-flex items-center gap-1 text-[10px] font-bold text-[#4FD1A1] bg-[#111C2E] border border-[#4FD1A1]/30 px-2.5 py-0.5 rounded-full">
                          <CheckCircle2 className="w-3 h-3 text-[#4FD1A1]" />
                          <span>Fulfilled</span>
                        </span>
                      ) : (
                        <span className="inline-flex items-center gap-1 text-[10px] font-bold text-[#A9B4CC] bg-[#111C2E] border border-[#A9B4CC]/30 px-2.5 py-0.5 rounded-full">
                          <Clock className="w-3 h-3 text-[#A9B4CC]" />
                          <span>Pending</span>
                        </span>
                      )}
                    </div>
                  </div>

                  {/* Delivery Email Banner */}
                  <div className="flex items-center gap-2 text-xs bg-[#0A1120] px-3 py-2 rounded-xl border border-[#22304A]">
                    <Mail className="w-3.5 h-3.5 text-[#F3F5F9] shrink-0" />
                    <span className="text-[#8C97AD] text-[11px]">Delivery Email:</span>
                    <span className="font-semibold text-[#F3F5F9] text-[12px] truncate">
                      {req.deliveryEmail || "Not specified (using resident registered email)"}
                    </span>
                  </div>

                  {/* Format & Optional Purpose Note */}
                  <div className="flex items-center justify-between text-xs pt-1 border-t border-[#22304A]">
                    <div className="flex items-center gap-2 text-[11px] text-[#8C97AD]">
                      <span className="font-semibold uppercase text-[#F3F5F9]">Format:</span>
                      <span className="inline-flex items-center gap-1">
                        {req.copyType === "digital" ? (
                          <>
                            <DownloadCloud className="w-3 h-3 text-[#F3F5F9]" />
                            <span>Digital Copy (PDF)</span>
                          </>
                        ) : (
                          <>
                            <FileCheck className="w-3 h-3 text-[#F3F5F9]" />
                            <span>Physical Copy (Signed Hardcopy)</span>
                          </>
                        )}
                      </span>
                    </div>

                    {isFulfilled && req.fulfilledAt && (
                      <span className="text-[11px] text-[#4FD1A1] font-medium">
                        Completed: {req.fulfilledAt}
                      </span>
                    )}
                  </div>

                  {req.note && (
                    <div className="text-[11px] text-[#8C97AD] bg-[#111C2E] p-2.5 rounded-lg border border-[#22304A]">
                      <strong className="text-[#F3F5F9]">Note from Resident:</strong> {req.note}
                    </div>
                  )}

                  {/* Attached File Display for Fulfilled Requests */}
                  {isFulfilled && req.fulfilledFileName && (
                    <div className="flex items-center gap-2 text-xs text-[#4FD1A1] bg-[#0A1120] px-3 py-2 rounded-xl border border-[#4FD1A1]/30">
                      <Paperclip className="w-3.5 h-3.5" />
                      <span className="text-[11px] font-medium">
                        Dispatched Document: <strong>{req.fulfilledFileName}</strong>
                      </span>
                    </div>
                  )}

                  {/* Admin File Upload & Send Action for Pending Requests */}
                  {!isFulfilled && (
                    <div className="pt-2 border-t border-[#22304A] space-y-3">
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
                          className="cursor-pointer flex items-center justify-between p-3 rounded-xl border border-dashed border-[#22304A] hover:border-[#EFE4CC] hover:bg-[#16233A]/50 transition group"
                          id={`upload-box-${req.id}`}
                        >
                          <div className="flex items-center gap-3">
                            <div className="w-8 h-8 rounded-lg bg-[#111C2E] text-[#F3F5F9] flex items-center justify-center group-hover:scale-105 transition-transform shrink-0">
                              <Upload className="w-4 h-4 text-[#F3F5F9]" />
                            </div>
                            <div>
                              <div className="text-xs font-bold text-[#F3F5F9]">
                                Upload Document / Picture
                              </div>
                              <div className="text-[10px] text-[#8C97AD]">
                                PDF, PNG, JPG, JPEG from your device/drive
                              </div>
                            </div>
                          </div>
                          <span className="text-xs font-bold text-[#F3F5F9] bg-[#111C2E] border border-[#22304A] px-3 py-1.5 rounded-lg group-hover:border-[#EFE4CC] transition">
                            Browse File
                          </span>
                        </label>
                      ) : (
                        <div className="flex items-center justify-between p-3 rounded-xl bg-[#0A1120] border border-[#4FD1A1]/30 animate-fade-in">
                          <div className="flex items-center gap-3 min-w-0 pr-2">
                            <div className="w-8 h-8 rounded-lg bg-[#4FD1A1]/15 text-[#4FD1A1] flex items-center justify-center shrink-0">
                              <FileCheck className="w-4 h-4" />
                            </div>
                            <div className="min-w-0">
                              <div className="text-xs font-bold text-[#F3F5F9] truncate">
                                {selectedFile.name}
                              </div>
                              <div className="text-[10px] text-[#8C97AD]">
                                {formatFileSize(selectedFile.size)} • Ready to send via email
                              </div>
                            </div>
                          </div>

                          <div className="flex items-center gap-2 shrink-0">
                            <label
                              htmlFor={`file-input-${req.id}`}
                              className="text-[11px] font-semibold text-[#8C97AD] hover:text-[#F3F5F9] underline cursor-pointer"
                            >
                              Replace
                            </label>
                            <button
                              type="button"
                              onClick={() => handleRemoveFile(req.id)}
                              className="text-[#8C97AD] hover:text-[#F0736A] p-1 rounded-md hover:bg-[#16233A]/30 transition"
                              title="Remove file"
                            >
                              <X className="w-4 h-4" />
                            </button>
                          </div>
                        </div>
                      )}

                      {/* Error Alert if any */}
                      {errorMsg && (
                        <div className="flex items-center gap-2 p-2.5 rounded-xl bg-[#2A1418] border border-[#F0736A]/30 text-[#F0736A] text-xs">
                          <AlertCircle className="w-4 h-4 shrink-0" />
                          <span className="text-[11px] leading-tight">{errorMsg}</span>
                        </div>
                      )}

                      {/* Action Bar */}
                      <div className="flex items-center justify-between pt-1">
                        <span className="text-[10px] text-[#8C97AD]">
                          {selectedFile
                            ? "Click 'Send Document' to email attachment."
                            : "Select a file to enable dispatch."}
                        </span>

                        <button
                          type="button"
                          onClick={() => handleSendDocument(req)}
                          disabled={!selectedFile || isSending}
                          className="bg-[#EFE4CC] hover:bg-[#F7F0DF] text-[#0A1120] font-black text-xs px-4 py-2 rounded-xl flex items-center gap-2 shadow-sm transition disabled:opacity-40 disabled:cursor-not-allowed cursor-pointer active:scale-95"
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
                    </div>
                  )}
                </div>
              );
            })
          ) : (
            <div className="py-12 text-center text-[#8C97AD] text-xs">
              No document requests found in this filter.
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
