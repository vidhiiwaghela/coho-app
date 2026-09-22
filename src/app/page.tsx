"use client";

import React, { useState, useEffect } from "react";
import { useCohoStore } from "../lib/store";
import { Header } from "../components/common/Header";
import { FloatingNav } from "../components/common/FloatingNav";
import { DashboardView } from "../components/modules/DashboardView";
import { PaymentsView } from "../components/modules/PaymentsView";
import { RulesView } from "../components/modules/RulesView";
import { NoticesAndMinutesView } from "../components/modules/NoticesAndMinutesView";
import { SponsorshipView } from "../components/modules/SponsorshipView";
import { QRCodeModal } from "../components/common/QRCodeModal";
import { BillReceiptModal } from "../components/common/BillReceiptModal";
import { PropertyTaxReceiptModal } from "../components/common/PropertyTaxReceiptModal";
import { DocumentPreviewModal } from "../components/common/DocumentPreviewModal";
import { AdminManageModal } from "../components/modules/AdminManageModal";
import { LoginView } from "../components/auth/LoginView";
import { RequestDocumentModal } from "../components/modules/RequestDocumentModal";
import { LodgeComplaintModal } from "../components/modules/LodgeComplaintModal";
import { BookFacilityModal } from "../components/modules/BookFacilityModal";
import { AdminDocumentRequestsModal } from "../components/modules/AdminDocumentRequestsModal";
import { AdminComplaintsModal } from "../components/modules/AdminComplaintsModal";
import { AdminFacilityBookingsModal } from "../components/modules/AdminFacilityBookingsModal";
import { NotificationCenterView } from "../components/modules/NotificationCenterView";
import { MaintenanceBill, DocumentItem, FlatPropertyTax } from "../types";

export default function Home() {
  const {
    state,
    currentUser,
    isLoaded,
    login,
    logout,
    requestDocument,
    fulfillDocumentRequest,
    markDocumentNotAvailable,
    lodgeComplaint,
    updateComplaintStatus,
    bookFacility,
    updateFacilityBookingStatus,
    setActiveTab,
    payBill,
    addDocument,
    deleteDocument,
    addRule,
    addNotice,
    addMeeting,
    summarizeMeeting,
    donateToCampaign,
    addCampaign,
    sendPaymentReminder,
    markNotificationAsRead,
    updatePropertyTax,
    resetToDefault,
  } = useCohoStore();

  // Active Modals State
  const [activePayingBill, setActivePayingBill] = useState<MaintenanceBill | null>(null);
  const [activeReceiptBill, setActiveReceiptBill] = useState<MaintenanceBill | null>(null);
  const [activePayingTax, setActivePayingTax] = useState<FlatPropertyTax | null>(null);
  const [activeReceiptTax, setActiveReceiptTax] = useState<FlatPropertyTax | null>(null);
  const [activePreviewDoc, setActivePreviewDoc] = useState<DocumentItem | null>(null);
  const [adminModalOpen, setAdminModalOpen] = useState(false);

  // Workflow Modals State
  const [isRequestDocModalOpen, setIsRequestDocModalOpen] = useState(false);
  const [isLodgeComplaintModalOpen, setIsLodgeComplaintModalOpen] = useState(false);
  const [isBookFacilityModalOpen, setIsBookFacilityModalOpen] = useState(false);
  const [isAdminDocRequestsModalOpen, setIsAdminDocRequestsModalOpen] = useState(false);
  const [isAdminComplaintsModalOpen, setIsAdminComplaintsModalOpen] = useState(false);
  const [isAdminBookingsModalOpen, setIsAdminBookingsModalOpen] = useState(false);
  const [isNotificationCenterOpen, setIsNotificationCenterOpen] = useState(false);

  // Filter States for Detail Queue Modals
  const [docRequestsModalFilter, setDocRequestsModalFilter] = useState<"all" | "pending" | "fulfilled" | "unavailable" | "not_available">("all");
  const [bookingsModalFilter, setBookingsModalFilter] = useState<"all" | "pending" | "approved" | "rejected">("all");
  const [complaintsModalFilter, setComplaintsModalFilter] = useState<"all" | "pending" | "in_progress" | "resolved">("all");

  // Tenant RBAC: Redirect away from restricted tabs
  useEffect(() => {
    if (
      currentUser.role === "tenant" &&
      state.activeTab !== "rules" &&
      state.activeTab !== "festival"
    ) {
      setActiveTab("rules");
    }
  }, [currentUser.role, state.activeTab, setActiveTab]);

  // Splash Screen Dismissal Coordinator
  useEffect(() => {
    if (!isLoaded) return;

    const hideSplash = () => {
      const splash = document.getElementById("splash");
      if (!splash) return;
      splash.classList.add("hide");
      setTimeout(() => {
        splash.remove();
      }, 300);
    };

    const elapsed = typeof performance !== "undefined" ? performance.now() : 0;
    const remainingDelay = Math.max(0, 1500 - elapsed);
    const timer = setTimeout(hideSplash, remainingDelay);

    return () => clearTimeout(timer);
  }, [isLoaded]);

  if (!isLoaded) {
    return null;
  }

  // Auth Gate: Render LoginView when not authenticated
  if (!state.isAuthenticated) {
    return <LoginView flats={state.flats} onLogin={login} />;
  }

  const handlePaySuccess = (
    method: "Razorpay" | "UPI" | "NetBanking" | "Card" = "Razorpay",
    paymentRef?: string
  ) => {
    if (activePayingBill) {
      payBill(activePayingBill.id, method, paymentRef);
    } else if (activePayingTax) {
      const generatedRef = paymentRef || `TXN-PT-${Date.now().toString(36).toUpperCase()}`;
      const paidDate = new Date().toISOString().split("T")[0];
      const updatedTax: FlatPropertyTax = {
        ...activePayingTax,
        status: "paid",
        lastPaidDate: paidDate,
        paymentRef: generatedRef,
        paymentMethod: method,
      };
      updatePropertyTax(activePayingTax.flatId, {
        status: "paid",
        lastPaidDate: paidDate,
        paymentRef: generatedRef,
        paymentMethod: method,
      });
      setActivePayingTax(null);
      setActiveReceiptTax(updatedTax);
    }
  };

  const pendingRequestsCount =
    state.documentRequests?.filter((r) => r.status === "pending").length || 0;
  const pendingComplaintsCount =
    state.complaints?.filter((c) => c.status === "pending").length || 0;
  const pendingBookingsCount =
    state.facilityBookings?.filter((b) => b.status === "pending").length || 0;

  return (
    <div className="min-h-screen bg-[#0E1420] text-[#F5F1E8] flex flex-col items-center">
      {/* Container - Native App width on desktop with smooth scaling */}
      <div className="w-full max-w-lg min-h-screen bg-[#0E1420] flex flex-col relative sm:border-x sm:border-[#2B3854] sm:shadow-sm">
        {/* Sticky Header - Locked to active session with simple Log Out */}
        <div className="print:hidden">
          <Header
            currentUser={currentUser}
            flats={state.flats}
            onResetData={resetToDefault}
            onOpenAdminModal={() => setAdminModalOpen(true)}
            onLogout={logout}
            onOpenNotificationCenter={() => setIsNotificationCenterOpen(true)}
          />
        </div>

        {/* Main Content Area */}
        <main className="flex-1 p-4 sm:p-5 print:hidden">
          {/* 1. Dashboard / Home Tab */}
          {currentUser.role !== "tenant" && state.activeTab === "home" && (
            <DashboardView
              currentUser={currentUser}
              bills={state.bills}
              notices={state.notices}
              rules={state.rules}
              sponsorships={state.sponsorships}
              documentRequests={state.documentRequests}
              complaints={state.complaints}
              facilityBookings={state.facilityBookings}
              onNavigate={setActiveTab}
              onPayBillModal={(bill) => setActivePayingBill(bill)}
              onRequestDocument={() => setIsRequestDocModalOpen(true)}
              onLodgeComplaint={() => setIsLodgeComplaintModalOpen(true)}
              onBookFacility={() => setIsBookFacilityModalOpen(true)}
              onOpenAdminRequests={(filter = "all") => {
                setDocRequestsModalFilter(filter);
                setIsAdminDocRequestsModalOpen(true);
              }}
              onOpenAdminComplaints={(filter = "all") => {
                setComplaintsModalFilter(filter);
                setIsAdminComplaintsModalOpen(true);
              }}
              onOpenAdminBookings={(filter = "all") => {
                setBookingsModalFilter(filter);
                setIsAdminBookingsModalOpen(true);
              }}
              notifications={state.notifications}
              onDismissNotification={markNotificationAsRead}
              pendingRequestsCount={pendingRequestsCount}
              pendingComplaintsCount={pendingComplaintsCount}
              pendingBookingsCount={pendingBookingsCount}
            />
          )}

          {/* 2. Payments & Maintenance Tab */}
          {currentUser.role !== "tenant" && state.activeTab === "payments" && (
            <PaymentsView
              currentUser={currentUser}
              bills={state.bills}
              onPayBill={(bill) => setActivePayingBill(bill)}
              onViewReceipt={(bill) => setActiveReceiptBill(bill)}
              notifications={state.notifications}
              onSendPaymentReminder={sendPaymentReminder}
              propertyTaxes={state.propertyTaxes}
              onUpdatePropertyTax={updatePropertyTax}
              onPayPropertyTax={(tax) => setActivePayingTax(tax)}
              onViewPropertyTaxReceipt={(tax) => {
                const currentTax = state.propertyTaxes.find((pt) => pt.flatId === tax.flatId) || tax;
                setActiveReceiptTax(currentTax);
              }}
            />
          )}

          {/* 3. Notices & Minutes Tab (Merged Notices & Minutes only, toggle [All | Notices | Minutes]) */}
          {currentUser.role !== "tenant" && (state.activeTab === "notices" || state.activeTab === "meetings") && (
            <NoticesAndMinutesView
              notices={state.notices}
              meetings={state.meetings}
              currentUser={currentUser}
              initialCategory={state.activeTab === "meetings" ? "minutes" : "notices"}
              onCategoryChange={(cat) => {
                if (cat === "minutes") setActiveTab("meetings");
                else setActiveTab("notices");
              }}
              onAddNoticeClick={() => setAdminModalOpen(true)}
              onAddMeetingClick={() => setAdminModalOpen(true)}
              onSummarizeMeeting={summarizeMeeting}
            />
          )}

          {/* 4. Society Rules Tab (Dedicated tab rendering RulesView with full search intact) */}
          {state.activeTab === "rules" && (
            <RulesView
              rules={state.rules}
              currentUser={currentUser}
              onAddRuleClick={() => setAdminModalOpen(true)}
            />
          )}

          {/* 5. Festival & Sponsorship Tab */}
          {state.activeTab === "festival" && (
            <SponsorshipView
              campaigns={state.sponsorships}
              currentUser={currentUser}
              onDonate={donateToCampaign}
              onAddCampaign={addCampaign}
            />
          )}
        </main>

        {/* Floating Bottom Nav (5 Distinct Icons for Members; Rules & Festival only for Tenants) */}
        <div className="print:hidden">
          <FloatingNav
            activeTab={state.activeTab}
            onChangeTab={setActiveTab}
            unreadNoticesCount={state.notices.filter((n) => n.category === "urgent").length}
            userRole={currentUser.role}
          />
        </div>

        {/* Payment QR Modal */}
        {activePayingBill && (
          <QRCodeModal
            isOpen={Boolean(activePayingBill)}
            onClose={() => setActivePayingBill(null)}
            amount={activePayingBill.totalAmount}
            title={`${activePayingBill.monthYear} Maintenance`}
            subtitle={`Flat ${currentUser.flatNumber} • ${currentUser.residentName}`}
            billId={activePayingBill.id}
            residentName={currentUser.residentName}
            flatNumber={currentUser.flatNumber}
            onPaymentSuccess={handlePaySuccess}
          />
        )}

        {/* Property Tax Payment QR Modal */}
        {activePayingTax && (
          <QRCodeModal
            isOpen={Boolean(activePayingTax)}
            onClose={() => setActivePayingTax(null)}
            amount={activePayingTax.annualTaxAmount}
            title={`Property Tax AY 2026-27`}
            subtitle={`Flat ${activePayingTax.flatNumber} • SAC ${activePayingTax.sacNumber}`}
            billId={`PT-${activePayingTax.flatNumber}`}
            residentName={currentUser.residentName}
            flatNumber={activePayingTax.flatNumber}
            onPaymentSuccess={handlePaySuccess}
          />
        )}

        {/* Payment Receipt Modal */}
        {activeReceiptBill && (
          <BillReceiptModal
            isOpen={Boolean(activeReceiptBill)}
            onClose={() => setActiveReceiptBill(null)}
            bill={activeReceiptBill}
            currentUser={currentUser}
          />
        )}

        {/* Property Tax Receipt Modal */}
        {activeReceiptTax && (
          <PropertyTaxReceiptModal
            isOpen={Boolean(activeReceiptTax)}
            onClose={() => setActiveReceiptTax(null)}
            tax={activeReceiptTax}
            currentUser={currentUser}
          />
        )}

        {/* Document Preview Modal */}
        {activePreviewDoc && (
          <DocumentPreviewModal
            isOpen={Boolean(activePreviewDoc)}
            onClose={() => setActivePreviewDoc(null)}
            document={activePreviewDoc}
          />
        )}

        {/* Admin Manage Modal */}
        {adminModalOpen && (
          <AdminManageModal
            isOpen={adminModalOpen}
            onClose={() => setAdminModalOpen(false)}
            currentUser={currentUser}
            flats={state.flats}
            onAddNotice={addNotice}
            onAddRule={addRule}
            onAddDocument={addDocument}
            onAddMeeting={addMeeting}
          />
        )}

        {/* Member Request Document Modal */}
        <RequestDocumentModal
          isOpen={isRequestDocModalOpen}
          onClose={() => setIsRequestDocModalOpen(false)}
          currentUser={currentUser}
          onSubmitRequest={requestDocument}
        />

        {/* Member Lodge Complaint Modal */}
        <LodgeComplaintModal
          isOpen={isLodgeComplaintModalOpen}
          onClose={() => setIsLodgeComplaintModalOpen(false)}
          currentUser={currentUser}
          onSubmitComplaint={lodgeComplaint}
        />

        {/* Member Book Facility Modal */}
        <BookFacilityModal
          isOpen={isBookFacilityModalOpen}
          onClose={() => setIsBookFacilityModalOpen(false)}
          currentUser={currentUser}
          onSubmit={bookFacility}
        />

        {/* Admin & Resident Document Requests Modal */}
        <AdminDocumentRequestsModal
          isOpen={isAdminDocRequestsModalOpen}
          onClose={() => setIsAdminDocRequestsModalOpen(false)}
          requests={
            currentUser.role === "admin"
              ? (state.documentRequests || [])
              : (state.documentRequests || []).filter(
                  (r) => r.flatId === currentUser.id || r.flatNumber === currentUser.flatNumber
                )
          }
          onFulfillRequest={fulfillDocumentRequest}
          onMarkNotAvailable={markDocumentNotAvailable}
          initialFilter={docRequestsModalFilter}
          isAdmin={currentUser.role === "admin"}
          onRequestNewDoc={() => {
            setIsAdminDocRequestsModalOpen(false);
            setIsRequestDocModalOpen(true);
          }}
        />

        {/* Admin & Resident Complaints Modal */}
        <AdminComplaintsModal
          isOpen={isAdminComplaintsModalOpen}
          onClose={() => setIsAdminComplaintsModalOpen(false)}
          complaints={
            currentUser.role === "admin"
              ? (state.complaints || [])
              : (state.complaints || []).filter(
                  (c) => c.flatId === currentUser.id || c.flatNumber === currentUser.flatNumber
                )
          }
          onUpdateStatus={updateComplaintStatus}
          initialFilter={complaintsModalFilter}
          isAdmin={currentUser.role === "admin"}
          onLodgeNewComplaint={() => {
            setIsAdminComplaintsModalOpen(false);
            setIsLodgeComplaintModalOpen(true);
          }}
        />

        {/* Admin & Resident Facility Bookings Modal */}
        <AdminFacilityBookingsModal
          isOpen={isAdminBookingsModalOpen}
          onClose={() => setIsAdminBookingsModalOpen(false)}
          bookings={
            currentUser.role === "admin"
              ? (state.facilityBookings || [])
              : (state.facilityBookings || []).filter(
                  (b) => b.flatId === currentUser.id || b.flatNumber === currentUser.flatNumber
                )
          }
          onUpdateStatus={updateFacilityBookingStatus}
          initialFilter={bookingsModalFilter}
          isAdmin={currentUser.role === "admin"}
          onBookNewFacility={() => {
            setIsAdminBookingsModalOpen(false);
            setIsBookFacilityModalOpen(true);
          }}
        />

        {/* Dedicated iOS/Signal-Style Notification Center */}
        {isNotificationCenterOpen && (
          <div className="fixed inset-0 z-50 overflow-y-auto bg-[#0E1420]">
            <NotificationCenterView onBack={() => setIsNotificationCenterOpen(false)} />
          </div>
        )}
      </div>
    </div>
  );
}
