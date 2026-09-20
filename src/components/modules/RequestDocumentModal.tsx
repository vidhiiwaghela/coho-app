"use client";

import React, { useState, useEffect } from "react";
import { FlatUser, DocumentRequest } from "../../types";
import {
  X,
  FileText,
  CheckCircle2,
  DownloadCloud,
  FileCheck,
  Building,
  HelpCircle,
  Mail,
} from "lucide-react";

interface RequestDocumentModalProps {
  isOpen: boolean;
  onClose: () => void;
  currentUser: FlatUser;
  onSubmitRequest: (
    req: Omit<DocumentRequest, "id" | "requestedAt" | "status">
  ) => void;
}

const DOCUMENT_OPTIONS: { id: DocumentRequest["documentType"]; label: string }[] = [
  { id: "noc_sale_rent", label: "NOC for Sale / Rent / Loan" },
  { id: "share_certificate", label: "Share Certificate Copy" },
  { id: "renovation_permission", label: "Renovation & Fitout Permission Form" },
  { id: "other", label: "Other Document (Specify Custom Name)" },
];

export const RequestDocumentModal: React.FC<RequestDocumentModalProps> = ({
  isOpen,
  onClose,
  currentUser,
  onSubmitRequest,
}) => {
  const [docType, setDocType] = useState<DocumentRequest["documentType"]>("noc_sale_rent");
  const [customDocName, setCustomDocName] = useState("");
  const [deliveryEmail, setDeliveryEmail] = useState("");
  const [emailError, setEmailError] = useState("");
  const [copyType, setCopyType] = useState<"digital" | "physical">("digital");
  const [note, setNote] = useState("");
  const [isSubmitted, setIsSubmitted] = useState(false);

  // Clear form state when modal closes
  useEffect(() => {
    if (!isOpen) {
      setDeliveryEmail("");
      setEmailError("");
      setCustomDocName("");
      setNote("");
    }
  }, [isOpen]);

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!deliveryEmail.trim() || !emailRegex.test(deliveryEmail.trim())) {
      setEmailError("Please enter a valid email address.");
      return;
    }
    setEmailError("");

    const docName =
      docType === "other"
        ? customDocName.trim() || "Custom Document Request"
        : DOCUMENT_OPTIONS.find((o) => o.id === docType)?.label || "Official Document";

    onSubmitRequest({
      flatId: currentUser.id,
      flatNumber: currentUser.flatNumber,
      residentName: currentUser.residentName,
      deliveryEmail: deliveryEmail.trim(),
      documentType: docType,
      documentName: docName,
      copyType,
      note: note.trim() || undefined,
    });

    setIsSubmitted(true);
    setTimeout(() => {
      setIsSubmitted(false);
      onClose();
    }, 1200);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-fade-in">
      <div className="bg-[#111C2E] border border-[#22304A] rounded-2xl w-full max-w-md shadow-sm p-6 relative animate-scale-up space-y-5 text-[#F3F5F9]">
        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 text-[#8C97AD] hover:text-[#F3F5F9] p-1.5 rounded-full hover:bg-[#16233A] transition-colors"
          id="btn-close-request-doc"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Modal Header */}
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-[#EFE4CC]/15 text-[#F3F5F9] border border-[#EFE4CC]/30 flex items-center justify-center shrink-0">
            <FileText className="w-5 h-5" />
          </div>
          <div>
            <h3 className="text-base font-bold text-[#F3F5F9]">
              Request Society Document
            </h3>
            <p className="text-xs text-[#8C97AD]">
              Flat {currentUser.flatNumber} • {currentUser.residentName}
            </p>
          </div>
        </div>

        {isSubmitted ? (
          <div className="py-8 text-center space-y-3">
            <div className="w-14 h-14 rounded-full bg-[#111C2E] border border-[#EFE4CC]/40 text-[#F3F5F9] flex items-center justify-center mx-auto">
              <CheckCircle2 className="w-8 h-8" />
            </div>
            <h4 className="text-base font-bold text-[#F3F5F9]">
              Document Request Submitted!
            </h4>
            <p className="text-xs text-[#8C97AD]">
              Your request has been routed to the Managing Committee queue.
            </p>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-4">
            {/* Document Type Dropdown */}
            <div className="space-y-1.5">
              <label className="text-xs font-semibold uppercase tracking-wider text-[#8C97AD] block">
                Select Document
              </label>
              <select
                value={docType}
                onChange={(e) => setDocType(e.target.value as any)}
                className="w-full bg-[#0A1120] text-[#F3F5F9] border border-[#22304A] rounded-xl px-3.5 py-3 text-sm font-medium focus:outline-none focus:border-[#EFE4CC] cursor-pointer"
                id="select-document-type"
              >
                {DOCUMENT_OPTIONS.map((opt) => (
                  <option key={opt.id} value={opt.id} className="bg-[#111C2E] text-[#F3F5F9]">
                    {opt.label}
                  </option>
                ))}
              </select>
            </div>

            {/* Custom Name field if "Other" is selected */}
            {docType === "other" && (
              <div className="space-y-1.5 animate-fade-in">
                <label className="text-xs font-semibold uppercase tracking-wider text-[#8C97AD] block">
                  Document Name / Title
                </label>
                <input
                  type="text"
                  required
                  value={customDocName}
                  onChange={(e) => setCustomDocName(e.target.value)}
                  placeholder="e.g., Water Meter NOC, Gas Line Permission..."
                  className="w-full bg-[#0A1120] text-[#F3F5F9] border border-[#22304A] rounded-xl px-3.5 py-2.5 text-sm placeholder:text-[#8C97AD]/50 focus:outline-none focus:border-[#EFE4CC]"
                  id="input-custom-doc-name"
                />
              </div>
            )}

            {/* Mandatory Delivery Email Address Field */}
            <div className="space-y-1.5">
              <div className="flex items-center justify-between">
                <label className="text-xs font-semibold uppercase tracking-wider text-[#8C97AD] block">
                  Delivery Email Address
                </label>
                <span className="text-[10px] text-[#F3F5F9] font-bold bg-[#16233A]/50 px-2 py-0.5 rounded-full border border-[#22304A]">
                  Required
                </span>
              </div>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-[#8C97AD]">
                  <Mail className="w-4 h-4" />
                </div>
                <input
                  type="email"
                  required
                  value={deliveryEmail}
                  onChange={(e) => {
                    setDeliveryEmail(e.target.value);
                    if (emailError) setEmailError("");
                  }}
                  placeholder="Enter your email address"
                  className={`w-full bg-[#0A1120] text-[#F3F5F9] border rounded-xl pl-10 pr-3.5 py-2.5 text-sm placeholder:text-[#8C97AD]/50 focus:outline-none transition-colors ${
                    emailError
                      ? "border-[#F0736A] focus:border-[#F0736A]"
                      : "border-[#22304A] focus:border-[#EFE4CC]"
                  }`}
                  id="input-delivery-email"
                />
              </div>
              {emailError ? (
                <p className="text-[11px] text-[#F0736A] font-medium">{emailError}</p>
              ) : (
                <p className="text-[11px] text-[#8C97AD]">
                  The approved copy and attachments will be dispatched to this address.
                </p>
              )}
            </div>

            {/* Delivery Preference Selector: Digital vs Physical */}
            <div className="space-y-1.5">
              <label className="text-xs font-semibold uppercase tracking-wider text-[#8C97AD] block">
                Delivery Format
              </label>
              <div className="grid grid-cols-2 gap-2">
                <button
                  type="button"
                  onClick={() => setCopyType("digital")}
                  className={`p-3 rounded-xl border text-left transition-all flex flex-col justify-between ${
                    copyType === "digital"
                      ? "bg-[#16233A] border-[#EFE4CC] ring-1 ring-[#F3F5F9]/30 text-[#F3F5F9]"
                      : "bg-[#0A1120]/60 border-[#22304A] text-[#8C97AD] hover:bg-[#16233A]/50"
                  }`}
                  id="btn-format-digital"
                >
                  <div className="flex items-center justify-between mb-1">
                    <span className="text-xs font-bold">Digital Copy</span>
                    <DownloadCloud className={`w-4 h-4 ${copyType === "digital" ? "text-[#F3F5F9]" : "text-[#8C97AD]"}`} />
                  </div>
                  <span className="text-[10px] text-[#8C97AD] leading-tight">
                    Signed PDF delivered to app
                  </span>
                </button>

                <button
                  type="button"
                  onClick={() => setCopyType("physical")}
                  className={`p-3 rounded-xl border text-left transition-all flex flex-col justify-between ${
                    copyType === "physical"
                      ? "bg-[#16233A] border-[#EFE4CC] ring-1 ring-[#F3F5F9]/30 text-[#F3F5F9]"
                      : "bg-[#0A1120]/60 border-[#22304A] text-[#8C97AD] hover:bg-[#16233A]/50"
                  }`}
                  id="btn-format-physical"
                >
                  <div className="flex items-center justify-between mb-1">
                    <span className="text-xs font-bold">Physical Copy</span>
                    <FileCheck className={`w-4 h-4 ${copyType === "physical" ? "text-[#F3F5F9]" : "text-[#8C97AD]"}`} />
                  </div>
                  <span className="text-[10px] text-[#8C97AD] leading-tight">
                    Hard copy stamped by Society Office
                  </span>
                </button>
              </div>
            </div>

            {/* Optional Note / Purpose */}
            <div className="space-y-1.5">
              <label className="text-xs font-semibold uppercase tracking-wider text-[#8C97AD] block">
                Purpose / Additional Details (Optional)
              </label>
              <textarea
                value={note}
                onChange={(e) => setNote(e.target.value)}
                rows={2}
                placeholder="e.g., Submitting to HDFC Bank for balance transfer..."
                className="w-full bg-[#0A1120] text-[#F3F5F9] border border-[#22304A] rounded-xl px-3.5 py-2.5 text-xs placeholder:text-[#8C97AD]/50 focus:outline-none focus:border-[#EFE4CC]"
                id="input-doc-note"
              />
            </div>

            {/* Submit CTA */}
            <div className="pt-2">
              <button
                type="submit"
                className="w-full bg-[#EFE4CC] hover:bg-[#F7F0DF] text-[#0A1120] font-black text-sm py-3.5 rounded-xl shadow-sm transition-all"
                id="btn-submit-doc-request"
              >
                Submit Request to Society Admin
              </button>
            </div>
          </form>
        )}
      </div>
    </div>
  );
};
