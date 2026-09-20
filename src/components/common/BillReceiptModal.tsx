"use client";

import React from "react";
import { MaintenanceBill, FlatUser } from "../../types";
import { X, Printer, CheckCircle2, Building2, Download } from "lucide-react";
import { formatINR } from "../../lib/utils";

interface BillReceiptModalProps {
  bill: MaintenanceBill | null;
  currentUser: FlatUser;
  isOpen: boolean;
  onClose: () => void;
}

export const BillReceiptModal: React.FC<BillReceiptModalProps> = ({
  bill,
  currentUser,
  isOpen,
  onClose,
}) => {
  if (!isOpen || !bill) return null;

  const handlePrint = () => {
    window.print();
  };

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
            <Building2 className="w-5 h-5 text-[#F3F5F9]" />
            <div>
              <h3 className="text-sm font-bold leading-tight">Official Maintenance Receipt</h3>
              <p className="text-[11px] text-secondaryText">Emerald Heights Co-operative Housing Society</p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={handlePrint}
              className="p-2 rounded-full bg-white/[0.05] hover:bg-white/[0.1] text-secondaryText hover:text-primaryText transition-colors"
              title="Print Receipt"
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
          {/* Printable Society Title Banner */}
          <div className="hidden print:block text-center border-b border-black pb-4 mb-4">
            <h1 className="text-xl font-bold uppercase tracking-wide">Emerald Heights Co-operative Housing Society Ltd.</h1>
            <p className="text-xs text-gray-600">Registration No: BOM/HSG/2012/981 • Bandra West, Mumbai 400050</p>
          </div>

          <div className="flex justify-between items-start border-b border-borderDivider print:border-gray-300 pb-4">
            <div>
              <div className="text-xs text-textMuted uppercase font-semibold">Receipt No.</div>
              <div className="text-sm font-mono font-bold">{bill.paymentRef || `REC-${bill.id}`}</div>
              <div className="text-xs text-textMuted mt-1">Paid on: {bill.paidAt || bill.billingDate}</div>
            </div>
            <div className="text-right">
              <div className="inline-flex items-center gap-1 text-xs font-bold text-[#4FD1A1] bg-[#111C2E] px-2.5 py-1 rounded-full border border-[#4FD1A1]/30 print:text-emerald-700 print:bg-emerald-50 print:border-emerald-600">
                <CheckCircle2 className="w-3.5 h-3.5 text-[#4FD1A1] print:text-emerald-600" />
                PAID & VERIFIED
              </div>
              <div className="text-xs text-textMuted mt-1">Method: {bill.paymentMethod || "UPI"}</div>
            </div>
          </div>

          {/* Member Details */}
          <div className="grid grid-cols-2 gap-3 bg-elevatedSurface print:bg-gray-50 p-3.5 rounded-2xl text-xs border border-borderDivider print:border-gray-200">
            <div>
              <span className="text-textMuted">Member / Flat:</span>
              <p className="font-bold text-textPrimary">{currentUser.residentName}</p>
              <p className="text-textMuted">Flat {bill.flatNumber}, {currentUser.wing}</p>
            </div>
            <div>
              <span className="text-textMuted">Bill Period:</span>
              <p className="font-bold text-textPrimary">{bill.monthYear}</p>
              <p className="text-textMuted">Reg No: BOM/HSG/2012/981</p>
            </div>
          </div>

          {/* Itemized breakdown table */}
          <div>
            <div className="text-xs font-bold uppercase tracking-wider text-textMuted mb-2">
              Itemized Particulars
            </div>
            <div className="divide-y divide-borderDivider border-y border-borderDivider print:divide-gray-200 print:border-gray-300 text-xs">
              {bill.items.map((item) => (
                <div key={item.id} className="py-2.5 flex justify-between items-center">
                  <span className="font-medium text-textPrimary">{item.name}</span>
                  <span className="font-bold text-textPrimary">{formatINR(item.amount)}</span>
                </div>
              ))}
            </div>
            <div className="pt-3 flex justify-between items-baseline font-bold text-base">
              <span>Total Received</span>
              <span className="text-lg text-emerald-700 font-extrabold">{formatINR(bill.totalAmount)}</span>
            </div>
          </div>

          {/* Footer stamp & acknowledgement */}
          <div className="pt-4 border-t border-borderDivider print:border-gray-300 flex justify-between items-center text-[11px] text-textMuted">
            <div>
              <p>Computer-generated digital receipt.</p>
              <p>CoHo RWA Management System v1.0</p>
            </div>
            <div className="text-right">
              <div className="font-semibold text-textPrimary">For Emerald Heights CHS Ltd.</div>
              <div className="text-[10px] text-emerald-600 font-medium">Digitally Authorized by Treasurer</div>
            </div>
          </div>
        </div>

        {/* Action button (Hidden during print) */}
        <div className="p-4 bg-elevatedSurface border-t border-borderDivider flex justify-end gap-2 print:hidden">
          <button
            onClick={handlePrint}
            className="bg-[#EFE4CC] hover:bg-[#F7F0DF] text-[#0A1120] text-xs font-bold px-4 py-2.5 rounded-xl flex items-center gap-2 shadow-sm transition-all"
          >
            <Download className="w-3.5 h-3.5" />
            <span>Download PDF / Print</span>
          </button>
        </div>
      </div>
    </div>
  );
};
