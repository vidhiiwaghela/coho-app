"use client";

import React, { useState } from "react";
import { MaintenanceBill, FlatUser, Notification, PropertyType, FlatPropertyTax } from "../../types";
import { PROPERTY_TAX_CONFIG, INITIAL_PROPERTY_TAXES } from "../../lib/mockData";
import { DarkHeroCard } from "../common/DarkHeroCard";
import { SegmentedTabs } from "../common/SegmentedTabs";
import { StatusBadge } from "../common/StatusBadge";
import { formatINR } from "../../lib/utils";
import {
  CreditCard,
  QrCode,
  Download,
  CheckCircle2,
  Calendar,
  Building2,
  Landmark,
  ShieldCheck,
  ChevronRight,
  ArrowRight,
  Receipt,
  Send,
  Building,
  BellRing,
  ChevronDown,
  ChevronUp,
  AlertTriangle,
} from "lucide-react";

interface PaymentsViewProps {
  currentUser: FlatUser;
  bills: MaintenanceBill[];
  onPayBill: (bill: MaintenanceBill) => void;
  onViewReceipt: (bill: MaintenanceBill) => void;
  notifications?: Notification[];
  onSendPaymentReminder?: (flatNumber: string, amount: number, month: string) => void;
  propertyTaxes?: FlatPropertyTax[];
  onUpdatePropertyTax?: (flatId: string, updates: Partial<FlatPropertyTax>) => void;
  onPayPropertyTax?: (tax: FlatPropertyTax) => void;
  onViewPropertyTaxReceipt?: (tax: FlatPropertyTax) => void;
}

type PaymentTab = "current" | "history" | "property_tax" | "admin_ledger";

export const PaymentsView: React.FC<PaymentsViewProps> = ({
  currentUser,
  bills,
  onPayBill,
  onViewReceipt,
  notifications = [],
  onSendPaymentReminder,
  propertyTaxes,
  onUpdatePropertyTax,
  onPayPropertyTax,
  onViewPropertyTaxReceipt,
}) => {
  const isAdmin = currentUser.role === "admin";
  const [selectedTab, setSelectedTab] = useState<PaymentTab>(
    isAdmin ? "admin_ledger" : "current"
  );
  const [remindedBillIds, setRemindedBillIds] = useState<string[]>([]);
  const [expandedBillId, setExpandedBillId] = useState<string | null>(null);

  const myBills = bills.filter((b) => b.flatId === currentUser.id);
  const pendingBill = myBills.find((b) => b.status === "pending");
  const paidBills = myBills.filter((b) => b.status === "paid");

  // Admin calculations
  const pendingSocietyBills = bills.filter((b) => b.status === "pending");
  const totalSocietyOutstanding = pendingSocietyBills.reduce((acc, b) => acc + b.totalAmount, 0);

  const handleSendReminder = (bill: MaintenanceBill) => {
    setRemindedBillIds((prev) => [...prev, bill.id]);
    onSendPaymentReminder?.(bill.flatNumber, bill.totalAmount, bill.monthYear);
  };

  const residentTabs = [
    { id: "current" as const, label: "Current Bill", badge: pendingBill ? 1 : undefined },
    { id: "history" as const, label: "History & Receipts", badge: paidBills.length },
    { id: "property_tax" as const, label: "Property Tax" },
  ];

  const adminTabs = [
    { id: "admin_ledger" as const, label: "All Flats Ledger", badge: pendingSocietyBills.length },
    { id: "property_tax" as const, label: "Property Tax Assessment" },
  ];

  return (
    <div className="space-y-5 pb-24 animate-fade-in">
      {/* 1. Dark Hero Card (Total Pending) */}
      <DarkHeroCard>
        <div className="flex justify-between items-start mb-3">
          <div>
            <span className="text-xs uppercase tracking-widest text-textMuted font-semibold">
              {isAdmin ? "Total Society Outstanding Dues" : "Total Pending Dues"}
            </span>
            <div className="text-4xl font-black text-white tracking-tight mt-1">
              {formatINR(isAdmin ? totalSocietyOutstanding : pendingBill ? pendingBill.totalAmount : 0)}
            </div>
          </div>
          <StatusBadge
            status={isAdmin ? (totalSocietyOutstanding > 0 ? "pending" : "paid") : pendingBill ? "pending" : "paid"}
            label={isAdmin ? `${pendingSocietyBills.length} Flats Pending` : pendingBill ? "Payment Due" : "All Cleared"}
          />
        </div>

        {!isAdmin && pendingBill && (
          <div className="mt-4 pt-4 border-t border-[#2B3854] flex flex-col sm:flex-row items-center justify-between gap-3">
            <div className="text-xs text-[#A6ACC0]">
              <span>Bill Period: </span>
              <strong className="text-white">{pendingBill.monthYear}</strong>
              <span className="mx-2">•</span>
              <span>Due: </span>
              <strong className="text-[#F5F1E8]">{pendingBill.dueDate}</strong>
            </div>

            <button
              onClick={() => onPayBill(pendingBill)}
              className="tap-scale w-full sm:w-auto bg-[#E8B565] hover:bg-[#F0C87D] text-[#0E1420] font-black text-xs px-6 py-3 rounded-xl flex items-center justify-center gap-2 shadow-sm transition-all"
              id="pay-current-bill-btn"
            >
              <CreditCard className="w-4 h-4 stroke-[2.5]" />
              <span>Pay via Razorpay ({formatINR(pendingBill.totalAmount)})</span>
            </button>
          </div>
        )}

        {!isAdmin && !pendingBill && (
          <div className="mt-3 pt-3 border-t border-[#2B3854] text-xs text-[#A6ACC0] flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4 text-[#F5F1E8]" />
            <span>No pending dues for Flat {currentUser.flatNumber}. Next bill generates Nov 1.</span>
          </div>
        )}

        {isAdmin && (
          <div className="mt-3 pt-3 border-t border-[#2B3854] text-xs text-[#A6ACC0] flex items-center justify-between">
            <span>Billing cycle: October 2026</span>
            <span className="text-[#F5F1E8] font-bold">{bills.length} Total Invoices Generated</span>
          </div>
        )}
      </DarkHeroCard>

      {/* 2. Segmented Tabs */}
      <SegmentedTabs
        activeTab={selectedTab}
        onChange={(tab) => setSelectedTab(tab as PaymentTab)}
        tabs={isAdmin ? adminTabs : residentTabs}
      />

      {/* ADMIN TAB: All Flats Society Ledger */}
      {selectedTab === "admin_ledger" && isAdmin && (
        <div className="space-y-3 animate-fade-in">
          <div className="flex justify-between items-center px-1">
            <h3 className="text-xs font-bold uppercase tracking-wider text-[#A6ACC0]">
              Monthly Dues Status by Flat
            </h3>
            <span className="text-xs text-[#A6ACC0]">{bills.length} Flats Tracked</span>
          </div>

          <div className="space-y-3">
            {bills.map((bill) => {
              const isPaid = bill.status === "paid";
              const isReminded =
                remindedBillIds.includes(bill.id) ||
                notifications.some(
                  (n) => n.flatNumber === bill.flatNumber && n.type === "due_reminder" && !n.read
                );

              const isExpanded = expandedBillId === bill.id;

              return (
                <div
                  key={bill.id}
                  className="bg-[#161F30] rounded-2xl border border-[#2B3854] shadow-sm hover:border-[#E8B565]/40 transition-all overflow-hidden"
                >
                  {/* Tap Header Row: Essential-at-a-glance (Flat Number once, Status Pill, Amount, Chevron) */}
                  <button
                    type="button"
                    onClick={() => setExpandedBillId(isExpanded ? null : bill.id)}
                    className="w-full p-3.5 sm:p-4 flex items-center justify-between gap-3 text-left cursor-pointer select-none"
                    aria-expanded={isExpanded}
                    id={`row-bill-${bill.flatNumber.toLowerCase()}`}
                  >
                    {/* Left: Flat Number (once) + Status Pill */}
                    <div className="flex items-center gap-2.5 min-w-0">
                      <span className="text-sm font-bold text-[#F5F1E8] shrink-0">
                        Flat {bill.flatNumber}
                      </span>
                      <StatusBadge status={bill.status} size="sm" />
                    </div>

                    {/* Right: Amount + Chevron */}
                    <div className="flex items-center gap-2.5 shrink-0">
                      <span className="text-sm font-black text-[#F5F1E8]">
                        {formatINR(bill.totalAmount)}
                      </span>
                      <div className="w-6 h-6 rounded-lg bg-[#1C2740] border border-[#2B3854] flex items-center justify-center text-[#A6ACC0]">
                        {isExpanded ? (
                          <ChevronUp className="w-3.5 h-3.5 text-[#F5F1E8]" />
                        ) : (
                          <ChevronDown className="w-3.5 h-3.5" />
                        )}
                      </div>
                    </div>
                  </button>

                  {/* Expanded Disclosure: Secondary Metadata & Actions */}
                  {isExpanded && (
                    <div className="px-4 pb-4 pt-2 border-t border-[#2B3854] bg-[#0E1420]/40 space-y-3 animate-fade-in text-xs">
                      <div className="grid grid-cols-2 gap-2 text-[#A6ACC0]">
                        <div className="bg-[#161F30] p-2.5 rounded-xl border border-[#2B3854]">
                          <span className="text-[10px] block font-medium">Billing Period</span>
                          <strong className="text-[#F5F1E8] text-xs">{bill.monthYear}</strong>
                        </div>
                        <div className="bg-[#161F30] p-2.5 rounded-xl border border-[#2B3854]">
                          <span className="text-[10px] block font-medium">Payment Due Date</span>
                          <strong className="text-[#F5F1E8] text-xs">{bill.dueDate}</strong>
                        </div>
                      </div>

                      {isPaid ? (
                        <div className="flex items-center justify-between pt-1">
                          <div className="text-[11px] text-[#8FBF8A] font-medium flex items-center gap-1.5 min-w-0 pr-2">
                            <CheckCircle2 className="w-3.5 h-3.5 shrink-0" />
                            <span className="truncate">Ref: {bill.paymentRef} • {bill.paidAt}</span>
                          </div>
                          <button
                            type="button"
                            onClick={(e) => {
                              e.stopPropagation();
                              onViewReceipt(bill);
                            }}
                            className="bg-[#1C2740] hover:bg-[#161F30] text-[#F5F1E8] border border-[#2B3854] hover:border-[#E8B565]/50 text-xs font-semibold px-3 py-1.5 rounded-xl flex items-center gap-1.5 shadow-sm transition-all shrink-0 cursor-pointer"
                          >
                            <Receipt className="w-3.5 h-3.5 text-[#F5F1E8]" />
                            <span>View Receipt</span>
                          </button>
                        </div>
                      ) : (
                        <div className="flex items-center justify-between pt-1">
                          <span className="text-[11px] text-[#A6ACC0]">
                            {isReminded ? "Reminder already sent to resident" : "Send payment alert to resident"}
                          </span>
                          <button
                            type="button"
                            onClick={(e) => {
                              e.stopPropagation();
                              handleSendReminder(bill);
                            }}
                            disabled={isReminded}
                            className={`text-xs font-bold px-3.5 py-1.5 rounded-xl flex items-center gap-1.5 transition-all cursor-pointer ${
                              isReminded
                                ? "bg-[#1C2740] text-[#F5F1E8] border border-[#E8B565]/40 cursor-not-allowed opacity-90"
                                : "bg-[#161F30] hover:bg-[#1C2740] text-[#F5F1E8] border border-[#2B3854] hover:border-[#E8B565]/50 shadow-sm"
                            }`}
                            id={`btn-send-reminder-${bill.flatNumber.toLowerCase()}`}
                          >
                            {isReminded ? (
                              <>
                                <CheckCircle2 className="w-3.5 h-3.5 text-[#F5F1E8]" />
                                <span>Reminder Sent ✓</span>
                              </>
                            ) : (
                              <>
                                <BellRing className="w-3.5 h-3.5" />
                                <span>Send Reminder</span>
                              </>
                            )}
                          </button>
                        </div>
                      )}
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* TAB 1: Current Bill Breakdown */}
      {selectedTab === "current" && !isAdmin && (
        <div className="space-y-4 animate-fade-in">
          {pendingBill ? (
            <div className="bg-[#161F30] border border-[#2B3854] rounded-2xl p-6 shadow-sm space-y-4">
              <div className="flex justify-between items-center border-b border-[#2B3854] pb-3">
                <div>
                  <h3 className="text-sm font-bold text-[#F5F1E8]">
                    Itemized Maintenance Invoice
                  </h3>
                  <p className="text-[11px] text-[#A6ACC0]">
                    Invoice #{pendingBill.id.toUpperCase()} • Generated {pendingBill.billingDate}
                  </p>
                </div>
                <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[10px] font-bold text-[#A9B4CC] bg-[#161F30] border border-[#A9B4CC]/30">
                  <span className="w-1.5 h-1.5 rounded-full bg-[#A9B4CC]" />
                  <span>Pending</span>
                </div>
              </div>

              {/* Items List */}
              <div className="divide-y divide-white/[0.08] text-xs">
                {pendingBill.items.map((item) => (
                  <div key={item.id} className="py-2.5 flex justify-between items-center">
                    <div>
                      <div className="font-semibold text-[#F5F1E8]">{item.name}</div>
                      <span className="text-[10px] text-[#A6ACC0] uppercase font-mono">
                        {item.category.replace("_", " ")}
                      </span>
                    </div>
                    <div className="font-bold text-[#F5F1E8] text-sm">
                      {formatINR(item.amount)}
                    </div>
                  </div>
                ))}
              </div>

              {/* Summary total */}
              <div className="pt-3 border-t border-[#2B3854] flex justify-between items-baseline">
                <div>
                  <span className="text-xs text-[#A6ACC0] font-medium block">Total Payable</span>
                  <span className="text-[10px] text-[#A6ACC0]">Inclusive of all common cess</span>
                </div>
                <div className="text-2xl font-bold text-[#F5F1E8]">
                  {formatINR(pendingBill.totalAmount)}
                </div>
              </div>

              {/* Pay action */}
              <button
                onClick={() => onPayBill(pendingBill)}
                className="w-full bg-[#E8B565] hover:bg-[#F0C87D] text-[#0E1420] font-black text-sm py-3.5 rounded-xl flex items-center justify-center gap-2 shadow-sm transition-all"
              >
                <CreditCard className="w-4 h-4 stroke-[2.5]" />
                <span>Pay {formatINR(pendingBill.totalAmount)} via Razorpay Gateway</span>
              </button>
            </div>
          ) : (
            <div className="bg-[#161F30] border border-[#2B3854] rounded-2xl p-8 text-center shadow-sm space-y-3">
              <div className="w-12 h-12 rounded-full bg-emerald-950/40 text-emerald-400 border border-emerald-500/30 flex items-center justify-center mx-auto">
                <CheckCircle2 className="w-6 h-6" />
              </div>
              <h4 className="font-bold text-base text-[#F5F1E8]">No Pending Invoices</h4>
              <p className="text-xs text-[#A6ACC0] max-w-sm mx-auto">
                You are all caught up! You can review previous payment confirmations in the History
                tab.
              </p>
            </div>
          )}
        </div>
      )}

      {/* TAB 2: Payment History & Receipts */}
      {selectedTab === "history" && !isAdmin && (
        <div className="space-y-3 animate-fade-in">
          {paidBills.length > 0 ? (
            paidBills.map((bill, idx) => (
              <div
                key={bill.id}
                className="list-item-in bg-[#161F30] rounded-2xl p-4 border border-[#2B3854] shadow-sm flex items-center justify-between gap-3 hover:border-[#E8B565]/40 transition-all"
                style={{ "--stagger-delay": `${Math.min(idx * 40, 320)}ms` } as React.CSSProperties}
              >
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-2xl bg-emerald-950/40 text-emerald-400 border border-emerald-500/30 flex items-center justify-center">
                    <Receipt className="w-5 h-5" />
                  </div>
                  <div>
                    <h4 className="text-sm font-bold text-[#F5F1E8]">{bill.monthYear} Bill</h4>
                    <p className="text-[11px] text-[#A6ACC0]">
                      Paid on {bill.paidAt} • {bill.paymentMethod || "UPI"}
                    </p>
                    <span className="text-[10px] font-mono text-emerald-400 bg-emerald-950/40 border border-emerald-500/30 px-1.5 py-0.5 rounded font-medium">
                      {bill.paymentRef}
                    </span>
                  </div>
                </div>

                <div className="text-right flex flex-col items-end gap-1.5">
                  <span className="text-sm font-black text-[#F5F1E8]">
                    {formatINR(bill.totalAmount)}
                  </span>
                  <button
                    onClick={() => onViewReceipt(bill)}
                    className="bg-[#1C2740] border border-[#2B3854] hover:bg-[#A6ACC0]/10 text-[#F5F1E8] text-[11px] font-semibold px-3 py-1 rounded-xl flex items-center gap-1 shadow-sm transition-all"
                  >
                    <Download className="w-3 h-3 text-[#F5F1E8]" />
                    <span>Receipt</span>
                  </button>
                </div>
              </div>
            ))
          ) : (
            <div className="bg-[#161F30] rounded-2xl p-8 text-center border border-[#2B3854]">
              <p className="text-xs text-[#A6ACC0]">No payment history found for this flat.</p>
            </div>
          )}
        </div>
      )}

      {/* TAB 3: Property Tax Line Item / Admin Ledger */}
      {selectedTab === "property_tax" && (() => {
        const taxList = propertyTaxes && propertyTaxes.length > 0 ? propertyTaxes : INITIAL_PROPERTY_TAXES;
        const paidList = taxList.filter((t) => t.status === "paid");
        const unpaidList = taxList.filter((t) => t.status === "not_paid");
        const totalAssessed = taxList.reduce((acc, t) => acc + t.annualTaxAmount, 0);
        const totalPaidAmount = paidList.reduce((acc, t) => acc + t.annualTaxAmount, 0);
        const totalUnpaidAmount = unpaidList.reduce((acc, t) => acc + t.annualTaxAmount, 0);

        // ADMIN CONSOLE: Property Type & Tax Ledger
        if (isAdmin) {
          return (
            <div className="space-y-4 animate-fade-in">
              {/* Admin Ledger Header */}
              <div className="bg-[var(--card)] rounded-2xl p-5 border border-[var(--border)] shadow-sm space-y-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-2xl bg-[var(--surface)] border border-[var(--border)] text-[var(--text)] flex items-center justify-center shrink-0">
                      <Landmark className="w-5 h-5 text-[var(--accent)]" />
                    </div>
                    <div>
                      <h3 className="text-sm font-bold text-[var(--text)]">
                        Society Municipal Property Tax Ledger
                      </h3>
                      <p className="text-xs text-[var(--text-secondary)]">
                        Annual municipal tax assessment & payment reconciliation by flat
                      </p>
                    </div>
                  </div>

                  <span className="text-xs font-bold text-[var(--accent)] bg-[var(--surface)] border border-[var(--border)] px-3 py-1 rounded-full shrink-0">
                    FY 2026-27
                  </span>
                </div>

                {/* Summary Metrics Grid */}
                <div className="grid grid-cols-3 gap-2.5 pt-2 border-t border-[var(--border)] text-xs">
                  <div className="bg-[var(--surface)]/60 border border-[var(--border)] rounded-xl p-3">
                    <span className="text-[10px] text-[var(--text-secondary)] uppercase font-semibold block">
                      Total Assessed
                    </span>
                    <span className="text-sm font-black text-[var(--text)] block mt-0.5">
                      {formatINR(totalAssessed)}
                    </span>
                    <span className="text-[10px] text-[var(--text-secondary)]">
                      {taxList.length} flats registered
                    </span>
                  </div>

                  <div className="bg-[#8FBF8A]/10 border border-[#8FBF8A]/20 rounded-xl p-3">
                    <span className="text-[10px] text-[#8FBF8A] uppercase font-semibold block">
                      Collected (Paid)
                    </span>
                    <span className="text-sm font-black text-[#8FBF8A] block mt-0.5">
                      {formatINR(totalPaidAmount)}
                    </span>
                    <span className="text-[10px] text-[#8FBF8A]/80">
                      {paidList.length} flats cleared
                    </span>
                  </div>

                  <div className="bg-[#E2685B]/10 border border-[#E2685B]/20 rounded-xl p-3">
                    <span className="text-[10px] text-[#E2685B] uppercase font-semibold block">
                      Outstanding
                    </span>
                    <span className="text-sm font-black text-[#E2685B] block mt-0.5">
                      {formatINR(totalUnpaidAmount)}
                    </span>
                    <span className="text-[10px] text-[#E2685B]/80">
                      {unpaidList.length} flats pending
                    </span>
                  </div>
                </div>
              </div>

              {/* Flat-by-Flat Property Type & Payment Ledger */}
              <div className="space-y-3">
                <div className="flex justify-between items-center px-1">
                  <h4 className="text-xs font-bold uppercase tracking-wider text-[var(--text-secondary)]">
                    Flat Property Classification & Dues Status
                  </h4>
                  <span className="text-xs text-[var(--text-secondary)]">
                    Tap status pill to toggle Paid / Not Paid
                  </span>
                </div>

                {taxList.map((pt) => {
                  const isPaid = pt.status === "paid";
                  const config = PROPERTY_TAX_CONFIG[pt.propertyType];

                  return (
                    <div
                      key={pt.flatId}
                      className="bg-[var(--card)] border border-[var(--border)] rounded-2xl p-4 space-y-3 shadow-sm hover:border-[var(--accent)]/40 transition-all"
                      id={`tax-card-${pt.flatNumber.toLowerCase()}`}
                    >
                      {/* Top Header: Flat, Resident Name, and Paid/Not Paid Toggle Button */}
                      <div className="flex items-center justify-between gap-2">
                        <div className="flex items-center gap-2.5 min-w-0">
                          <div className="w-9 h-9 rounded-xl bg-[var(--surface)] text-[var(--text)] border border-[var(--border)] flex items-center justify-center font-bold text-xs shrink-0">
                            {pt.flatNumber}
                          </div>
                          <div className="min-w-0">
                            <span className="text-xs font-bold text-[var(--text)] block truncate">
                              Flat {pt.flatNumber} • {pt.residentName}
                            </span>
                            <span className="text-[10px] font-mono text-[var(--text-secondary)] block truncate">
                              SAC: {pt.sacNumber}
                            </span>
                          </div>
                        </div>

                        {/* Interactive Status Toggle Button */}
                        <button
                          type="button"
                          onClick={() =>
                            onUpdatePropertyTax?.(pt.flatId, {
                              status: isPaid ? "not_paid" : "paid",
                            })
                          }
                          className={`px-3 py-1.5 rounded-xl text-xs font-bold border flex items-center gap-1.5 transition-all cursor-pointer active:scale-95 shrink-0 ${
                            isPaid
                              ? "bg-[#8FBF8A]/15 text-[#8FBF8A] border-[#8FBF8A]/30 hover:bg-[#8FBF8A]/25"
                              : "bg-[#E2685B]/15 text-[#E2685B] border-[#E2685B]/30 hover:bg-[#E2685B]/25"
                          }`}
                          title={`Click to mark as ${isPaid ? "Not Paid" : "Paid"}`}
                          id={`toggle-tax-status-${pt.flatNumber.toLowerCase()}`}
                        >
                          {isPaid ? (
                            <>
                              <CheckCircle2 className="w-3.5 h-3.5 shrink-0" />
                              <span>Paid</span>
                            </>
                          ) : (
                            <>
                              <AlertTriangle className="w-3.5 h-3.5 shrink-0" />
                              <span>Not Paid</span>
                            </>
                          )}
                        </button>
                      </div>

                      {/* Property Type Selector Dropdown & Auto-calculated Assessment */}
                      <div className="bg-[var(--surface)]/50 border border-[var(--border)] p-3 rounded-xl space-y-2">
                        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                          <div className="flex-1 min-w-0">
                            <label className="text-[10px] text-[var(--text-secondary)] uppercase font-bold tracking-wider block mb-1">
                              Select Property Type / Unit Area
                            </label>
                            <select
                              value={pt.propertyType}
                              onChange={(e) =>
                                onUpdatePropertyTax?.(pt.flatId, {
                                  propertyType: e.target.value as PropertyType,
                                })
                              }
                              className="w-full bg-[var(--card)] text-[var(--text)] border border-[var(--border)] rounded-xl px-3 py-2 text-xs font-semibold focus:outline-none focus:border-[var(--accent)] cursor-pointer"
                              id={`select-property-type-${pt.flatNumber.toLowerCase()}`}
                            >
                              <option value="1_bhk">1 BHK Compact (620 sq.ft) — ₹10,800/yr</option>
                              <option value="2_bhk">2 BHK Standard (950 sq.ft) — ₹16,800/yr</option>
                              <option value="3_bhk">3 BHK Luxury (1,380 sq.ft) — ₹24,000/yr</option>
                              <option value="penthouse">4 BHK Penthouse (2,200 sq.ft) — ₹32,400/yr</option>
                            </select>
                          </div>

                          <div className="sm:text-right shrink-0">
                            <span className="text-[10px] text-[var(--text-secondary)] uppercase font-bold block">
                              Annual Assessment
                            </span>
                            <span className="text-sm font-black text-[var(--text)] block">
                              {formatINR(pt.annualTaxAmount)} / yr
                            </span>
                            <span className="text-[10px] text-[var(--text-secondary)]">
                              ({formatINR(config?.monthlyAmount || Math.round(pt.annualTaxAmount / 12))}/mo pro-rata)
                            </span>
                          </div>
                        </div>

                        {/* Settlement details if paid */}
                        {isPaid && (
                          <div className="pt-2 border-t border-[var(--border)] flex justify-between items-center text-[11px] text-[#8FBF8A]">
                            <span>Status: Cleared for current year</span>
                            <div className="flex items-center gap-2">
                              <span className="font-mono text-[10px] text-[var(--text-secondary)]">
                                Receipt: {pt.paymentRef || "MUM/TAX/2026/884910"}
                              </span>
                              {onViewPropertyTaxReceipt && (
                                <button
                                  type="button"
                                  onClick={() => onViewPropertyTaxReceipt(pt)}
                                  className="px-2 py-0.5 rounded-lg bg-[var(--surface)] hover:bg-[var(--surface)]/80 text-[var(--accent)] border border-[var(--border)] text-[10px] font-semibold flex items-center gap-1 cursor-pointer transition-all"
                                  title="View / Download Tax Receipt"
                                >
                                  <Receipt className="w-3 h-3" />
                                  <span>Receipt</span>
                                </button>
                              )}
                            </div>
                          </div>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          );
        }

        // RESIDENT CONSOLE: Property Tax Assessment for Current Flat
        const myTax =
          taxList.find(
            (t) => t.flatId === currentUser.id || t.flatNumber === currentUser.flatNumber
          ) || taxList[0];
        const isPaid = myTax.status === "paid";
        const config = PROPERTY_TAX_CONFIG[myTax.propertyType];

        return (
          <div className="bg-[var(--card)] rounded-2xl p-5 border border-[var(--border)] shadow-sm space-y-4 animate-fade-in">
            {/* Header & Payment Status Pill */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-[var(--border)]">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-2xl bg-[var(--surface)] border border-[var(--border)] text-[var(--text)] flex items-center justify-center shrink-0">
                  <Landmark className="w-5 h-5 text-[var(--accent)]" />
                </div>
                <div>
                  <h3 className="text-sm font-bold text-[var(--text)]">
                    Municipal Property Tax (Annual Line Item)
                  </h3>
                  <p className="text-xs text-[var(--text-secondary)]">
                    Municipal Corporation Assessment for Flat {currentUser.flatNumber}
                  </p>
                </div>
              </div>

              {/* Status Pill matching Admin Ledger */}
              <div
                className={`px-3.5 py-1.5 rounded-xl text-xs font-bold border flex items-center gap-1.5 self-start sm:self-auto shrink-0 ${
                  isPaid
                    ? "bg-[#8FBF8A]/15 text-[#8FBF8A] border-[#8FBF8A]/30"
                    : "bg-[#E2685B]/15 text-[#E2685B] border-[#E2685B]/30"
                }`}
                id="resident-property-tax-status-pill"
              >
                {isPaid ? (
                  <>
                    <CheckCircle2 className="w-4 h-4 shrink-0" />
                    <span>PAID • FY 2026-27</span>
                  </>
                ) : (
                  <>
                    <AlertTriangle className="w-4 h-4 shrink-0" />
                    <span>NOT PAID • ACTION REQUIRED</span>
                  </>
                )}
              </div>
            </div>

            {/* Assessment Details Box */}
            <div className="bg-[var(--surface)] border border-[var(--border)] p-4 rounded-2xl space-y-2.5 text-xs">
              <div className="flex justify-between items-center">
                <span className="text-[var(--text-secondary)]">Assigned Property Type:</span>
                <span className="font-bold text-[var(--text)]">
                  {config?.label || `${myTax.propertyType.toUpperCase()} Standard`}
                </span>
              </div>

              <div className="flex justify-between items-center">
                <span className="text-[var(--text-secondary)]">Carpet / Built-up Area:</span>
                <span className="font-semibold text-[var(--text)]">
                  {config?.sqft || 950} sq.ft
                </span>
              </div>

              <div className="flex justify-between items-center">
                <span className="text-[var(--text-secondary)]">Property Tax SAC No:</span>
                <span className="font-mono font-bold text-[var(--text)]">{myTax.sacNumber}</span>
              </div>

              <div className="flex justify-between items-center pt-1 border-t border-[var(--border)]">
                <span className="text-[var(--text-secondary)] font-semibold">Annual Assessment Amount:</span>
                <div className="text-right">
                  <span className="font-black text-sm text-[var(--text)] block">
                    {formatINR(myTax.annualTaxAmount)} / year
                  </span>
                  <span className="text-[10px] text-[var(--text-secondary)]">
                    ({formatINR(config?.monthlyAmount || Math.round(myTax.annualTaxAmount / 12))}/mo pro-rata)
                  </span>
                </div>
              </div>

              {/* Status footer message and interactive payment / receipt action */}
              {isPaid ? (
                <div className="mt-2 pt-2 border-t border-[var(--border)] flex flex-col sm:flex-row sm:justify-between sm:items-center text-[11px] text-[#8FBF8A] gap-2">
                  <div>
                    <span className="block font-semibold">Settlement: Dues cleared for FY 2026-27</span>
                    <span className="font-mono text-[10px] text-[var(--text-secondary)]">
                      Ref: {myTax.paymentRef || "MUM/TAX/2026/884910"}
                    </span>
                  </div>
                  {onViewPropertyTaxReceipt && (
                    <button
                      type="button"
                      onClick={() => onViewPropertyTaxReceipt(myTax)}
                      className="px-3.5 py-2 rounded-xl bg-[var(--accent)] hover:bg-[var(--accent-hover)] text-[var(--on-accent)] font-bold text-xs flex items-center gap-1.5 shadow-sm transition-all cursor-pointer shrink-0 self-start sm:self-auto"
                      id="btn-download-tax-receipt"
                    >
                      <Download className="w-3.5 h-3.5" />
                      <span>Download Receipt</span>
                    </button>
                  )}
                </div>
              ) : (
                <div className="mt-2 pt-2 border-t border-[var(--border)] space-y-3">
                  <div className="flex items-start gap-2 text-[11px] text-[#E2685B]">
                    <AlertTriangle className="w-3.5 h-3.5 shrink-0 mt-0.5" />
                    <span>
                      Civic assessment is pending payment. You can pay directly online using the button below or via the municipal tax portal.
                    </span>
                  </div>

                  {onPayPropertyTax && (
                    <button
                      type="button"
                      onClick={() => onPayPropertyTax(myTax)}
                      className="w-full py-3 px-4 rounded-xl bg-[var(--accent)] hover:bg-[var(--accent-hover)] text-[var(--on-accent)] font-bold text-xs flex items-center justify-center gap-2 transition-all shadow-sm active:scale-[0.98] cursor-pointer"
                      id="btn-pay-property-tax"
                    >
                      <CreditCard className="w-4 h-4 shrink-0" />
                      <span>Pay Property Tax • {formatINR(myTax.annualTaxAmount)}</span>
                      <ArrowRight className="w-4 h-4 shrink-0" />
                    </button>
                  )}
                </div>
              )}
            </div>

            {/* Statutory Guidance */}
            <div className="text-xs text-[var(--text-secondary)] space-y-1.5">
              <p>
                • Property tax is assessed annually by the Municipal Corporation based on unit carpet area and property classification.
              </p>
              <p>
                • Residents can verify municipal assessment details against the registered Property Tax SAC number.
              </p>
            </div>
          </div>
        );
      })()}
    </div>
  );
};
