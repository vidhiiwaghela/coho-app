# Design Document
## Society / RWA Management App ("Cookie") — Visual Direction

**Reference:** "Modern Community Management App UI" (Dribbble, Fazlur Rahman) — dark card UI with a lime accent, used as the primary visual reference for this app.

---

## 1. What the Reference Actually Does

Breaking down the screenshot into a design system rather than "make it look like this":

- **Base surface:** white/off-white background, content sits in a tall rounded card container (mobile screen).
- **Primary content blocks are near-black** (`#161616`-ish), not white cards — this is the opposite of the typical "white card on grey background" SaaS look, and it's what makes the UI feel premium rather than generic.
- **One accent color does all the work:** a lime/acid-green (`#D6FF3F`-ish), used sparingly and only for the highest-priority actions (Pay button, the "Today" tab, dues/violation chips, checkmarks). It never appears more than 2–3 times per screen.
- **Pill shapes everywhere:** search bars, buttons, nav bar, tab switcher, status badges — barely any hard corners.
- **Bottom nav is a floating dark pill**, not a full-width bar — icons only, current tab highlighted in lime.
- **Status communicated by color+text pairing**, not color alone: "Approved" (green dot + text), "Pending" (orange dot + text) — accessible, not just a colored dot.
- **Typography is a plain geometric sans**, bold for numbers/headings, regular for body — no serif, no display font. Numbers (₹4,500, $170.00) are the visual weight-bearers, not headlines.

This checks out as a deliberate, specific choice (dark-card fintech/community hybrid) rather than a generic SaaS-card template — worth keeping close to it rather than "improving" it into a lighter, more generic look.

---

## 2. Design Tokens

### Color
| Token | Hex | Use |
|---|---|---|
| `bg-base` | `#F5F5F0` | App background (soft off-white, slightly warm, not stark white) |
| `surface-dark` | `#161616` | Primary content cards (dashboard hero, payment summary, nav bar) |
| `surface-dark-2` | `#1F1F1F` | Secondary elements on dark surfaces (input fields, list rows inside dark cards) |
| `accent-lime` | `#D6FF3F` | Primary actions only: Pay button, active tab, dues chip, success checkmark |
| `text-primary` | `#111111` | Body text on light surfaces |
| `text-inverse` | `#FFFFFF` | Body text on dark surfaces |
| `text-muted` | `#8A8A8A` | Secondary/meta text (timestamps, subtitles) |
| `status-success` | `#3FBF6F` | "Approved," resolved states |
| `status-pending` | `#E8A33D` | "Pending," in-progress states |

**Rule:** lime is a spotlight, not a theme color. If more than ~3 elements on one screen are lime, pull it back — its power is scarcity.

### Type
- **Typeface:** one geometric sans family (e.g., **Inter** or **General Sans** — both free, both close to the reference's rounded-geometric feel). No second typeface needed; weight does the differentiation.
- **Scale:**
  - Large numerals (bill amounts, dues): 32–36px, bold
  - Screen titles ("Payments," "Community"): 20px, semibold
  - Card headers ("Announcements," "Quick Actions"): 15px, semibold
  - Body/list text: 14px, regular
  - Meta/timestamps: 12px, regular, `text-muted`

### Shape & Elevation
- Corner radius: large (20–28px) on cards and phone-frame-level containers, full pill (999px) on buttons, search bars, badges, and nav.
- No drop shadows in the reference — separation comes from the dark-surface/light-surface contrast, not shadow. Keep shadows minimal or absent to match.

### Spacing
- Generous padding inside dark cards (20–24px) — the dark surface needs breathing room or it reads heavy.
- 12–16px gap between stacked cards/sections.

---

## 3. Component Inventory (build these once, reuse everywhere)

| Component | Notes |
|---|---|
| **Dark hero card** | Rounded, near-black, holds the highest-priority info for that screen (greeting + dues on Home, total pending on Payments) |
| **Stat chip pair** | Two side-by-side rounded chips with a lime or dark background, big number + small label + chevron (used for "Dues" / "Open Violation" style summaries) |
| **Pill search bar** | Icon + placeholder text, full pill radius, light grey fill |
| **Segmented tab switcher** | Pill container, active segment filled dark/black with white text, inactive segments transparent |
| **List row with avatar + status badge** | Avatar, name, subtext, right-aligned status pill (colored dot + label) |
| **Icon action grid** | Circular dark icon buttons in a row/grid, label below (Quick Actions, Helpdesk/Facilities) |
| **Floating bottom nav** | Dark pill, icon-only, active icon on a lime circular background |
| **Primary CTA button** | Full-width, lime fill, black text, pill radius (e.g., "Pay $4,500") |

---

## 4. Mapping the Reference Screens to Your App's Screens

The reference shows Home / Payments / Community — here's how your actual PRD features map onto that same visual language:

| Reference screen | Your app equivalent | Adaptation |
|---|---|---|
| **Home** (greeting, dues chip, announcements, quick actions) | **Dashboard** | Greeting + flat number, dues chip + "open rule search" chip, Announcements feed (from Notices feature), Quick Actions grid → Documents / Rules / Meetings / Pay |
| **Payments** (total pending, breakdown, pay button, payment method list) | **Maintenance & Property Tax** | Same layout exactly — "Total Pending" hero, itemized breakdown (Maintenance Fee / Property Tax / Parking), lime "Pay" button, QR/payment method list |
| **Community** (search visitors, Today/Upcoming/History tabs, visitor list with status) | **Meetings & Notices** (repurposed) | Swap "visitors" for "meetings" — Today/Upcoming/Past tabs, list of meeting entries with a status badge (e.g., "Summary ready" / "Pending translation") instead of Approved/Pending |

**New screens the reference doesn't cover** (design these in the same system, don't invent a new style):
- **Rules search** — pill search bar (same as Community's "Search Visitors") + results list, each result showing the rule text, category chip, and a muted timestamp/meeting-origin line.
- **Document vault** — icon-grid or list view per flat, same dark-card pattern as Quick Actions, tapping opens a document preview.
- **Festival sponsorship** — reuse the Payments screen pattern almost exactly (goal amount as the "Total Pending"-style hero, contribute button in lime).

---

## 5. Principles to Hold Onto While Building

1. **Dark card = the important thing on this screen.** Don't make every card dark — only the one holding the primary number/action. Everything else stays on the light background.
2. **Lime is spent, not spread.** One primary action per screen gets it. If two things compete for lime, one of them is wrong.
3. **Status is always color + label**, never color alone (accessibility, and it matches the reference exactly).
4. **Numbers are the hierarchy**, not headlines. A large bold rupee amount should be the biggest thing on any given screen it appears on.
5. **Keep the bottom nav dark and floating**, not a flush white tab bar — it's one of the most identity-carrying pieces of this reference.

---

## 6. Implementation Notes (Next.js + Tailwind + shadcn, per the tech stack doc)

- Define the tokens in `tailwind.config.ts` under `theme.extend.colors` (`surfaceDark`, `accentLime`, etc.) rather than hardcoding hex values in components — keeps the whole app consistent if you tune the palette later.
- shadcn's `Badge`, `Button`, and `Card` components are good starting primitives — override their default radius/shadow tokens once globally rather than per-instance.
- Build the **Dark hero card** and **Floating bottom nav** as shared components first — nearly every screen in the PRD reuses one or both.
