"use client";

import { useEffect, useState } from "react";
import {
  FlatUser,
  MaintenanceBill,
  DocumentItem,
  SocietyRule,
  Notice,
  MeetingRecord,
  SponsorshipCampaign,
  ActiveTab,
  DocumentRequest,
  ComplaintTicket,
  FacilityBooking,
  UserRole,
  Notification,
} from "../types";
import {
  INITIAL_FLATS,
  INITIAL_BILLS,
  INITIAL_DOCUMENTS,
  INITIAL_DOCUMENT_REQUESTS,
  INITIAL_COMPLAINTS,
  INITIAL_FACILITY_BOOKINGS,
  INITIAL_RULES,
  INITIAL_NOTICES,
  INITIAL_MEETINGS,
  INITIAL_SPONSORSHIPS,
  INITIAL_NOTIFICATIONS,
  PROPERTY_TAX_CONFIG,
  INITIAL_PROPERTY_TAXES,
} from "./mockData";
import { DEFAULT_UNAVAILABLE_DOC_MESSAGE } from "./constants";
import { FlatPropertyTax } from "../types";
import { supabase, isSupabaseConfigured } from "./supabaseClient";

const STORAGE_KEY = "coho_rwa_app_state_v2";

interface AppState {
  isAuthenticated: boolean;
  currentFlatId: string;
  flats: FlatUser[];
  bills: MaintenanceBill[];
  documents: DocumentItem[];
  documentRequests: DocumentRequest[];
  complaints: ComplaintTicket[];
  facilityBookings: FacilityBooking[];
  rules: SocietyRule[];
  notices: Notice[];
  meetings: MeetingRecord[];
  sponsorships: SponsorshipCampaign[];
  notifications: Notification[];
  propertyTaxes: FlatPropertyTax[];
  activeTab: ActiveTab;
}

const defaultState: AppState = {
  isAuthenticated: false,
  currentFlatId: "flat-a101",
  flats: INITIAL_FLATS,
  bills: INITIAL_BILLS,
  documents: INITIAL_DOCUMENTS,
  documentRequests: INITIAL_DOCUMENT_REQUESTS,
  complaints: INITIAL_COMPLAINTS,
  facilityBookings: INITIAL_FACILITY_BOOKINGS,
  rules: INITIAL_RULES,
  notices: INITIAL_NOTICES,
  meetings: INITIAL_MEETINGS,
  sponsorships: INITIAL_SPONSORSHIPS,
  notifications: INITIAL_NOTIFICATIONS,
  propertyTaxes: INITIAL_PROPERTY_TAXES,
  activeTab: "home",
};

export function useCohoStore() {
  const [state, setState] = useState<AppState>(defaultState);
  const [isLoaded, setIsLoaded] = useState(false);

  // Initialize from Supabase if configured, otherwise localStorage
  useEffect(() => {
    async function loadData() {
      // Clear legacy storage key if present
      try {
        localStorage.removeItem("coho_rwa_app_state_v1");
      } catch (_) {}

      if (isSupabaseConfigured && supabase) {
        try {
          const [noticesRes, rulesRes, docsRes, meetingsRes, sponsorshipsRes, billsRes, flatsRes] = await Promise.all([
            supabase.from("notices").select("*").order("created_at", { ascending: false }),
            supabase.from("society_rules").select("*").order("created_at", { ascending: false }),
            supabase.from("documents").select("*").order("created_at", { ascending: false }),
            supabase.from("meetings").select("*").order("created_at", { ascending: false }),
            supabase.from("sponsorships").select("*").order("created_at", { ascending: false }),
            supabase.from("maintenance_bills").select("*").order("created_at", { ascending: false }),
            supabase.from("flats").select("*").order("created_at", { ascending: true }),
          ]);

          const loadedData: Partial<AppState> = {};

          if (flatsRes.data && flatsRes.data.length > 0) {
            loadedData.flats = flatsRes.data.map((f: any) => ({
              id: f.id,
              flatNumber: f.flat_number || f.flatNumber,
              wing: f.wing,
              buildingName: f.building_name || f.buildingName,
              residentName: f.resident_name || f.residentName,
              email: f.email,
              phone: f.phone,
              role: f.role,
              isOwner: f.is_owner !== undefined ? f.is_owner : f.isOwner,
              possessionDate: f.possession_date || f.possessionDate,
              parkingSlot: f.parking_slot || f.parkingSlot,
              pin: f.pin || "1234",
            }));
          }

          if (billsRes.data && billsRes.data.length > 0) {
            loadedData.bills = billsRes.data.map((b: any) => ({
              id: b.id,
              flatId: b.flat_id || b.flatId,
              flatNumber: b.flat_number || b.flatNumber,
              monthYear: b.month_year || b.monthYear,
              billingDate: b.billing_date || b.billingDate,
              dueDate: b.due_date || b.dueDate,
              items: b.items || [],
              totalAmount: b.total_amount !== undefined ? b.total_amount : b.totalAmount,
              status: b.status,
              paidAt: b.paid_at || b.paidAt,
              paymentRef: b.payment_ref || b.paymentRef,
              paymentMethod: b.payment_method || b.paymentMethod,
              isPropertyTaxIncluded: b.is_property_tax_included !== undefined ? b.is_property_tax_included : b.isPropertyTaxIncluded,
              propertyTaxAmount: b.property_tax_amount !== undefined ? b.property_tax_amount : b.propertyTaxAmount,
            }));
          }

          if (sponsorshipsRes.data && sponsorshipsRes.data.length > 0) {
            loadedData.sponsorships = sponsorshipsRes.data.map((s: any) => ({
              id: s.id,
              title: s.title,
              description: s.description,
              festivalDate: s.festival_date || s.festivalDate,
              targetAmount: s.target_amount !== undefined ? s.target_amount : s.targetAmount,
              collectedAmount: s.collected_amount !== undefined ? s.collected_amount : s.collectedAmount,
              bannerImage: s.banner_image || s.bannerImage,
              tiers: s.tiers || [],
              donations: s.donations || [],
            }));
          }

          if (docsRes.data && docsRes.data.length > 0) {
            loadedData.documents = docsRes.data.map((d: any) => ({
              id: d.id,
              flatId: d.flat_id || d.flatId,
              title: d.title,
              category: d.category,
              fileUrl: d.file_url || d.fileUrl,
              fileSize: d.file_size || d.fileSize,
              fileType: d.file_type || d.fileType,
              uploadedAt: d.uploaded_at || d.uploadedAt,
              uploadedBy: d.uploaded_by || d.uploadedBy,
              isSocietyWide: d.is_society_wide !== undefined ? d.is_society_wide : d.isSocietyWide,
            }));
          }

          if (rulesRes.data && rulesRes.data.length > 0) {
            loadedData.rules = rulesRes.data.map((r: any) => ({
              id: r.id,
              title: r.title,
              description: r.description,
              category: r.category,
              penaltyInfo: r.penalty_info || r.penaltyInfo,
              originMeeting: r.origin_meeting || r.originMeeting,
              effectiveDate: r.effective_date || r.effectiveDate,
              lastUpdated: r.last_updated || r.lastUpdated,
              version: r.version,
            }));
          }

          if (noticesRes.data && noticesRes.data.length > 0) {
            loadedData.notices = noticesRes.data as any;
          }

          if (meetingsRes.data && meetingsRes.data.length > 0) {
            loadedData.meetings = meetingsRes.data.map((m: any) => ({
              id: m.id,
              title: m.title,
              date: m.date,
              time: m.time,
              venue: m.venue,
              agenda: m.agenda || [],
              attendeeCount: m.attendee_count !== undefined ? m.attendee_count : m.attendeeCount,
              minutesContent: m.minutes_content || m.minutesContent,
              minutes_text: m.minutes_text || m.minutesText,
              summary_text: m.summary_text || m.summaryText,
              summary_status: m.summary_status || m.summaryStatus,
              aiSummary: m.ai_summary || m.aiSummary || {},
              attachments: m.attachments || [],
            }));
          }

          // Optional tables: document_requests & facility_bookings
          try {
            const [docReqsRes, facilityRes] = await Promise.all([
              supabase.from("document_requests").select("*").order("created_at", { ascending: false }),
              supabase.from("facility_bookings").select("*").order("created_at", { ascending: false }),
            ]);
            if (docReqsRes.data && docReqsRes.data.length > 0) {
              loadedData.documentRequests = docReqsRes.data.map((r: any) => ({
                id: r.id,
                flatId: r.flat_id || r.flatId,
                flatNumber: r.flat_number || r.flatNumber,
                residentName: r.resident_name || r.residentName,
                deliveryEmail: r.delivery_email || r.deliveryEmail,
                documentType: r.document_type || r.documentType,
                documentName: r.document_name || r.documentName,
                copyType: r.copy_type || r.copyType,
                status: r.status === "not_available" ? "unavailable" : r.status,
                requestedAt: r.requested_at || r.requestedAt,
                fulfilledAt: r.fulfilled_at || r.fulfilledAt,
                fulfilledFileName: r.fulfilled_file_name || r.fulfilledFileName,
                note: r.note,
                notAvailableReason: r.not_available_reason || r.notAvailableReason,
              }));
            }
            if (facilityRes.data && facilityRes.data.length > 0) {
              loadedData.facilityBookings = facilityRes.data.map((b: any) => ({
                id: b.id,
                flatId: b.flat_id || b.flatId,
                flatNumber: b.flat_number || b.flatNumber,
                residentName: b.resident_name || b.residentName,
                facility: b.facility,
                date: b.date,
                timeSlot: b.time_slot || b.timeSlot,
                purpose: b.purpose,
                status: b.status,
                createdAt: b.created_at || b.createdAt,
                approvedAt: b.approved_at || b.approvedAt,
                adminNotes: b.admin_notes || b.adminNotes,
              }));
            }
          } catch (_) {}

          if (Object.keys(loadedData).length > 0) {
            setState((prev) => ({ ...prev, ...loadedData }));
          }
        } catch (err) {
          console.warn("Supabase fetch failed, using local/cached state", err);
        }
      }

      try {
        const saved = localStorage.getItem(STORAGE_KEY);
        if (saved) {
          const parsed = JSON.parse(saved);
          if (parsed.notices && Array.isArray(parsed.notices)) {
            parsed.notices = parsed.notices.map((n: Notice) => {
              const init = INITIAL_NOTICES.find((i) => i.id === n.id);
              return {
                ...init,
                ...n,
                translations: {
                  ...(n.translations || {}),
                  ...(init?.translations || {}),
                },
                body: n.body || n.content || init?.body || init?.content,
                content: n.content || n.body || init?.content || init?.body,
              };
            });
          }

          // Strictly synchronize flats to the 5 resident flats + admin from INITIAL_FLATS
          parsed.flats = INITIAL_FLATS.map((init) => {
            const existing = Array.isArray(parsed.flats)
              ? parsed.flats.find((f: FlatUser) => f.id === init.id)
              : null;
            return existing
              ? {
                  ...init,
                  role: existing.role || init.role,
                  isOwner: existing.isOwner !== undefined ? existing.isOwner : init.isOwner,
                }
              : init;
          });

          // Ensure document requests map not_available to unavailable
          if (parsed.documentRequests && Array.isArray(parsed.documentRequests)) {
            parsed.documentRequests = parsed.documentRequests.map((r: DocumentRequest) => ({
              ...r,
              status: r.status === "not_available" ? "unavailable" : r.status,
              notAvailableReason: (r.status === "unavailable" || (r as any).status === "not_available") && !r.notAvailableReason
                ? DEFAULT_UNAVAILABLE_DOC_MESSAGE
                : r.notAvailableReason,
            }));
          }

          // If stale Ganesh campaign exists, reset sponsorships to INITIAL_SPONSORSHIPS
          if (
            !parsed.sponsorships ||
            !Array.isArray(parsed.sponsorships) ||
            parsed.sponsorships.some((c: any) => c.id === "camp-ganesh-2026")
          ) {
            parsed.sponsorships = INITIAL_SPONSORSHIPS;
          }

          // Ensure property taxes exist for all 5 flats
          if (!parsed.propertyTaxes || !Array.isArray(parsed.propertyTaxes) || parsed.propertyTaxes.length < 5) {
            parsed.propertyTaxes = INITIAL_PROPERTY_TAXES;
          }

          // Ensure currentFlatId points to a valid flat
          if (!INITIAL_FLATS.some((f) => f.id === parsed.currentFlatId)) {
            parsed.currentFlatId = "flat-a101";
          }
          parsed.notifications = parsed.notifications || [];
          setState((prev) => ({ ...prev, ...parsed }));
        }
      } catch (e) {
        console.error("Failed to load state from localStorage", e);
      } finally {
        setIsLoaded(true);
      }
    }

    loadData();
  }, []);

  // Save changes to localStorage and optionally to Supabase
  const updateState = (updater: (prev: AppState) => AppState) => {
    setState((prev) => {
      const next = updater(prev);
      try {
        localStorage.setItem(STORAGE_KEY, JSON.stringify(next));
      } catch (e) {
        console.error("Failed to save state to localStorage", e);
      }
      return next;
    });
  };

  const currentUser =
    state.flats.find((f) => f.id === state.currentFlatId) || state.flats[0];

  const switchFlat = (flatId: string) => {
    updateState((prev) => ({ ...prev, currentFlatId: flatId }));
  };

  const login = (flatId: string, role?: UserRole) => {
    updateState((prev) => {
      let flats = prev.flats;
      if (role && flatId !== "flat-admin") {
        flats = flats.map((f) =>
          f.id === flatId
            ? { ...f, role, isOwner: role === "resident" }
            : f
        );
      }
      return {
        ...prev,
        isAuthenticated: true,
        currentFlatId: flatId,
        flats,
        activeTab: role === "tenant" ? "rules" : "home",
      };
    });
  };

  const logout = () => {
    updateState((prev) => ({
      ...prev,
      isAuthenticated: false,
      activeTab: "home",
    }));
  };

  const requestDocument = (req: Omit<DocumentRequest, "id" | "requestedAt" | "status">) => {
    const now = new Date();
    const formatted =
      now.toLocaleDateString("en-IN", { day: "2-digit", month: "short", year: "numeric" }) +
      ", " +
      now.toLocaleTimeString("en-IN", { hour: "2-digit", minute: "2-digit" });

    const newReq: DocumentRequest = {
      ...req,
      id: `req-${Date.now()}`,
      status: "pending",
      requestedAt: formatted,
    };

    updateState((prev) => ({
      ...prev,
      documentRequests: [newReq, ...(prev.documentRequests || [])],
    }));

    if (isSupabaseConfigured && supabase) {
      (async () => {
        try {
          await supabase.from("document_requests").insert([
            {
              id: newReq.id,
              flat_id: newReq.flatId,
              flat_number: newReq.flatNumber,
              resident_name: newReq.residentName,
              delivery_email: newReq.deliveryEmail,
              document_type: newReq.documentType,
              document_name: newReq.documentName,
              copy_type: newReq.copyType,
              status: newReq.status,
              requested_at: newReq.requestedAt,
              note: newReq.note || null,
            },
          ]);
        } catch (e) {
          console.warn("Supabase document_requests insert error:", e);
        }
      })();
    }
  };

  const fulfillDocumentRequest = (requestId: string, fileName?: string) => {
    const now = new Date();
    const formatted =
      now.toLocaleDateString("en-IN", { day: "2-digit", month: "short", year: "numeric" }) +
      ", " +
      now.toLocaleTimeString("en-IN", { hour: "2-digit", minute: "2-digit" });

    updateState((prev) => ({
      ...prev,
      documentRequests: (prev.documentRequests || []).map((r) =>
        r.id === requestId
          ? {
              ...r,
              status: "fulfilled",
              fulfilledAt: formatted,
              fulfilledFileName: fileName || r.fulfilledFileName,
            }
          : r
      ),
    }));

    if (isSupabaseConfigured && supabase) {
      (async () => {
        try {
          await supabase
            .from("document_requests")
            .update({
              status: "fulfilled",
              fulfilled_at: formatted,
              fulfilled_file_name: fileName || null,
            })
            .eq("id", requestId);
        } catch (e) {
          console.warn("Supabase document_requests update error:", e);
        }
      })();
    }
  };

  const markDocumentNotAvailable = (requestId: string, reason?: string) => {
    const finalReason = reason?.trim() || DEFAULT_UNAVAILABLE_DOC_MESSAGE;
    updateState((prev) => ({
      ...prev,
      documentRequests: (prev.documentRequests || []).map((r) =>
        r.id === requestId
          ? {
              ...r,
              status: "unavailable",
              notAvailableReason: finalReason,
            }
          : r
      ),
    }));

    if (isSupabaseConfigured && supabase) {
      (async () => {
        try {
          await supabase
            .from("document_requests")
            .update({
              status: "unavailable",
              not_available_reason: finalReason,
            })
            .eq("id", requestId);
        } catch (e) {
          console.warn("Supabase document_requests update error:", e);
        }
      })();
    }
  };

  const lodgeComplaint = (complaint: Omit<ComplaintTicket, "id" | "createdAt" | "status">) => {
    const now = new Date();
    const formatted =
      now.toLocaleDateString("en-IN", { day: "2-digit", month: "short", year: "numeric" }) +
      ", " +
      now.toLocaleTimeString("en-IN", { hour: "2-digit", minute: "2-digit" });

    const newTicket: ComplaintTicket = {
      ...complaint,
      id: `comp-${Date.now()}`,
      status: "pending",
      createdAt: formatted,
    };

    updateState((prev) => ({
      ...prev,
      complaints: [newTicket, ...(prev.complaints || [])],
    }));
  };

  const updateComplaintStatus = (
    ticketId: string,
    status: "pending" | "in_progress" | "resolved",
    adminResponse?: string
  ) => {
    const now = new Date();
    const formatted =
      now.toLocaleDateString("en-IN", { day: "2-digit", month: "short", year: "numeric" }) +
      ", " +
      now.toLocaleTimeString("en-IN", { hour: "2-digit", minute: "2-digit" });

    updateState((prev) => ({
      ...prev,
      complaints: (prev.complaints || []).map((c) =>
        c.id === ticketId
          ? {
              ...c,
              status,
              updatedAt: formatted,
              ...(adminResponse ? { adminResponse } : {}),
            }
          : c
      ),
    }));
  };

  const bookFacility = (
    bookingData: Omit<FacilityBooking, "id" | "status" | "createdAt">
  ) => {
    const now = new Date();
    const formatted =
      now.toLocaleDateString("en-IN", { day: "2-digit", month: "short", year: "numeric" }) +
      ", " +
      now.toLocaleTimeString("en-IN", { hour: "2-digit", minute: "2-digit" });

    const newBooking: FacilityBooking = {
      ...bookingData,
      id: `book-${Date.now()}`,
      status: "pending",
      createdAt: formatted,
    };

    updateState((prev) => ({
      ...prev,
      facilityBookings: [newBooking, ...(prev.facilityBookings || [])],
    }));

    if (isSupabaseConfigured && supabase) {
      (async () => {
        try {
          await supabase.from("facility_bookings").insert([
            {
              id: newBooking.id,
              flat_id: newBooking.flatId,
              flat_number: newBooking.flatNumber,
              resident_name: newBooking.residentName,
              facility: newBooking.facility,
              date: newBooking.date,
              time_slot: newBooking.timeSlot,
              purpose: newBooking.purpose,
              status: newBooking.status,
              created_at: newBooking.createdAt,
            },
          ]);
        } catch (e) {
          console.warn("Supabase facility_bookings insert error:", e);
        }
      })();
    }
  };

  const updateFacilityBookingStatus = (
    bookingId: string,
    status: "approved" | "rejected",
    adminNotes?: string
  ) => {
    const now = new Date();
    const formatted =
      now.toLocaleDateString("en-IN", { day: "2-digit", month: "short", year: "numeric" }) +
      ", " +
      now.toLocaleTimeString("en-IN", { hour: "2-digit", minute: "2-digit" });

    updateState((prev) => ({
      ...prev,
      facilityBookings: (prev.facilityBookings || []).map((b) =>
        b.id === bookingId
          ? {
              ...b,
              status,
              approvedAt: formatted,
              ...(adminNotes ? { adminNotes } : {}),
            }
          : b
      ),
    }));

    if (isSupabaseConfigured && supabase) {
      (async () => {
        try {
          await supabase
            .from("facility_bookings")
            .update({
              status,
              approved_at: formatted,
              ...(adminNotes ? { admin_notes: adminNotes } : {}),
            })
            .eq("id", bookingId);
        } catch (e) {
          console.warn("Supabase facility_bookings update error:", e);
        }
      })();
    }
  };

  const sendPaymentReminder = (flatNumber: string, amount: number, month: string) => {
    const now = new Date();
    const formatted =
      now.toLocaleDateString("en-IN", { day: "2-digit", month: "short", year: "numeric" }) +
      ", " +
      now.toLocaleTimeString("en-IN", { hour: "2-digit", minute: "2-digit" });

    const newNotification: Notification = {
      id: `notif-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`,
      flatNumber,
      title: "Payment Reminder from Society Office",
      message: `Your maintenance dues of ₹${amount.toLocaleString("en-IN")} for ${month} are pending. Please clear them by the due date.`,
      type: "due_reminder",
      amount,
      month,
      createdAt: formatted,
      read: false,
    };

    updateState((prev) => ({
      ...prev,
      notifications: [newNotification, ...(prev.notifications || [])],
    }));
  };

  const markNotificationAsRead = (notificationId: string) => {
    updateState((prev) => ({
      ...prev,
      notifications: (prev.notifications || []).map((n) =>
        n.id === notificationId ? { ...n, read: true } : n
      ),
    }));
  };

  const setActiveTab = (tab: ActiveTab) => {
    updateState((prev) => ({ ...prev, activeTab: tab }));
  };

  const payBill = (
    billId: string,
    paymentMethod: "Razorpay" | "UPI" | "NetBanking" | "Card" = "Razorpay",
    customRef?: string
  ) => {
    const now = new Date();
    const formattedDate =
      now.toLocaleDateString("en-IN", {
        day: "2-digit",
        month: "short",
        year: "numeric",
      }) +
      ", " +
      now.toLocaleTimeString("en-IN", { hour: "2-digit", minute: "2-digit" });

    const refNo =
      customRef ||
      `RZP_${now.getFullYear()}${String(now.getMonth() + 1).padStart(2, "0")}${Math.floor(
        100000 + Math.random() * 900000
      )}`;

    updateState((prev) => ({
      ...prev,
      bills: prev.bills.map((b) =>
        b.id === billId
          ? {
              ...b,
              status: "paid",
              paidAt: formattedDate,
              paymentRef: refNo,
              paymentMethod,
            }
          : b
      ),
    }));

    if (isSupabaseConfigured && supabase) {
      (async () => {
        try {
          await supabase
            .from("maintenance_bills")
            .update({
              status: "paid",
              paid_at: formattedDate,
              payment_ref: refNo,
              payment_method: paymentMethod,
            })
            .eq("id", billId);
        } catch (e) {
          console.warn("Supabase bill update error:", e);
        }
      })();
    }
  };

  const addDocument = (doc: Omit<DocumentItem, "id" | "uploadedAt">) => {
    const newDoc: DocumentItem = {
      ...doc,
      id: `doc-${Date.now()}`,
      uploadedAt: new Date().toLocaleDateString("en-IN", {
        day: "2-digit",
        month: "short",
        year: "numeric",
      }),
    };
    updateState((prev) => ({ ...prev, documents: [newDoc, ...prev.documents] }));

    if (isSupabaseConfigured && supabase) {
      (async () => {
        try {
          await supabase.from("documents").insert([
            {
              id: newDoc.id,
              flat_id: newDoc.flatId || null,
              title: newDoc.title,
              category: newDoc.category,
              file_url: newDoc.fileUrl,
              file_size: newDoc.fileSize,
              file_type: newDoc.fileType,
              uploaded_at: newDoc.uploadedAt,
              uploaded_by: newDoc.uploadedBy,
              is_society_wide: newDoc.isSocietyWide || false,
            },
          ]);
        } catch (e) {
          console.warn("Supabase document insert error:", e);
        }
      })();
    }
  };

  const deleteDocument = (docId: string) => {
    updateState((prev) => ({
      ...prev,
      documents: prev.documents.filter((d) => d.id !== docId),
    }));

    if (isSupabaseConfigured && supabase) {
      (async () => {
        try {
          await supabase.from("documents").delete().eq("id", docId);
        } catch (e) {
          console.warn("Supabase document delete error:", e);
        }
      })();
    }
  };

  const addRule = (rule: Omit<SocietyRule, "id" | "lastUpdated" | "version">) => {
    const today = new Date().toLocaleDateString("en-IN", {
      day: "2-digit",
      month: "short",
      year: "numeric",
    });
    const newRule: SocietyRule = {
      ...rule,
      id: `rule-${Date.now()}`,
      lastUpdated: today,
      version: 1,
    };
    updateState((prev) => ({ ...prev, rules: [newRule, ...prev.rules] }));

    if (isSupabaseConfigured && supabase) {
      (async () => {
        try {
          await supabase.from("society_rules").insert([
            {
              id: newRule.id,
              title: newRule.title,
              description: newRule.description,
              category: newRule.category,
              penalty_info: newRule.penaltyInfo || null,
              origin_meeting: newRule.originMeeting,
              effective_date: newRule.effectiveDate,
              last_updated: newRule.lastUpdated,
              version: newRule.version,
            },
          ]);
        } catch (e) {
          console.warn("Supabase rule insert error:", e);
        }
      })();
    }
  };

  const addNotice = (notice: Omit<Notice, "id" | "postedAt">) => {
    const now = new Date();
    const formatted =
      now.toLocaleDateString("en-IN", {
        day: "2-digit",
        month: "short",
        year: "numeric",
      }) +
      ", " +
      now.toLocaleTimeString("en-IN", { hour: "2-digit", minute: "2-digit" });

    const newNotice: Notice = {
      ...notice,
      id: `notice-${Date.now()}`,
      postedAt: formatted,
    };
    updateState((prev) => ({ ...prev, notices: [newNotice, ...prev.notices] }));

    if (isSupabaseConfigured && supabase) {
      (async () => {
        try {
          await supabase.from("notices").insert([
            {
              id: newNotice.id,
              title: newNotice.title,
              content: newNotice.content,
              category: newNotice.category,
              posted_at: newNotice.postedAt,
              posted_by: newNotice.postedBy,
              is_pinned: newNotice.isPinned || false,
              valid_till: newNotice.validTill || null,
              translations: newNotice.translations || {},
            },
          ]);
        } catch (e) {
          console.warn("Supabase notice insert error:", e);
        }
      })();
    }
  };

  const updateMeetingSummary = (
    meetingId: string,
    summaryText: string,
    status: "pending" | "done" | "failed"
  ) => {
    updateState((prev) => ({
      ...prev,
      meetings: prev.meetings.map((m) =>
        m.id === meetingId
          ? {
              ...m,
              summary_text: summaryText,
              summary_status: status,
              aiSummary: {
                ...m.aiSummary,
                overview: summaryText || m.aiSummary.overview,
              },
            }
          : m
      ),
    }));

    if (isSupabaseConfigured && supabase) {
      (async () => {
        try {
          await supabase
            .from("meetings")
            .update({
              summary_text: summaryText,
              summary_status: status,
            })
            .eq("id", meetingId);
        } catch (e) {
          console.warn("Supabase meeting summary update error:", e);
        }
      })();
    }
  };

  const summarizeMeeting = async (meetingId: string) => {
    const meeting = state.meetings.find((m) => m.id === meetingId);
    if (!meeting) return;

    updateMeetingSummary(meetingId, "", "pending");

    try {
      const res = await fetch("/api/meetings/summarize", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          id: meeting.id,
          minutes_text: meeting.minutes_text || meeting.minutesContent,
          title: meeting.title,
        }),
      });
      const data = await res.json();
      if (data.summary_text && data.summary_status === "done") {
        updateMeetingSummary(meetingId, data.summary_text, "done");
      } else {
        updateMeetingSummary(
          meetingId,
          data.error || "Summarization failed. Please check Groq API configuration.",
          "failed"
        );
      }
    } catch (err: any) {
      console.warn("Failed to summarize meeting:", err);
      updateMeetingSummary(meetingId, err?.message || "Summarization request failed", "failed");
    }
  };

  const addMeeting = (meeting: Omit<MeetingRecord, "id">) => {
    const newId = `meeting-${Date.now()}`;
    const minutesText = meeting.minutes_text || meeting.minutesContent;
    const meetingDate = meeting.meeting_date || meeting.date;

    const newMeeting: MeetingRecord = {
      ...meeting,
      id: newId,
      minutes_text: minutesText,
      meeting_date: meetingDate,
      summary_status: meeting.summary_status || "pending",
      summary_text: meeting.summary_text || null,
    };
    updateState((prev) => ({ ...prev, meetings: [newMeeting, ...prev.meetings] }));

    if (isSupabaseConfigured && supabase) {
      (async () => {
        try {
          await supabase.from("meetings").insert([
            {
              id: newMeeting.id,
              title: newMeeting.title,
              date: newMeeting.date,
              meeting_date: newMeeting.meeting_date,
              time: newMeeting.time,
              venue: newMeeting.venue,
              agenda: newMeeting.agenda || [],
              attendee_count: newMeeting.attendeeCount || 0,
              minutes_content: newMeeting.minutesContent,
              minutes_text: newMeeting.minutes_text,
              summary_text: newMeeting.summary_text,
              summary_status: newMeeting.summary_status,
              ai_summary: newMeeting.aiSummary || {},
              attachments: newMeeting.attachments || [],
            },
          ]);
        } catch (e) {
          console.warn("Supabase meeting insert error:", e);
        }
      })();
    }

    // Fire-and-forget call to /api/meetings/summarize via Groq API (Requirement 3)
    fetch("/api/meetings/summarize", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        id: newMeeting.id,
        minutes_text: minutesText,
        title: newMeeting.title,
      }),
    })
      .then((res) => res.json())
      .then((data) => {
        if (data.summary_text && data.summary_status === "done") {
          updateMeetingSummary(newMeeting.id, data.summary_text, "done");
        } else if (data.summary_status === "failed") {
          updateMeetingSummary(
            newMeeting.id,
            data.error || "AI summary generation failed.",
            "failed"
          );
        }
      })
      .catch((err) => {
        console.warn("Async Groq summarization error:", err);
        updateMeetingSummary(
          newMeeting.id,
          "Failed to connect to summarization service. Click retry below.",
          "failed"
        );
      });
  };

  const donateToCampaign = (
    campaignId: string,
    donation: {
      donorName: string;
      flatNumber: string;
      amount: number;
      tierName?: string;
      paymentRef?: string;
      paymentMethod?: string;
    }
  ) => {
    const now = new Date().toLocaleDateString("en-IN", {
      day: "2-digit",
      month: "short",
      year: "numeric",
    });
    const newDonation = {
      ...donation,
      id: donation.paymentRef ? `don-${donation.paymentRef}` : `don-${Date.now()}`,
      donatedAt: now,
      paymentMethod: donation.paymentMethod || "Razorpay",
      paymentRef: donation.paymentRef || `RZP_DON_${Date.now()}`,
    };

    let updatedCampaign: SponsorshipCampaign | undefined;

    updateState((prev) => {
      const updatedCampaigns = prev.sponsorships.map((camp) => {
        if (camp.id !== campaignId) return camp;
        const updated = {
          ...camp,
          collectedAmount: camp.collectedAmount + donation.amount,
          tiers: camp.tiers.map((t) =>
            t.name === donation.tierName
              ? { ...t, slotsFilled: Math.min(t.slotsAvailable, t.slotsFilled + 1) }
              : t
          ),
          donations: [newDonation, ...camp.donations],
        };
        updatedCampaign = updated;
        return updated;
      });
      return { ...prev, sponsorships: updatedCampaigns };
    });

    if (isSupabaseConfigured && supabase && updatedCampaign) {
      (async () => {
        try {
          await supabase
            .from("sponsorships")
            .update({
              collected_amount: updatedCampaign?.collectedAmount,
              tiers: updatedCampaign?.tiers,
              donations: updatedCampaign?.donations,
            })
            .eq("id", campaignId);
        } catch (e) {
          console.warn("Supabase sponsorship update error:", e);
        }
      })();
    }
  };

  const addCampaign = (campaign: Omit<SponsorshipCampaign, "id" | "collectedAmount" | "donations"> & { id?: string }) => {
    const newCamp: SponsorshipCampaign = {
      ...campaign,
      id: campaign.id || `camp-${Date.now()}`,
      collectedAmount: 0,
      donations: [],
    };

    updateState((prev) => ({
      ...prev,
      sponsorships: [newCamp, ...prev.sponsorships],
    }));

    if (isSupabaseConfigured && supabase) {
      (async () => {
        try {
          await supabase.from("sponsorships").insert([
            {
              id: newCamp.id,
              title: newCamp.title,
              description: newCamp.description,
              festival_date: newCamp.festivalDate,
              target_amount: newCamp.targetAmount,
              collected_amount: 0,
              tiers: newCamp.tiers,
              donations: [],
            },
          ]);
        } catch (e) {
          console.warn("Supabase sponsorship insert error:", e);
        }
      })();
    }
    return newCamp;
  };

  const resetToDefault = () => {
    try {
      localStorage.removeItem(STORAGE_KEY);
      localStorage.removeItem("coho_rwa_app_state_v1");
    } catch (_) {}
    setState(defaultState);
  };

  const updatePropertyTax = (
    flatId: string,
    updates: Partial<FlatPropertyTax>
  ) => {
    updateState((prev) => {
      const currentList = prev.propertyTaxes && prev.propertyTaxes.length > 0
        ? prev.propertyTaxes
        : INITIAL_PROPERTY_TAXES;

      const updatedTaxes = currentList.map((item) => {
        if (item.flatId !== flatId && item.flatNumber !== flatId) return item;

        let newAnnualAmount = item.annualTaxAmount;
        if (updates.propertyType && updates.propertyType !== item.propertyType) {
          newAnnualAmount =
            PROPERTY_TAX_CONFIG[updates.propertyType]?.annualAmount ||
            item.annualTaxAmount;
        } else if (updates.annualTaxAmount !== undefined) {
          newAnnualAmount = updates.annualTaxAmount;
        }

        const newStatus =
          updates.status !== undefined ? updates.status : item.status;
        const now = new Date().toLocaleDateString("en-IN", {
          day: "2-digit",
          month: "short",
          year: "numeric",
        });

        return {
          ...item,
          ...updates,
          annualTaxAmount: newAnnualAmount,
          status: newStatus,
          lastPaidDate:
            newStatus === "paid"
              ? updates.lastPaidDate || item.lastPaidDate || now
              : undefined,
          paymentRef:
            newStatus === "paid"
              ? updates.paymentRef ||
                item.paymentRef ||
                `MUM/TAX/2026/${Math.floor(100000 + Math.random() * 900000)}`
              : undefined,
        };
      });

      return { ...prev, propertyTaxes: updatedTaxes };
    });
  };

  return {
    state,
    currentUser,
    isLoaded,
    switchFlat,
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
  };
}
