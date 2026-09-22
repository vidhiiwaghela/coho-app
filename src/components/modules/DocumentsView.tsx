"use client";

import React, { useState } from "react";
import { DocumentItem, FlatUser } from "../../types";
import { PillSearchBar } from "../common/PillSearchBar";
import {
  FileText,
  Upload,
  Download,
  Eye,
  ShieldCheck,
  Building,
  User,
  FolderLock,
  Plus,
  Trash2,
  Lock,
  Info,
} from "lucide-react";

interface DocumentsViewProps {
  documents: DocumentItem[];
  currentUser: FlatUser;
  onPreviewDocument: (doc: DocumentItem) => void;
  onUploadClick?: () => void;
  onDeleteDocument?: (docId: string) => void;
}

export const DocumentsView: React.FC<DocumentsViewProps> = ({
  documents,
  currentUser,
  onPreviewDocument,
  onUploadClick,
  onDeleteDocument,
}) => {
  const [filterCategory, setFilterCategory] = useState<string>("all");
  const [searchQuery, setSearchQuery] = useState<string>("");

  const isTenant = currentUser.role === "tenant" || !currentUser.isOwner;

  // PRD Sec 2 & 3.4: Filter documents based on role
  // - Admin sees everything
  // - Owner sees their flat's docs + society-wide docs
  // - Tenant sees their flat's non-ownership docs (NOCs, tenant agreements) + society-wide docs
  const accessibleDocs = documents.filter((doc) => {
    if (currentUser.role === "admin") return true;
    if (doc.isSocietyWide) return true;

    // Must be tagged to the user's flat
    if (doc.flatId !== currentUser.id) return false;

    // If tenant, exclude ownership documents (Sale deed / registered agreement / share certificate)
    if (isTenant) {
      const isOwnershipDoc =
        doc.category === "agreement" || doc.category === "share_certificate" || doc.category === "ownership";
      return !isOwnershipDoc;
    }

    return true;
  });

  const filteredDocs = accessibleDocs.filter((doc) => {
    const matchesCategory =
      filterCategory === "all" ||
      (filterCategory === "flat" && !doc.isSocietyWide) ||
      (filterCategory === "society" && doc.isSocietyWide);

    const q = searchQuery.toLowerCase().trim();
    if (!q) return matchesCategory;

    return (
      matchesCategory &&
      (doc.title.toLowerCase().includes(q) || doc.category.toLowerCase().includes(q))
    );
  });

  return (
    <div className="space-y-4 pb-24 animate-fade-in">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-xl font-extrabold text-[#F5F1E8] tracking-tight">
            Document Vault
          </h2>
          <p className="text-xs text-[#A6ACC0]">
            {currentUser.role === "admin"
              ? "Master society certificates & flat records"
              : `Flat ${currentUser.flatNumber} document archive`}
          </p>
        </div>

        {(currentUser.role === "admin" || currentUser.isOwner) && onUploadClick && (
          <button
            onClick={onUploadClick}
            className="bg-[#1C2740] text-[#F5F1E8] border border-[#2B3854] hover:bg-[#A6ACC0]/10 text-xs font-bold px-3.5 py-2 rounded-xl flex items-center gap-1.5 shadow-sm transition-all"
          >
            <Upload className="w-3.5 h-3.5" />
            <span>Upload Doc</span>
          </button>
        )}
      </div>

      {/* Scope Disclaimer / Tenant Banner */}
      {isTenant ? (
        <div className="bg-[#161F30] border border-[#E8B565]/40 text-[#F5F1E8] rounded-2xl p-3.5 text-xs flex items-start gap-2.5">
          <Info className="w-4 h-4 text-[#F5F1E8] shrink-0 mt-0.5" />
          <div className="text-[11px] leading-relaxed">
            <strong className="text-[#F5F1E8]">Tenant View Active: </strong>
            In accordance with society regulations, flat ownership records (Sale Deed, Share Certificate) are restricted to the primary property owner. You have full access to tenancy NOCs and society-wide bylaws.
          </div>
        </div>
      ) : (
        <div className="bg-[#161F30] text-[#F5F1E8] rounded-2xl p-3.5 text-xs flex items-start gap-2.5 border border-[#2B3854] shadow-sm">
          <FolderLock className="w-4 h-4 text-[#F5F1E8] shrink-0 mt-0.5" />
          <div className="text-[11px] leading-relaxed text-[#A6ACC0]">
            <strong className="text-[#F5F1E8]">Security & Scoping: </strong>
            Flat ownership papers, share certificates, and NOCs are restricted to Flat{" "}
            <span className="text-[#F5F1E8] font-bold">{currentUser.flatNumber}</span> and the
            Managing Committee.
          </div>
        </div>
      )}

      {/* Search Bar */}
      <PillSearchBar
        value={searchQuery}
        onChange={setSearchQuery}
        placeholder="Search documents by title or type (e.g. Share Certificate, NOC)..."
      />

      {/* Category Segment Filter */}
      <div className="flex items-center gap-2">
        <button
          onClick={() => setFilterCategory("all")}
          className={`pill-btn text-xs font-semibold px-3 py-1.5 rounded-full transition-all ${
            filterCategory === "all"
              ? "bg-[#E8B565] text-[#0E1420] font-bold shadow-sm"
              : "bg-[#161F30] text-[#A6ACC0] border border-[#2B3854] hover:border-[#2B3854] hover:text-[#F5F1E8]"
          }`}
        >
          All Files ({accessibleDocs.length})
        </button>
        <button
          onClick={() => setFilterCategory("flat")}
          className={`pill-btn text-xs font-semibold px-3 py-1.5 rounded-full transition-all ${
            filterCategory === "flat"
              ? "bg-[#E8B565] text-[#0E1420] font-bold shadow-sm"
              : "bg-[#161F30] text-[#A6ACC0] border border-[#2B3854] hover:border-[#2B3854] hover:text-[#F5F1E8]"
          }`}
        >
          Flat Specific Docs
        </button>
        <button
          onClick={() => setFilterCategory("society")}
          className={`pill-btn text-xs font-semibold px-3 py-1.5 rounded-full transition-all ${
            filterCategory === "society"
              ? "bg-[#E8B565] text-[#0E1420] font-bold shadow-sm"
              : "bg-[#161F30] text-[#A6ACC0] border border-[#2B3854] hover:border-[#2B3854] hover:text-[#F5F1E8]"
          }`}
        >
          Society Master Bylaws
        </button>
      </div>

      {/* Document List */}
      <div className="space-y-3">
        {filteredDocs.length > 0 ? (
          filteredDocs.map((doc, idx) => (
            <div
              key={doc.id}
              className="list-item-in bg-[#161F30] rounded-2xl p-4 border border-[#2B3854] shadow-sm flex items-center justify-between gap-3 hover:border-white/[0.15] transition-all"
              style={{ "--stagger-delay": `${Math.min(idx * 40, 320)}ms` } as React.CSSProperties}
            >
              <div
                onClick={() => onPreviewDocument(doc)}
                className="flex items-start gap-3 cursor-pointer flex-1 min-w-0"
              >
                <div className="w-10 h-10 rounded-xl bg-[#1C2740] text-[#F5F1E8] border border-[#2B3854] flex items-center justify-center shrink-0">
                  <FileText className="w-5 h-5" />
                </div>
                <div className="min-w-0">
                  <h4 className="text-sm font-bold text-[#F5F1E8] truncate">{doc.title}</h4>
                  <div className="flex items-center gap-2 text-[11px] text-[#A6ACC0] mt-0.5">
                    <span className="font-semibold uppercase text-[#A6ACC0]">
                      {doc.category.replace("_", " ")}
                    </span>
                    <span>•</span>
                    <span>{doc.fileSize}</span>
                    <span>•</span>
                    <span>{doc.uploadedAt}</span>
                  </div>
                  {doc.isSocietyWide && (
                    <span className="inline-block text-[10px] font-bold text-[#8FBF8A] bg-[#161F30] border border-[#8FBF8A]/30 px-2 py-0.5 rounded-full mt-1">
                      Society-wide Master Record
                    </span>
                  )}
                </div>
              </div>

              {/* Action Buttons */}
              <div className="flex items-center gap-1.5 shrink-0">
                <button
                  onClick={() => onPreviewDocument(doc)}
                  className="p-2 rounded-xl bg-[#1C2740] hover:bg-white/[0.08] text-[#A6ACC0] hover:text-[#F5F1E8] border border-[#2B3854] transition-colors"
                  title="Preview"
                >
                  <Eye className="w-4 h-4" />
                </button>

                <button
                  onClick={() => onPreviewDocument(doc)}
                  className="bg-[#E8B565] hover:bg-[#F0C87D] text-[#0E1420] font-bold text-xs px-3 py-1.5 rounded-xl flex items-center gap-1 shadow-sm transition-all"
                >
                  <Download className="w-3 h-3" />
                  <span>Get</span>
                </button>

                {currentUser.role === "admin" && onDeleteDocument && (
                  <button
                    onClick={() => onDeleteDocument(doc.id)}
                    className="p-2 rounded-xl bg-[#2A1418] hover:bg-[#2A1418]/80 text-[#E2685B] border border-[#E2685B]/30 transition-colors"
                    title="Delete document"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                )}
              </div>
            </div>
          ))
        ) : (
          <div className="bg-[#161F30] rounded-2xl p-8 text-center border border-[#2B3854] shadow-sm">
            <FileText className="w-8 h-8 text-[#A6ACC0] mx-auto mb-2" />
            <h4 className="text-sm font-bold text-[#F5F1E8]">No documents in this folder</h4>
            <p className="text-xs text-[#A6ACC0] mt-1">
              Documents uploaded by the Secretary or Managing Committee will appear here.
            </p>
          </div>
        )}
      </div>
    </div>
  );
};
