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
import { MaintenanceBill, DocumentItem } from "../types";

export default function Home() {
  const {
    state,
    currentUser,
    isLoaded,
    login,
    logout,
    requestDocument,
    fulfillDocumentRequest,
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
    resetToDefault,
  } = useCohoStore();

  // Active Modals State
  const [activePayingBill, setActivePayingBill] = useState<MaintenanceBill | null>(null);
  const [activeReceiptBill, setActiveReceiptBill] = useState<MaintenanceBill | null>(null);
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

  if (!isLoaded) {
    return (
      <div className="min-h-screen bg-[#0A1120] flex items-center justify-center">
        <div className="flex flex-col items-center gap-3">
          <div className="w-10 h-10 rounded-2xl bg-[#111C2E] border border-[#22304A] text-[#F3F5F9] flex items-center justify-center font-bold text-lg animate-pulse shadow-sm">
            C
          </div>
          <span className="text-xs font-semibold uppercase tracking-wider text-[#8C97AD]">
            Loading CoHo Smart Portal...
          </span>
        </div>
      </div>
    );
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
    }
  };

  const pendingRequestsCount =
    state.documentRequests?.filter((r) => r.status === "pending").length || 0;
  const pendingComplaintsCount =
    state.complaints?.filter((c) => c.status === "pending").length || 0;
  const pendingBookingsCount =
    state.facilityBookings?.filter((b) => b.status === "pending").length || 0;

  return (
    <div className="min-h-screen bg-[#0A1120] text-[#F3F5F9] flex flex-col items-center">
      {/* Container - Native App width on desktop with smooth scaling */}
      <div className="w-full max-w-lg min-h-screen bg-[#0A1120] flex flex-col relative sm:border-x sm:border-[#22304A] sm:shadow-sm">
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
              onOpenAdminRequests={() => setIsAdminDocRequestsModalOpen(true)}
              onOpenAdminComplaints={() => setIsAdminComplaintsModalOpen(true)}
              onOpenAdminBookings={() => setIsAdminBookingsModalOpen(true)}
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

        {/* Payment Receipt Modal */}
        {activeReceiptBill && (
          <BillReceiptModal
            isOpen={Boolean(activeReceiptBill)}
            onClose={() => setActiveReceiptBill(null)}
            bill={activeReceiptBill}
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

        {/* Admin Document Requests Modal */}
        <AdminDocumentRequestsModal
          isOpen={isAdminDocRequestsModalOpen}
          onClose={() => setIsAdminDocRequestsModalOpen(false)}
          requests={state.documentRequests || []}
          onFulfillRequest={fulfillDocumentRequest}
        />

        {/* Admin Complaints Modal */}
        <AdminComplaintsModal
          isOpen={isAdminComplaintsModalOpen}
          onClose={() => setIsAdminComplaintsModalOpen(false)}
          complaints={state.complaints || []}
          onUpdateStatus={updateComplaintStatus}
        />

        {/* Admin Facility Bookings Modal */}
        <AdminFacilityBookingsModal
          isOpen={isAdminBookingsModalOpen}
          onClose={() => setIsAdminBookingsModalOpen(false)}
          bookings={state.facilityBookings || []}
          onUpdateStatus={updateFacilityBookingStatus}
        />

        {/* Dedicated iOS/Signal-Style Notification Center */}
        {isNotificationCenterOpen && (
          <div className="fixed inset-0 z-50 overflow-y-auto bg-[#0A1120]">
            <NotificationCenterView onBack={() => setIsNotificationCenterOpen(false)} />
          </div>
        )}
      </div>
    </div>
  );
}
