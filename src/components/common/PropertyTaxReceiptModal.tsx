"use client";

import React from "react";
import { FlatPropertyTax, FlatUser } from "../../types";
import { PROPERTY_TAX_CONFIG } from "../../lib/mockData";
import { X, Printer, CheckCircle2, Landmark, Download } from "lucide-react";
import { formatINR } from "../../lib/utils";

interface PropertyTaxReceiptModalProps {
  tax: FlatPropertyTax | null;
  currentUser: FlatUser;
  isOpen: boolean;
  onClose: () => void;
}

export const PropertyTaxReceiptModal: React.FC<PropertyTaxReceiptModalProps> = ({
  tax,
  currentUser,
  isOpen,
  onClose,
}) => {
  if (!isOpen || !tax) return null;

  const handlePrint = () => {
    window.print();
  };

  const config = PROPERTY_TAX_CONFIG[tax.propertyType];
  const total = tax.annualTaxAmount;
  const baseTax = Math.round(total * 0.65);
  const waterSewerage = Math.round(total * 0.20);
  const educationCess = total - baseTax - waterSewerage;

  return (
    <div
      id="printable-receipt-modal"
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-fade-in print:p-0 print:bg-white print:static print:block"
    >
      <div
        id="printable-receipt-card"
        className="w-full max-w-lg bg-cardSurface text-primaryText rounded-card-lg shadow-sm overflow-hidden border border-borderDivider print:border-none print:shadow-none print:max-w-none print:w-full print:rounded-none print:bg-white print:text-black"
      >
        {/* Header toolbar (Hidden during print) */}
        <div className="p-4 bg-elevatedSurface text-primaryText flex items-center justify-between border-b border-borderDivider print:hidden">
          <div className="flex items-center gap-2">
            <Landmark className="w-5 h-5 text-[#F5F1E8]" />
            <div>
              <h3 className="text-sm font-bold leading-tight">Property Tax Assessment Receipt</h3>
              <p className="text-[11px] text-secondaryText">Municipal Corporation • FY 2026-27</p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={handlePrint}
              className="p-2 rounded-full bg-white/[0.05] hover:bg-white/[0.1] text-secondaryText hover:text-primaryText transition-colors"
              title="Print / Save PDF"
            >
              <Printer className="w-4 h-4" />
            </button>
            <button
              onClick={onClose}
              className="p-2 rounded-full bg-white/[0.05] hover:bg-white/[0.1] text-secondaryText hover:text-primaryText transition-colors"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Printable Receipt Body */}
        <div className="p-6 space-y-5 print:p-8">
          {/* Printable Society & Municipal Authority Banner */}
          <div className="hidden print:block text-center border-b border-black pb-4 mb-4">
            <h1 className="text-xl font-bold uppercase tracking-wide">
              Municipal Corporation of Greater Mumbai
            </h1>
            <p className="text-xs text-gray-700 font-semibold mt-0.5">
              Assessment & Collection Department • Property Tax Receipt
            </p>
            <p className="text-[11px] text-gray-500">
              Disbursed via Emerald Heights CHS Ltd. • Reg No: BOM/HSG/2012/981
            </p>
          </div>

          <div className="flex justify-between items-start border-b border-borderDivider print:border-gray-300 pb-4">
            <div>
              <div className="text-xs text-textMuted uppercase font-semibold">Tax Receipt No.</div>
              <div className="text-sm font-mono font-bold">{tax.paymentRef || "MUM/TAX/2026/884910"}</div>
              <div className="text-xs text-textMuted mt-1">Paid on: {tax.lastPaidDate || "04 Oct 2026"}</div>
            </div>
            <div className="text-right">
              <div className="inline-flex items-center gap-1 text-xs font-bold text-[#8FBF8A] bg-[#161F30] px-2.5 py-1 rounded-full border border-[#8FBF8A]/30 print:text-emerald-700 print:bg-emerald-50 print:border-emerald-600">
                <CheckCircle2 className="w-3.5 h-3.5 text-[#8FBF8A] print:text-emerald-600" />
                PAID & CLEARED
              </div>
              <div className="text-xs text-textMuted mt-1">Method: {tax.paymentMethod || "Online Gateway (Razorpay)"}</div>
            </div>
          </div>

          {/* Member & Civic SAC Details */}
          <div className="grid grid-cols-2 gap-3 bg-elevatedSurface print:bg-gray-50 p-3.5 rounded-2xl text-xs border border-borderDivider print:border-gray-200">
            <div>
              <span className="text-textMuted">Assessee / Unit:</span>
              <p className="font-bold text-textPrimary">{tax.residentName || currentUser.residentName}</p>
              <p className="text-textMuted">Flat {tax.flatNumber}, Emerald Heights CHS</p>
            </div>
            <div>
              <span className="text-textMuted">Assessment SAC No:</span>
              <p className="font-mono font-bold text-textPrimary">{tax.sacNumber}</p>
              <p className="text-textMuted">FY: 2026-27 (Annual Assessment)</p>
            </div>
          </div>

          {/* Property Classification Details */}
          <div className="bg-elevatedSurface/50 print:bg-gray-50 p-3 rounded-xl text-xs border border-borderDivider print:border-gray-200 flex justify-between items-center">
            <div>
              <span className="text-textMuted block text-[11px]">Property Classification:</span>
              <span className="font-bold text-textPrimary">
                {config?.label || `${tax.propertyType.toUpperCase()} Standard`}
              </span>
            </div>
            <div className="text-right">
              <span className="text-textMuted block text-[11px]">Carpet Area:</span>
              <span className="font-semibold text-textPrimary">{config?.sqft || 950} sq.ft</span>
            </div>
          </div>

          {/* Itemized Assessment Breakdown Table */}
          <div>
            <div className="text-xs font-bold uppercase tracking-wider text-textMuted mb-2">
              Civic Tax Breakdown
            </div>
            <div className="divide-y divide-borderDivider border-y border-borderDivider print:divide-gray-200 print:border-gray-300 text-xs">
              <div className="py-2.5 flex justify-between items-center">
                <span className="font-medium text-textPrimary">General Tax (Municipal Base)</span>
                <span className="font-bold text-textPrimary">{formatINR(baseTax)}</span>
              </div>
              <div className="py-2.5 flex justify-between items-center">
                <span className="font-medium text-textPrimary">Water & Sewerage Benefit Tax</span>
                <span className="font-bold text-textPrimary">{formatINR(waterSewerage)}</span>
              </div>
              <div className="py-2.5 flex justify-between items-center">
                <span className="font-medium text-textPrimary">Education, Tree Cess & Employment Tax</span>
                <span className="font-bold text-textPrimary">{formatINR(educationCess)}</span>
              </div>
            </div>
            <div className="pt-3 flex justify-between items-baseline font-bold text-base">
              <span>Total Tax Received</span>
              <span className="text-lg text-emerald-700 font-extrabold">{formatINR(total)}</span>
            </div>
          </div>

          {/* Footer stamp & acknowledgement */}
          <div className="pt-4 border-t border-borderDivider print:border-gray-300 flex justify-between items-center text-[11px] text-textMuted">
            <div>
              <p>Official Computer-Generated Tax E-Receipt.</p>
              <p>Municipal Tax Portal Sync • Valid for Audit & Income Tax</p>
            </div>
            <div className="text-right">
              <div className="font-semibold text-textPrimary">Authorized Tax Collector</div>
              <div className="text-[10px] text-emerald-600 font-medium">Digital Signature Verified</div>
            </div>
          </div>
        </div>

        {/* Action button (Hidden during print) */}
        <div className="p-4 bg-elevatedSurface border-t border-borderDivider flex justify-end gap-2 print:hidden">
          <button
            onClick={handlePrint}
            className="bg-[#E8B565] hover:bg-[#F0C87D] text-[#0E1420] text-xs font-bold px-4 py-2.5 rounded-xl flex items-center gap-2 shadow-sm transition-all cursor-pointer"
            id="btn-print-tax-receipt"
          >
            <Download className="w-3.5 h-3.5" />
            <span>Download PDF / Print</span>
          </button>
        </div>
      </div>
    </div>
  );
};
