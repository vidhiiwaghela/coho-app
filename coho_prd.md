# Product Requirements Document
## Society / RWA Management App (working title: "Cookie") 
**Prepared for:** FSD & BPOI Academic Project
**Status:** Draft v1

---

## 1. Overview

A mobile/web application for a housing society (RWA) that gives every flat a unique login and centralizes the things residents and the managing committee currently handle through paper, WhatsApp groups, and physical visits to the office: maintenance payments, property documents, meeting minutes, society rules, and announcements.

**Problem statement:** Residents currently rely on fragmented channels — WhatsApp groups for announcements, physical files for agreements and rules, in-person visits for maintenance receipts, and word-of-mouth for rule changes. This causes lost information, language barriers in meeting minutes, and no searchable record of when/why a rule was introduced.

**Goal:** Build a single app where every flat can log in, pay dues, retrieve their documents, and search society rules — with a smaller set of "vision" features (AI summarization, translation, e-signing) documented as future direction, not required for the graded MVP.

---

## 2. Users & Personas

| Persona | Needs |
|---|---|
| **Resident/Flat Owner** | Pay maintenance, view bills, retrieve flat documents, read rules/notices |
| **Tenant** | Same as resident, minus ownership documents |
| **Managing Committee (Admin)** | Create flat logins, upload documents/rules, post announcements, manage meeting records |
| **Security/Watchman (optional, future)** | Visitor log (out of scope for MVP) |

---

## 3. MVP Scope (what to actually build for the grade)

### 3.1 Authentication
- Each flat has a unique login ID (e.g., building-wing-flatno) with an admin-assigned initial password.
- Resident can reset/change password after first login.
- Roles: Admin (managing committee) vs Resident.

### 3.2 Resident Profile & Dashboard
- Basic profile (name, flat number, contact, tenant/owner flag).
- Dashboard with navigation to: Maintenance, Documents, Rules, Notices, Meetings.

### 3.3 Maintenance & Payments
- View current maintenance bill (digital, itemized).
- Payment history log per flat.
- QR code (or payment link) to pay the current bill.
- Property tax as a separate yearly line item, with a reminder/email notification.

### 3.4 Document Vault (per flat)
- Admin uploads documents (agreement copy, NOC, share certificate, etc.) tagged to a flat.
- Resident can view/download their own flat's documents.
- **Explicitly scoped as storage & retrieval only** — not legally binding e-signing (see Section 6).

### 3.5 Society Rules Database
- Admin adds/edits rules, each with a category tag (e.g., "parking," "pets," "noise"), a timestamp, and the meeting/date it originated from.
- Resident can search rules by keyword; results show matching rules sorted by most recent first, each with its origin date.

### 3.6 Notices / Announcements
- Admin posts a notice (e.g., "water cut 2–4 PM today").
- Feed visible to all residents, newest first, with push/in-app notification.

### 3.7 Meeting Records
- Admin uploads meeting minutes (text or file) tied to a date.
- Residents can view past meeting minutes in a searchable archive.
- **AI-generated summary**: an LLM-based summary of the uploaded minutes, shown alongside the full text, clearly labeled as an AI-generated summary (not a substitute for the original record).
- **Multi-language translation**: residents can view the summary (and ideally the notice/minutes text) translated into a language of their choice, using a translation API.

### 3.8 Notices — Translation
- Notices (Section 3.6) also get the same translation option, so non-English-first residents can read announcements in their preferred language.

### 3.9 Festival Sponsorship / Donation Module
- Admin posts an upcoming festival/event with a funding goal or list of sponsorship slots.
- Resident can pledge/contribute an amount (simulated payment, same pattern as maintenance QR/payment flow) and see a running list of contributions/sponsors for that event.

---

## 4. Future Vision (document, but don't build for MVP)

Kept out of MVP scope because they depend on external legal/technical infrastructure your project can't own:

- **Legally binding e-signatures / registrar integration** — would require third-party integration (e.g., a DigiLocker-style or licensed e-sign API); not something the app can implement independently.
- **Real-time chat / WhatsApp-style messaging** — distinct engineering effort (sockets/push infra) from the rest of the CRUD app.
- **Visitor/security management** — gate entry logs, guard verification (this is the space where MyGate/NoBrokerHood are strongest, so low differentiation value for a student project).

---

## 5. Non-Functional Requirements
- **Security:** flat-level documents must only be visible to that flat's login and admins; passwords hashed, not stored in plaintext.
- **Usability:** navigation should be simple enough for non-technical/older residents.
- **Data integrity:** rule entries and meeting records should be append/versioned, not silently overwritten, so the "history of a rule" feature stays accurate.

---

## 6. Assumptions, Constraints & Risks
- **No real government/BMC integration.** Anything related to legal compliance is a *record*, not a regulatory action — this should be stated explicitly in any written report or demo to avoid implying the app has legal authority it doesn't.
- **AI features (summarization/translation) are best-effort**, not authoritative — should never be the sole source for a rule or financial figure.
- **Payment is likely simulated/sandboxed** (e.g., a mock QR/payment flow) rather than a live payment gateway, unless your course scope explicitly requires real integration.
- **Timeline risk:** the full "vision" list is broad for a two-course academic build; the MVP above is chosen to be demoable and gradeable within a typical semester timeline.

---

## 7. Competitive Context
Existing players (MyGate, NoBrokerHood, ADDA, ApnaComplex) already cover unique logins, billing/QR payments, complaints, and document storage — so those aren't differentiators on their own. Your differentiation for a project pitch is the **searchable, dated rules database** and the **document vault scoped honestly around what a society app can legally do**, rather than claiming full digital agreement execution.

---

## 8. Suggested Tech Stack (placeholder — adjust to your course's FSD stack)
- Frontend: React / React Native (or whatever your FSD course mandates)
- Backend: Node.js + Express, or your course's specified stack
- Database: PostgreSQL/MySQL for structured data (flats, bills, rules); object storage (S3-compatible or local) for document files
- Auth: JWT-based session with role-based access control
