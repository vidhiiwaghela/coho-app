export type UserRole = "resident" | "tenant" | "admin";

export interface FlatUser {
  id: string;
  flatNumber: string; // e.g., "B-402"
  wing: string; // e.g., "B"
  buildingName: string; // e.g., "Emerald Heights"
  residentName: string;
  email: string;
  phone: string;
  role: UserRole;
  isOwner: boolean;
  avatarUrl?: string;
  possessionDate: string;
  parkingSlot: string;
  pin?: string;
}

export interface BillItem {
  id: string;
  name: string;
  amount: number;
  category: "maintenance" | "sinking_fund" | "water" | "parking" | "property_tax" | "repair_levy";
}

export interface MaintenanceBill {
  id: string;
  flatId: string;
  flatNumber: string;
  monthYear: string; // e.g. "October 2026"
  billingDate: string;
  dueDate: string;
  items: BillItem[];
  totalAmount: number;
  status: "paid" | "pending" | "overdue";
  paidAt?: string;
  paymentRef?: string;
  paymentMethod?: "Razorpay" | "UPI" | "NetBanking" | "Card" | "Cheque";
  isPropertyTaxIncluded: boolean;
  propertyTaxAmount?: number;
}

export type PropertyType = "1_bhk" | "2_bhk" | "3_bhk" | "penthouse";

export interface FlatPropertyTax {
  flatId: string;
  flatNumber: string;
  residentName: string;
  propertyType: PropertyType;
  annualTaxAmount: number;
  sacNumber: string;
  status: "paid" | "not_paid";
  lastPaidDate?: string;
  paymentRef?: string;
  paymentMethod?: string;
}

export interface DocumentItem {
  id: string;
  flatId?: string; // specific flat or empty/all for society-wide
  title: string;
  category: "ownership" | "agreement" | "noc" | "share_certificate" | "bylaws" | "insurance";
  fileUrl: string;
  fileSize: string;
  fileType: "pdf" | "doc" | "image";
  uploadedAt: string;
  uploadedBy: string;
  isSocietyWide?: boolean;
}

export interface DocumentRequest {
  id: string;
  flatId: string;
  flatNumber: string;
  residentName: string;
  deliveryEmail: string;
  documentType: "noc_sale_rent" | "share_certificate" | "renovation_permission" | "other";
  documentName: string;
  copyType: "digital" | "physical";
  status: "pending" | "fulfilled" | "unavailable" | "not_available";
  requestedAt: string;
  fulfilledAt?: string;
  fulfilledFileName?: string;
  note?: string;
  notAvailableReason?: string;
}

export interface ComplaintTicket {
  id: string;
  flatId: string;
  flatNumber: string;
  residentName: string;
  category: "water_supply" | "lift_electrical" | "noise_disturbance" | "cleanliness" | "other";
  categoryLabel: string;
  description: string;
  status: "pending" | "in_progress" | "resolved";
  createdAt: string;
  updatedAt?: string;
  adminResponse?: string;
}

export interface FacilityBooking {
  id: string;
  flatId: string;
  flatNumber: string;
  residentName: string;
  facility: "Clubhouse" | "Society Ground" | "Party Hall";
  date: string;
  timeSlot: "Morning (09:00 AM - 01:00 PM)" | "Evening (04:00 PM - 09:00 PM)" | "Full Day (09:00 AM - 10:00 PM)";
  purpose: string;
  status: "pending" | "approved" | "rejected";
  createdAt: string;
  approvedAt?: string;
  adminNotes?: string;
}

export interface Notification {
  id: string;
  flatNumber: string;
  title: string;
  message: string;
  type: "due_reminder" | "general";
  amount?: number;
  month?: string;
  createdAt: string;
  read: boolean;
}

export interface SocietyRule {
  id: string;
  title: string;
  description: string;
  category: "parking" | "pets" | "noise" | "renovation" | "clubhouse" | "waste_management" | "general";
  penaltyInfo?: string;
  originMeeting: string; // e.g. "AGM 2024 (14 Aug 2024)"
  effectiveDate: string;
  lastUpdated: string;
  version: number;
}

export interface Notice {
  id: string;
  title: string;
  content: string;
  body?: string;
  description?: string;
  category: "urgent" | "maintenance" | "event" | "general";
  postedAt: string;
  postedBy: string;
  isPinned: boolean;
  validTill?: string;
  translations?: Record<string, { title: string; content?: string; body?: string }>;
}

export interface MeetingRecord {
  id: string;
  title: string; // e.g., "52nd Annual General Meeting (AGM)"
  date: string;
  time: string;
  venue: string;
  agenda: string[];
  attendeeCount: number;
  minutesContent: string;
  minutes_text?: string;
  meeting_date?: string;
  summary_text?: string | null;
  summary_status?: "pending" | "done" | "failed";
  created_at?: string;
  aiSummary: {
    overview: string;
    keyDecisions: string[];
    actionItems: { task: string; assignee: string; deadline: string }[];
  };
  attachments?: { name: string; size: string; url: string }[];
  translations?: Record<string, { overview: string; keyDecisions: string[] }>;
}

export interface SponsorshipCampaign {
  id: string;
  title: string; // e.g., "Ganesh Utsav & Cultural Fest 2026"
  description: string;
  festivalDate: string;
  targetAmount: number;
  collectedAmount: number;
  bannerImage?: string;
  tiers: {
    name: string;
    amount: number;
    perks: string;
    slotsAvailable: number;
    slotsFilled: number;
  }[];
  donations: {
    id: string;
    donorName: string;
    flatNumber: string;
    amount: number;
    tierName?: string;
    donatedAt: string;
    paymentRef?: string;
    paymentMethod?: string;
  }[];
}

export type ActiveTab = "home" | "payments" | "rules" | "documents" | "meetings" | "notices" | "festival";
