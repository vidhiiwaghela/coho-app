"use client";

import React, { useState } from "react";
import { MaintenanceBill, FlatUser, Notification } from "../../types";
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
} from "lucide-react";

interface PaymentsViewProps {
  currentUser: FlatUser;
  bills: MaintenanceBill[];
  onPayBill: (bill: MaintenanceBill) => void;
  onViewReceipt: (bill: MaintenanceBill) => void;
  notifications?: Notification[];
  onSendPaymentReminder?: (flatNumber: string, amount: number, month: string) => void;
}

type PaymentTab = "current" | "history" | "property_tax" | "admin_ledger";

export const PaymentsView: React.FC<PaymentsViewProps> = ({
  currentUser,
  bills,
  onPayBill,
  onViewReceipt,
  notifications = [],
  onSendPaymentReminder,
}) => {
  const isAdmin = currentUser.role === "admin";
  const [selectedTab, setSelectedTab] = useState<PaymentTab>(
    isAdmin ? "admin_ledger" : "current"
  );
  const [remindedBillIds, setRemindedBillIds] = useState<string[]>([]);

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
          <div className="mt-4 pt-4 border-t border-[#22304A] flex flex-col sm:flex-row items-center justify-between gap-3">
            <div className="text-xs text-[#8C97AD]">
              <span>Bill Period: </span>
              <strong className="text-white">{pendingBill.monthYear}</strong>
              <span className="mx-2">•</span>
              <span>Due: </span>
              <strong className="text-[#F3F5F9]">{pendingBill.dueDate}</strong>
            </div>

            <button
              onClick={() => onPayBill(pendingBill)}
              className="w-full sm:w-auto bg-[#EFE4CC] hover:bg-[#F7F0DF] text-[#0A1120] font-black text-xs px-6 py-3 rounded-xl flex items-center justify-center gap-2 shadow-sm transition-all"
              id="pay-current-bill-btn"
            >
              <CreditCard className="w-4 h-4 stroke-[2.5]" />
              <span>Pay via Razorpay ({formatINR(pendingBill.totalAmount)})</span>
            </button>
          </div>
        )}

        {!isAdmin && !pendingBill && (
          <div className="mt-3 pt-3 border-t border-[#22304A] text-xs text-[#8C97AD] flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4 text-[#F3F5F9]" />
            <span>No pending dues for Flat {currentUser.flatNumber}. Next bill generates Nov 1.</span>
          </div>
        )}

        {isAdmin && (
          <div className="mt-3 pt-3 border-t border-[#22304A] text-xs text-[#8C97AD] flex items-center justify-between">
            <span>Billing cycle: October 2026</span>
            <span className="text-[#F3F5F9] font-bold">{bills.length} Total Invoices Generated</span>
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
            <h3 className="text-xs font-bold uppercase tracking-wider text-[#8C97AD]">
              Monthly Dues Status by Flat
            </h3>
            <span className="text-xs text-[#8C97AD]">{bills.length} Flats Tracked</span>
          </div>

          <div className="space-y-3">
            {bills.map((bill) => {
              const isPaid = bill.status === "paid";
              const isReminded =
                remindedBillIds.includes(bill.id) ||
                notifications.some(
                  (n) => n.flatNumber === bill.flatNumber && n.type === "due_reminder" && !n.read
                );

              return (
                <div
                  key={bill.id}
                  className="bg-[#111C2E] rounded-2xl p-4 border border-[#22304A] shadow-sm flex items-center justify-between gap-3 hover:border-[#EFE4CC]/40 transition-all"
                >
                  <div className="flex items-center gap-3">
                    <div
                      className={`w-10 h-10 rounded-2xl flex items-center justify-center font-bold text-xs ${
                        isPaid
                          ? "bg-emerald-950/40 text-emerald-400 border border-emerald-500/30"
                          : "bg-[#16233A] text-[#F3F5F9] border border-[#22304A]"
                      }`}
                    >
                      {bill.flatNumber}
                    </div>
                    <div>
                      <div className="flex items-center gap-2">
                        <h4 className="text-sm font-bold text-[#F3F5F9]">Flat {bill.flatNumber}</h4>
                        <StatusBadge status={bill.status} size="sm" />
                      </div>
                      <p className="text-[11px] text-[#8C97AD]">
                        {bill.monthYear} • {isPaid ? `Paid (${bill.paymentRef})` : `Due by ${bill.dueDate}`}
                      </p>
                    </div>
                  </div>

                  <div className="text-right flex flex-col items-end gap-1.5">
                    <span className="text-sm font-black text-[#F3F5F9]">
                      {formatINR(bill.totalAmount)}
                    </span>

                    {isPaid ? (
                      <button
                        onClick={() => onViewReceipt(bill)}
                        className="bg-[#16233A] hover:bg-[#111C2E] text-[#F3F5F9] border border-[#22304A] text-[11px] font-semibold px-2.5 py-1 rounded-xl flex items-center gap-1 shadow-sm transition-all"
                      >
                        <Receipt className="w-3 h-3 text-[#F3F5F9]" />
                        <span>Receipt</span>
                      </button>
                    ) : (
                      <button
                        onClick={() => handleSendReminder(bill)}
                        disabled={isReminded}
                        className={`text-[11px] font-bold px-3 py-1.5 rounded-xl flex items-center gap-1 transition-all ${
                          isReminded
                            ? "bg-[#16233A] text-[#F3F5F9] border border-[#EFE4CC]/40 cursor-not-allowed opacity-90"
                            : "bg-[#111C2E] hover:bg-[#16233A] text-[#F3F5F9] border border-[#22304A] hover:border-[#EFE4CC]/50 shadow-sm cursor-pointer"
                        }`}
                        id={`btn-send-reminder-${bill.flatNumber.toLowerCase()}`}
                      >
                        {isReminded ? (
                          <>
                            <CheckCircle2 className="w-3 h-3 text-[#F3F5F9]" />
                            <span>Reminder Sent ✓</span>
                          </>
                        ) : (
                          <>
                            <BellRing className="w-3 h-3" />
                            <span>Send Reminder</span>
                          </>
                        )}
                      </button>
                    )}
                  </div>
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
            <div className="bg-[#111C2E] border border-[#22304A] rounded-2xl p-6 shadow-sm space-y-4">
              <div className="flex justify-between items-center border-b border-[#22304A] pb-3">
                <div>
                  <h3 className="text-sm font-bold text-[#F3F5F9]">
                    Itemized Maintenance Invoice
                  </h3>
                  <p className="text-[11px] text-[#8C97AD]">
                    Invoice #{pendingBill.id.toUpperCase()} • Generated {pendingBill.billingDate}
                  </p>
                </div>
                <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[10px] font-bold text-[#A9B4CC] bg-[#111C2E] border border-[#A9B4CC]/30">
                  <span className="w-1.5 h-1.5 rounded-full bg-[#A9B4CC]" />
                  <span>Pending</span>
                </div>
              </div>

              {/* Items List */}
              <div className="divide-y divide-white/[0.08] text-xs">
                {pendingBill.items.map((item) => (
                  <div key={item.id} className="py-2.5 flex justify-between items-center">
                    <div>
                      <div className="font-semibold text-[#F3F5F9]">{item.name}</div>
                      <span className="text-[10px] text-[#8C97AD] uppercase font-mono">
                        {item.category.replace("_", " ")}
                      </span>
                    </div>
                    <div className="font-bold text-[#F3F5F9] text-sm">
                      {formatINR(item.amount)}
                    </div>
                  </div>
                ))}
              </div>

              {/* Summary total */}
              <div className="pt-3 border-t border-[#22304A] flex justify-between items-baseline">
                <div>
                  <span className="text-xs text-[#8C97AD] font-medium block">Total Payable</span>
                  <span className="text-[10px] text-[#8C97AD]">Inclusive of all common cess</span>
                </div>
                <div className="text-2xl font-bold text-[#F3F5F9]">
                  {formatINR(pendingBill.totalAmount)}
                </div>
              </div>

              {/* Pay action */}
              <button
                onClick={() => onPayBill(pendingBill)}
                className="w-full bg-[#EFE4CC] hover:bg-[#F7F0DF] text-[#0A1120] font-black text-sm py-3.5 rounded-xl flex items-center justify-center gap-2 shadow-sm transition-all"
              >
                <CreditCard className="w-4 h-4 stroke-[2.5]" />
                <span>Pay {formatINR(pendingBill.totalAmount)} via Razorpay Gateway</span>
              </button>
            </div>
          ) : (
            <div className="bg-[#111C2E] border border-[#22304A] rounded-2xl p-8 text-center shadow-sm space-y-3">
              <div className="w-12 h-12 rounded-full bg-emerald-950/40 text-emerald-400 border border-emerald-500/30 flex items-center justify-center mx-auto">
                <CheckCircle2 className="w-6 h-6" />
              </div>
              <h4 className="font-bold text-base text-[#F3F5F9]">No Pending Invoices</h4>
              <p className="text-xs text-[#8C97AD] max-w-sm mx-auto">
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
            paidBills.map((bill) => (
              <div
                key={bill.id}
                className="bg-[#111C2E] rounded-2xl p-4 border border-[#22304A] shadow-sm flex items-center justify-between gap-3 hover:border-[#EFE4CC]/40 transition-all"
              >
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-2xl bg-emerald-950/40 text-emerald-400 border border-emerald-500/30 flex items-center justify-center">
                    <Receipt className="w-5 h-5" />
                  </div>
                  <div>
                    <h4 className="text-sm font-bold text-[#F3F5F9]">{bill.monthYear} Bill</h4>
                    <p className="text-[11px] text-[#8C97AD]">
                      Paid on {bill.paidAt} • {bill.paymentMethod || "UPI"}
                    </p>
                    <span className="text-[10px] font-mono text-emerald-400 bg-emerald-950/40 border border-emerald-500/30 px-1.5 py-0.5 rounded font-medium">
                      {bill.paymentRef}
                    </span>
                  </div>
                </div>

                <div className="text-right flex flex-col items-end gap-1.5">
                  <span className="text-sm font-black text-[#F3F5F9]">
                    {formatINR(bill.totalAmount)}
                  </span>
                  <button
                    onClick={() => onViewReceipt(bill)}
                    className="bg-[#16233A] border border-[#22304A] hover:bg-[#8C97AD]/10 text-[#F3F5F9] text-[11px] font-semibold px-3 py-1 rounded-xl flex items-center gap-1 shadow-sm transition-all"
                  >
                    <Download className="w-3 h-3 text-[#F3F5F9]" />
                    <span>Receipt</span>
                  </button>
                </div>
              </div>
            ))
          ) : (
            <div className="bg-[#111C2E] rounded-2xl p-8 text-center border border-[#22304A]">
              <p className="text-xs text-[#8C97AD]">No payment history found for this flat.</p>
            </div>
          )}
        </div>
      )}

      {/* TAB 3: Property Tax Line Item */}
      {selectedTab === "property_tax" && (
        <div className="bg-[#111C2E] rounded-2xl p-5 border border-[#22304A] shadow-sm space-y-4 animate-fade-in">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-[#16233A] border border-[#22304A] text-[#F3F5F9] flex items-center justify-center">
              <Landmark className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-sm font-bold text-[#F3F5F9]">
                Municipal Property Tax (Annual Line Item)
              </h3>
              <p className="text-xs text-[#8C97AD]">Municipal Corporation Property Assessment</p>
            </div>
          </div>

          <div className="bg-[#16233A] border border-[#22304A] p-4 rounded-2xl space-y-2 text-xs">
            <div className="flex justify-between">
              <span className="text-[#8C97AD]">Property Tax SAC No:</span>
              <span className="font-mono font-bold text-[#F3F5F9]">MH–MUM–2026–B402–99</span>
            </div>
            <div className="flex justify-between">
              <span className="text-[#8C97AD]">Annual Assessment Amount:</span>
              <span className="font-bold text-[#F3F5F9]">₹16,800 / year</span>
            </div>
          </div>

          <div className="text-xs text-[#8C97AD] space-y-1.5">
            <p>
              • Property tax is assessed annually by the Municipal Corporation and billed as a single yearly civic line item.
            </p>
            <p>
              • Residents can verify municipal assessment details against the registered Property Tax SAC number.
            </p>
          </div>
        </div>
      )}
    </div>
  );
};
