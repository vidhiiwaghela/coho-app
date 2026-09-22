# CoHo (Cookie) - Residential Housing Society (RWA) Portal

A modern, mobile-first web application for housing societies (RWA/CHS) built following **coho_prd.md**, **coho_design.md**, and **coho_techstack.md**.

---

## 🎨 Visual Design System

Implements a unified navy + warm-gold dark fintech/community hybrid visual language:
- **Base Surface (`bgBase`):** `#0E1420` (deep navy)
- **Primary Cards (`surfaceDark`):** `#161F30`
- **Secondary Surfaces (`surfaceDark2`):** `#1C2740`
- **Spotlight Accent (`accentLime`):** `#E8B565` (warm gold, used strictly for primary actions: Pay button, active tab, dues badge)
- **Typography:** Manrope (headings/emphasis) + Inter (body/UI).
- **Shapes:** Full pill radiuses (`rounded-pill`), 24–28px card corners, floating dark navigation bar.
- **Numbers:** Large bold typography (₹ amounts) as visual anchors.

---

## 🚀 Features Implemented

1. **Authentication & Persona Switcher:**
   - Multi-persona simulation: Flat B-402 (Rajesh Shetty, Owner), Flat A-101 (Priya Sharma), Flat C-303 (Vikram Malhotra, Tenant), and Managing Committee Admin.
   - Resident vs Admin role enforcement.

2. **Resident Dashboard (Home):**
   - Dark Hero Card showing dues & billing cycle
   - Stat Chip Pairs (Dues Status + Rules Count)
   - Quick Action Grid (Pay, Vault, Rules, Meetings)
   - Emergency contacts & Urgent Notice Broadcast ticker

3. **Maintenance & Payments (PRD Sec 3.3):**
   - Itemized digital bill (Maintenance fee, sinking fund, water, parking)
   - Municipal property tax annual line item
   - Dynamic UPI QR Code modal (`qrcode.react`) with instant payment simulation & confetti
   - Official printable/downloadable digital receipts with unique transaction reference

4. **Document Vault (PRD Sec 3.4):**
   - Flat-scoped documents (Sale Deed, Share Certificate, Loan NOC, EV Charger NOC)
   - Master society bylaws & Fire Safety Audit records
   - Secure document preview modal & download simulation

5. **Society Rules Database (PRD Sec 3.5):**
   - Instant full-text search across bylaws
   - Category filtering (Parking, Renovation, Pets, Noise, Waste Segregation, Clubhouse)
   - Dated AGM resolution footprints & violation fine badges

6. **Notices & Circulars (PRD Sec 3.6 & 3.8):**
   - Urgent broadcast alerts & pinned announcements
   - **Multi-language translation** (English, Hindi, Marathi, Gujarati)

7. **Meeting Records & Minutes (PRD Sec 3.7):**
   - Searchable AGM / EGM minutes archive
   - **AI-Generated Executive Summary** (Overview, Key Resolutions, Action Items with deadlines)
   - Regional language translation for meeting summaries

8. **Festival Sponsorship & Donations (PRD Sec 3.9):**
   - Target progress meters (e.g. Ganesh Utsav 2026, Diwali Deepotsav)
   - Tiered sponsorships (Gold Patron, Silver Feast Sponsor, Bronze Supporter)
   - Live Sponsor & Donor Honor Roll with personal neighbor messages

9. **Admin Console:**
   - Managing Committee modal to broadcast notices, add rules, upload documents, and record meeting minutes.

---

## 🛠️ Getting Started

```bash
# Install dependencies
npm install

# Run development server
npm run dev

# Build for production
npm run build
```

Open [http://localhost:3000](http://localhost:3000) to view the app.
