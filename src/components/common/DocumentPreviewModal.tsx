"use client";

import React from "react";
import { DocumentItem } from "../../types";
import { X, FileText, Download, ShieldCheck, Calendar, User, HardDrive } from "lucide-react";

interface DocumentPreviewModalProps {
  document: DocumentItem | null;
  isOpen: boolean;
  onClose: () => void;
}

export const DocumentPreviewModal: React.FC<DocumentPreviewModalProps> = ({
  document,
  isOpen,
  onClose,
}) => {
  if (!isOpen || !document) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/75 backdrop-blur-md animate-fade-in">
      <div className="w-full max-w-lg bg-[#111C2E] text-[#F3F5F9] rounded-2xl shadow-sm overflow-hidden border border-[#22304A] flex flex-col max-h-[90vh]">
        {/* Header */}
        <div className="p-4 bg-[#16233A] text-[#F3F5F9] flex items-center justify-between border-b border-[#22304A]">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-xl bg-[#EFE4CC]/20 text-[#F3F5F9] flex items-center justify-center border border-[#EFE4CC]/30">
              <FileText className="w-4 h-4" />
            </div>
            <div>
              <h3 className="text-sm font-bold leading-tight line-clamp-1 text-[#F3F5F9]">{document.title}</h3>
              <p className="text-[11px] text-[#8C97AD] uppercase font-medium tracking-wide">
                {document.category.replace("_", " ")} Document
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-full bg-white/[0.05] hover:bg-white/[0.1] text-[#8C97AD] hover:text-[#F3F5F9] transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Metadata info strip */}
        <div className="bg-[#0A1120] border-b border-[#22304A] p-3 px-5 grid grid-cols-3 gap-2 text-xs">
          <div className="flex items-center gap-1.5 text-[#8C97AD]">
            <Calendar className="w-3.5 h-3.5 text-[#F3F5F9]" />
            <span>{document.uploadedAt}</span>
          </div>
          <div className="flex items-center gap-1.5 text-[#8C97AD]">
            <HardDrive className="w-3.5 h-3.5 text-[#F3F5F9]" />
            <span>{document.fileSize}</span>
          </div>
          <div className="flex items-center gap-1.5 text-[#8C97AD]">
            <User className="w-3.5 h-3.5 text-[#F3F5F9]" />
            <span className="truncate">{document.uploadedBy}</span>
          </div>
        </div>

        {/* Preview Content Simulator */}
        <div className="p-6 flex-1 overflow-y-auto space-y-4">
          <div className="border border-dashed border-white/[0.12] rounded-2xl p-6 bg-[#16233A]/40 text-center space-y-3">
            <div className="w-12 h-12 rounded-2xl bg-[#111C2E] shadow-lg text-[#F3F5F9] flex items-center justify-center mx-auto border border-[#22304A]">
              <FileText className="w-6 h-6 text-[#F3F5F9]" />
            </div>
            <div>
              <h4 className="font-bold text-sm text-[#F3F5F9]">{document.title}</h4>
              <p className="text-xs text-[#8C97AD] mt-1">
                Verified digital copy on file with Emerald Heights CHS RWA Records.
              </p>
            </div>

            <div className="inline-flex items-center gap-1.5 text-[11px] font-semibold text-[#4FD1A1] bg-[#111C2E] px-3 py-1 rounded-full border border-[#4FD1A1]/30">
              <ShieldCheck className="w-3.5 h-3.5 text-[#4FD1A1]" />
              Verified & Scope Locked to Authorized Flat
            </div>
          </div>

          <div className="space-y-2 text-xs text-[#8C97AD] bg-[#16233A] p-4 rounded-xl border border-[#22304A]">
            <div className="font-semibold text-[#F3F5F9] text-xs mb-1">Document Summary & Notes:</div>
            <p>• Digitized physical record stored on encrypted Supabase Storage vault.</p>
            <p>• Scoped strictly for residency verification, society NOC, and loan records.</p>
            <p>• As per PRD Sec 3.4 & 6: This represents storage & retrieval of registered society copies.</p>
          </div>
        </div>

        {/* Footer Actions */}
        <div className="p-4 bg-[#16233A] border-t border-[#22304A] flex items-center justify-between">
          <span className="text-xs text-[#8C97AD] font-mono">Format: PDF (Acrobat Reader)</span>
          <button
            onClick={() => {
              alert(`Simulating secure download for "${document.title}"`);
            }}
            className="bg-[#EFE4CC] hover:bg-[#F7F0DF] text-[#0A1120] text-xs font-bold px-4 py-2.5 rounded-xl flex items-center gap-2 shadow-sm transition-all"
          >
            <Download className="w-4 h-4" />
            <span>Download Document</span>
          </button>
        </div>
      </div>
    </div>
  );
};
