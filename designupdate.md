# CoHo — UI Revamp & Motion Design Update

## Scope

UI/visual and motion only. **No backend, data model, or functional changes** — `src/lib/store.ts` and `src/types/index.ts` stay untouched, all existing features behave exactly as they do today. This doc covers: (1) a dark-theme visual refresh, (2) shrinking/tightening the intro splash animation, (3) adding a light interactive motion language across the app, with particular attention to touch/mobile gestures (tap, press, swipe) since this is used as a mobile web app.

## Current State Snapshot

- **Splash/intro**: `src/app/layout.tsx:24-57` inlines `public/coho-splash-logo.svg` server-side; `src/app/page.tsx:90-108` enforces a **3000ms minimum hold** before hiding `#splash`; styles in `src/app/globals.css:186-337` — `.cl-logo` sized `min(78vw, 300px)` (the "too big" culprit), `.splash-loader-bar`, `.splash-tagline`. The SVG itself has embedded keyframes (`cl-draw`, `cl-light`, `cl-halo`, `cl-fade`, ~1.9–2.6s total). Reduced-motion is handled in both CSS and SVG already — must be preserved.
- **Theme**: single hardcoded dark palette via CSS vars in `globals.css:5-48` — `--bg:#0A1120`, `--card:#111C2E`, `--surface:#16233A`, `--border:#22304A`, `--text:#F3F5F9`, `--text-secondary:#8C97AD`, `--accent:#EFE4CC`, plus tier (gold/silver/bronze) and status colors. `tailwind.config.ts` has redundant alias names from past palette churn. No light mode exists — this is a re-skin of an already-dark app, not new theme-switching infra.
- **Screens/modules**: Dashboard, Payments, Documents, Rules, Notices & Minutes, Meetings, Sponsorship, Complaints (+ admin), Facility Bookings (+ admin), Notification Center, plus shared components (Header, FloatingNav, SideDrawer, SegmentedTabs, PillSearchBar, StatusBadge, StatChipPair, DarkHeroCard, modals).
- **Motion**: no animation library present (no framer-motion); only `canvas-confetti` for payment success. ~30 files use ad hoc `transition-`/`animate-`/`@keyframes`. Green field for a small, consistent motion primitive set.

## Goals

1. Shrink and tighten the intro animation so it reads as a quick mobile app boot, not a desktop splash — keep the house-drawing concept, just resize/retime it.
2. Refresh the dark theme for better contrast and warmth without introducing a light mode.
3. Add a consistent, lightweight interactive motion language: tap/press feedback, card and list entrances, tab/modal transitions — tuned for **touch** (mobile), not mouse hover.
4. Do all of this without changing any component's data flow, props contract, or business logic — purely visual/CSS/motion layer changes.

## Constraints

- Dark theme only; respect `prefers-reduced-motion` everywhere new motion is added.
- No new state management, no backend/API changes, no changes to `store.ts` action behavior.
- Mobile viewport-first (existing `max-w-lg` container convention).
- Touch-first interactions: `:active` press states, tap scale/ripple feedback, swipe affordances where natural (e.g. list items, modals) — not hover-only effects, since this is a mobile app.

## Phased Plan

Each phase ships independently and is verified in the browser (mobile viewport) before moving to the next.

### Phase 1 — Intro/Splash Animation Shrink
- Reduce `.cl-logo` from `min(78vw, 300px)` to a smaller mobile-appropriate size (~`min(42vw, 160px)`).
- Reduce the enforced minimum hold in `page.tsx:104` from 3000ms down to ~1200-1500ms.
- Tighten the SVG's internal keyframe durations (`cl-draw`, `cl-light`, `cl-halo`, `cl-fade`) proportionally so the sequence still feels complete, just faster.
- Adjust `.splash-frame`/`.splash-loader-bar`/`.splash-tagline` sizing/spacing to match the smaller logo.
- Preserve existing reduced-motion behavior.

### Phase 2 — Dark Theme Token Refresh
- Revisit `globals.css:5-48` CSS variables for contrast/warmth improvements (background layering, accent legibility, status color clarity).
- Clean up redundant Tailwind alias color names in `tailwind.config.ts` where safe (visual-only, no renamed classes that would break components — only consolidate unused duplicate aliases).
- Update the stale palette description in the README comment if present.
- Spot-check key screens (Dashboard, Payments) for contrast after the token change.

### Phase 3 — Core Interaction Motion Primitives
- Introduce a small set of reusable CSS-based motion utilities (press/tap scale, fade+slide entrance, modal/drawer transition) — likely extending existing `.animate-fade-in` pattern rather than adding a new library, keeping the bundle light.
- Apply touch-specific feedback: `:active` scale-down on buttons/cards/list rows, tap ripple or highlight on primary CTAs.
- Apply entrance motion to list/card content (Dashboard activity feed, Documents list, Notices list) on mount/scroll-in.

### Phase 4 — Screen-by-Screen Motion Pass
- Apply the Phase 3 primitives consistently across remaining modules (Payments, Complaints, Facility Bookings, Meetings, Sponsorship, Rules, Notification Center) and shared components (modals, SideDrawer, FloatingNav, SegmentedTabs).
- Ensure modal open/close, tab switches, and drawer slide-ins all use consistent easing/duration.
- Final pass: verify `prefers-reduced-motion` disables all added motion app-wide, and do a full click/tap-through in a mobile viewport.

## Claude-Design Mockup Prompts

(For generating visual references before/alongside implementation, if desired.)

**1. Dark theme refresh (tokens & foundations)**
> Redesign the dark theme for "CoHo," a mobile-first residential society management app (maintenance payments, documents, notices, complaints, facility bookings). Current palette: background `#0A1120` (deep navy), card `#111C2E`, surface `#16233A`, border `#22304A`, text `#F3F5F9`, secondary text `#8C97AD`, accent `#EFE4CC` (warm beige, used for primary CTAs), plus gold/silver/bronze tier colors and success/info/pending/urgent status colors. Keep it dark — no light mode. Refresh for better contrast and visual warmth so it feels "welcoming" rather than corporate/cold, while staying legible on mobile (WCAG AA for text). Deliver an updated token set (background layers, text, accent, status colors) and show it applied to a card, a button, and a status badge.

**2. Mobile-appropriate splash/intro sequence**
> Design a resized intro/splash animation for a mobile app, viewport 375×812. Current splash: a house-shaped logo (line-drawing animation — roof, walls, ground stroke in sequence, then a window "light" fade-in, then a glow pulse) sized at 78% of viewport width (up to 300px), held on screen for a minimum of 3 seconds, with a loader bar and the tagline "Your society, together" fading in below. It currently feels oversized/slow for mobile. Redesign it smaller and snappier: logo at roughly 40-45% of viewport width, total sequence under 1.5s, keep the house line-drawing concept and the tagline, but make it feel like a quick, polished mobile app boot rather than a desktop splash screen. Show the sequence as 4-5 keyframe stills.

**3. Key screens with interactive motion**
> Using the refreshed dark theme, design the Dashboard and Payments screens for "CoHo" (mobile, 375×812). Dashboard shows a hero card with maintenance due/status, quick stat chips, and a scrollable list of recent activity/notices. Payments shows a bill breakdown, a "Pay Now" primary CTA, and a QR code payment option. Show default state plus one interaction state each (e.g. card press/tap feedback, button press, list item swipe or expand) so the motion feels tactile and welcoming rather than static.

**4. Micro-interaction / motion spec**
> Define a lightweight motion language for a dark-mode mobile app ("CoHo"): tab bar switches, card/list entrance on scroll, modal open/close, button press feedback, and success states (e.g. payment confirmation). Specify easing, duration (target 150-300ms for most micro-interactions), and describe how each respects `prefers-reduced-motion`. Present as a short reference sheet (interaction name → trigger → visual behavior → duration/easing), not full screens.

## Verification (per phase)

- Run the app locally, view at a mobile viewport (375×812), tap/click through the affected screens.
- Confirm no functional regressions: payments, document requests, complaints, bookings, notices/meetings CRUD all behave identically to before.
- Confirm `prefers-reduced-motion` still disables/reduces all new motion.
- Confirm no changes to `src/lib/store.ts` or `src/types/index.ts` logic.
