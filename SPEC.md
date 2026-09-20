# CoHo App — System Specification & Modification Brief (v2)

## 1. Global Ground Rules & Inviolable Boundaries
- DO NOT rewrite or refactor working business logic outside the explicit tasks listed below.
- Preserve existing data schemas for Payments and Festival donations unless explicitly instructed.
- All new components and styling modifications MUST adhere strictly to the Design System tokens below.

---

## 2. Design System & Theme Tokens (Dark Mode)
Apply these exact hexadecimal values across global CSS / theme config:

| UI Element | Hex Value | Purpose |
| :--- | :--- | :--- |
| **App Background** | `#0B1220` | Full page/screen background |
| **Surface / Card** | `#151F2E` | Base card and modal background |
| **Elevated Surface** | `#1D2A3A` | Badges, tags, nested containers (e.g., Bills, Maintenance) |
| **Border / Divider** | `#2B394A` | Card outlines, dividers, input borders |
| **Primary Text** | `#F5F7FA` | Headings, prominent labels, titles |
| **Secondary Text** | `#AAB7C6` | Subheadings, timestamps, secondary body text |
| **Primary Button** | `#4DA3FF` | Main CTA buttons, active state |
| **Secondary / Accent Button** | `#35C6B0` | Success actions, alternate CTA |
| **Status: Success** | `#39C27F` | Approved, Paid, Success notifications |
| **Status: Warning** | `#F5B84B` | Pending status, cautionary notes |
| **Status: Failure / Error** | `#F06C6C` | Failed transactions, rejections, overdue flags |

---

## 3. Role-Based Access Control (RBAC) & Authentication
Add a lightweight, flat-based login page supporting 3 distinct roles:
- **Admin**: Full control. Does NOT see payment prompts or pay buttons for their own view ("Admin shouldn't pay"). Can view, approve, and resolve document requests and complaints.
- **Member (Flat Owner)**: Access to all 4 tabs (Dashboard, Payments & Maintenance, Notices & Minutes, Festival & Donations, Complaints, and Request Document).
- **Tenant**: Restricted view.
  - Allowed access ONLY to:
    1. Rules (within Notices & Minutes)
    2. Festival & Sponsorship donations tab
  - Hidden from Tenant: Maintenance payments, administrative financials, society complaints overview, and property tax details.

---

## 4. Navigation & Layout Adjustments
1. **Scope consolidation**: Keep the main navigation focused on:
   - Dashboard
   - Payments & Maintenance (Combines Maintenance + Property Tax cards; keep as-is, no parking module)
   - Notices & Meeting Minutes (Combined single module)
   - Festival & Sponsorship Donations
2. **Dashboard cleanup**:
   - REMOVE: "Quick Services" section.
   - REMOVE: The standalone "Documents" tab/module entirely.
   - ADD: A quick-access "Request Document" trigger and "Lodge Complaint" trigger on the dashboard.

---

## 5. Feature Specifications & Bug Fixes

### A. Festival & Sponsorship Validation (Bug Fix)
- **Problem**: Custom amounts (e.g., ₹5,001) are rejected due to rounding constraints.
- **Fix**: Remove forced snapping or multiples of 50/0. Allow any custom integer amount `>= ₹1`.

### B. Payment Receipt PDF Generation (Fix)
- **Problem**: Clicking "Print PDF" prints the entire payments tab view.
- **Fix**: Restrict PDF generation/print preview to the **individual transaction receipt modal only**, omitting background screens, tabs, and navigation headers.

### C. Combined Notices & Meeting Minutes + Multi-Language Translation
- **Structure**: Merge Meeting Minutes and Notices under one unified view with a category filter (e.g., [All | Notices | Minutes | Rules]).
- **Rules Module**:
  - Fix the internal search bar so typing keywords filters rules in real-time.
- **Translation Fix**:
  - Fix the batch translation logic across English, Hindi, Gujarati, and Marathi.
  - Eliminate leftover string artifacts/language codes (e.g., "mu", "gu").
  - Ensure all items—including Rules—translate uniformly down the entire list without dropping the body text.

### D. Lightweight "Request Document" Flow (Replaces Document Module)
- **Member Flow**:
  - Modal or screen with a dropdown of standard documents (e.g., NOC for Sale/Rent, Share Certificate Copy, Renovation Permission Form).
  - Include an "Other" option revealing a custom text field.
  - Delivery Preference toggle: `[ ] Digital Copy` or `[ ] Physical Copy`.
  - Submit sends request payload to the society admin queue.
- **Admin Flow**:
  - Admin view lists open document requests with flat number, document name, and requested copy type.
  - Admin can mark as "Fulfilled" and optionally upload/send a digital file attachment directly back to the requester.

### E. Complaints Module (Lightweight Ticket System)
- Add a simple complaint submission form with:
  - **Category / Summary dropdown**: (e.g., Water Supply, Lift/Electrical, Noise/Disturbance, Cleanliness, Other).
  - **Description field**: Multi-line text explaining the issue.
  - Status progression: `Pending (#F5B84B)` → `In Progress` → `Resolved (#39C27F)`.