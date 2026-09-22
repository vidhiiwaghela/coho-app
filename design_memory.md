# CoHo — Design System Memory

Living record of the visual design decisions made across this project's UI revamp. Read this before making further UI changes — it documents what exists, why, and where, so work stays consistent instead of drifting.

**Golden rule observed throughout:** every change in this history was presentation-layer only — CSS, className strings, and JSX wrapper markup for visual effects. Nothing in `src/lib/store.ts`, `src/types/index.ts`, API routes, event handlers, or data flow was ever touched for design work. Keep following that boundary.

---

## 1. Where things live

| Concern | File(s) |
|---|---|
| Design tokens (CSS vars) | `src/app/globals.css` `:root` block |
| Global elevation/glow/button system | `src/app/globals.css` (bottom half, clearly commented sections) |
| Fonts | `src/app/layout.tsx` (`<head>` Google Fonts link) + `--font-inter` / `--font-heading` vars |
| Intro/splash | `src/app/layout.tsx` (inlined SVG), `src/app/page.tsx` (dismissal timing), `public/coho-splash-logo.svg`, `#splash` rules in `globals.css` — **do not modify**, user has explicitly fixed this |
| Hero card pattern | `src/components/common/DarkHeroCard.tsx` — reused by Payments dues card and Sponsorship hero |
| Floating nav | `src/components/common/FloatingNav.tsx` |
| Header | `src/components/common/Header.tsx` |
| Login | `src/components/auth/LoginView.tsx` |

---

## 2. Design tokens (current palette — warm navy + gold)

Defined once in `globals.css :root`, consumed everywhere via `var(--x)` or the literal hex (Tailwind arbitrary values). **When changing a color, update the CSS var AND grep for the literal hex across `src/` — both forms are in active use** (see §6).

```css
--bg: #0E1420;              /* deep navy base */
--card: #161F30;            /* primary card surface */
--surface: #1C2740;         /* elevated surface */
--border: #2B3854;
--border-strong: #3A4A6B;
--text: #F5F1E8;             /* warm off-white */
--text-secondary: #A6ACC0;
--accent: #E8B565;           /* warm gold — primary CTA color */
--accent-hover: #F0C87D;
--accent-pressed: #D9A24F;
--on-accent: #14100A;        /* ink used on gold surfaces */
--tier-gold: #D9B872;
--tier-silver: #BEC3CC;
--tier-bronze: #C4895A;
--success: #8FBF8A;
--info: #7FAAD1;
--pending: #E2A94D;
--urgent: #E2685B;
```

Origin: this palette came from a design handoff package (`Awaiting design prompts.zip` → `design_handoff_coho_theme/`) — a token showcase + splash + Dashboard/Payments reference screens built as `.dc.html`/`.jsx` prototypes. Treat that handoff as the source of truth if tokens need re-deriving; it also specifies interaction timing (press states, expand/collapse, swipe-reveal) not yet fully implemented — see §7 (Not yet done).

**Previous palette** (superseded, do not reintroduce): navy `#0A1120`/`#111C2E`/`#16233A` + beige accent `#EFE4CC`. If you see these hexes anywhere, it's stale.

---

## 3. Typography

- **Body/UI**: Inter (400–800)
- **Headings** (`h1`–`h6`): Manrope (600–800), via `--font-heading`, applied globally with a blanket `h1,h2,h3,h4,h5,h6 { font-family: var(--font-heading); letter-spacing: -0.01em; }` rule — no per-component font class needed.
- Both loaded via one Google Fonts `<link>` in `layout.tsx` (shared with the pre-existing Plus Jakarta Sans import — left in place, unclear if still used elsewhere, wasn't removed to avoid breaking anything).

---

## 4. Atmospheric layer (the "award-winning" pass)

This is what took the UI from "flat re-skin" to "premium." Four reusable systems, all in `globals.css`:

### a) Aurora background
`body` has fixed radial-gradient glows (warm gold top-left, cool blue top-right, warm gold bottom) layered over `--bg`. **Any full-screen `<div>` with an opaque solid background will cover this** — if a screen looks flat, check whether its root div has `bg-[#0E1420]` painted over the body. (LoginView needed its own local copy of the aurora glows for this reason — see its top of JSX.)

### b) Global card elevation (automatic — no per-component work needed)
Attribute selectors match on Tailwind's literal arbitrary-value class strings, so **any element using the standard card color + radius combo gets elevated automatically**:
```css
[class*="bg-[#161F30]"][class*="rounded-2xl"],
[class*="bg-[#161F30]"][class*="rounded-3xl"],
[class*="bg-[#1C2740]"][class*="rounded-2xl"],
[class*="bg-[var(--card)]"][class*="rounded-2xl"],
[class*="bg-[var(--card)]"][class*="rounded-3xl"] { box-shadow: ...; }
```
A lighter second tier does the same for nested `rounded-xl` cards, scoped to `div` only (so buttons/inputs sharing that radius aren't affected):
```css
div[class*="bg-[#161F30]"][class*="rounded-xl"],
div[class*="bg-[#1C2740]"][class*="rounded-xl"] { box-shadow: ...; }
```
**Implication:** new cards that reuse the existing bg+radius convention (`bg-[#161F30] ... rounded-2xl`) get depth for free. No need to add shadow utilities manually — just don't fight this selector with an explicit `shadow-none` unless intentional.

### c) Gradient gold buttons (also automatic)
Any `<button>` or `<a>` with the exact class token `bg-[#E8B565]` or `bg-[var(--accent)]` is auto-upgraded to a gradient fill + glow + press-darken, via `~=` attribute selectors (exact token match, so gold *tints* like `bg-[#E8B565]/15` used for icon chips are correctly excluded):
```css
button[class~="bg-[#E8B565]"], a[class~="bg-[#E8B565]"],
button[class~="bg-[var(--accent)]"], a[class~="bg-[var(--accent)]"] { ...gradient + glow... }
```
There's also a standalone `.btn-gold` class with the same treatment for cases where you want it explicitly rather than relying on the auto-match.

### d) Reusable utility classes
- `.card-elevated` — manual opt-in to the stronger shadow tier (used on hand-built hero cards like `DarkHeroCard`, the Dashboard welcome card, and the Login auth card).
- `.accent-glow` — soft gold glow ring, used on the Login logo badge.
- Hero card recipe (copy this pattern for any new "featured" card): `bg-gradient-to-br from-[#1B2740] via-[#161F30] to-[#111827]` + `rounded-3xl` + `card-elevated` + one or two `absolute blur-3xl radial-gradient` glow blobs (gold top-right ~`rgba(232,181,101,0.20)`, cool blue bottom-left ~`rgba(127,170,209,0.12)`) + a 1px top hairline `linear-gradient(90deg, transparent, rgba(255,255,255,0.14), transparent)`.

---

## 5. Interaction / motion system

Two layers, both respect `prefers-reduced-motion: reduce` (verify this still holds for any new animation you add — every keyframe/transition block in this file has a matching reduced-motion override):

**a) Global element-level feedback** (`globals.css`, no class needed) — every `<button>`, `[role="button"]`, `summary` gets: 0.15s press-scale to `0.97` on `:active`, smooth hover/color transitions, and a gold `:focus-visible` ring. Inputs/selects/textareas get focus-transition only (no scale).

**b) Named utility classes** (opt-in, apply explicitly):
- `.tap-scale` / `.tap-scale-soft` — press feedback for non-`<button>` interactive elements (e.g. a clickable card `<div>`)
- `.list-item-in` — staggered entrance animation; pair with an inline `style={{ "--stagger-delay": "${idx * 40}ms" }}` in list `.map()` renders
- `.modal-pop-in` (alias: `.animate-scale-up`, kept for back-compat — several modal files already reference `animate-scale-up` from before it was defined) — modal panel pop-in
- `.drawer-slide-in`, `.backdrop-fade-in` — drawer/backdrop transitions
- `.pill-btn` — pre-existing pill press effect (scale 0.98 on active), still in use

---

## 6. Known technical debt / traps for future edits

1. **Colors are duplicated as literal hex strings across ~38 component files**, not exclusively referenced via CSS vars. If you rebrand again, you must both (a) edit `:root` in `globals.css` and (b) run a project-wide literal hex find/replace (a `find src -name "*.tsx" -o -name "*.ts" | xargs sed -i` pass was used last time — see chat history for the exact hex mapping table). Grepping for a hex like `#161F30` across `src/components` will show you every spot.
2. **Tailwind config has many legacy compatibility color aliases** (`bgBase`, `surfaceDark`, `accentLime`, etc. in `tailwind.config.ts`) — all still point at the same CSS vars, left in place deliberately to avoid breaking any component that references them. Don't remove without grepping usage first.
3. **The intro splash is intentionally frozen** — user explicitly said "do not change the intro animation, I have fixed it." Its values: `.cl-logo` width `min(42vw, 150px)`, 1500ms minimum hold (`page.tsx`), SVG keyframes tuned to ~1.4s total. Leave untouched unless the user asks again.
4. **README.md palette section** was kept in sync with actual tokens each time they changed — do the same going forward, it's a quick doc-only edit.

---

## 7. Design handoff items not yet implemented

From the `design_handoff_coho_theme` reference package, these interaction specs were documented but not yet built (candidates for next session if asked):
- Notice card tap-to-expand/collapse with chevron rotation (250ms)
- Complaint row swipe-reveal (real pan gesture, not just a tap-toggle) exposing mark-read/archive actions
- Payments UPI "Copy" button → "Copied!" label swap for 1.5s
- Payment method segmented control (UPI/Card/Netbanking) styled per the handoff's 3-way pill selector spec

---

## 8. Verification checklist (do this after any UI change)

1. `npx tsc --noEmit` — must be clean
2. Check browser console for errors (`read_console_messages` with `onlyErrors: true`)
3. Visually check at least: Login, Dashboard, Payments, and one list screen (Notices/Rules/Meetings) at 375×812 mobile viewport
4. Confirm `#splash` / intro values are untouched (`grep -n "cl-logo\|1500 - elapsed" src/app/globals.css src/app/page.tsx`)
5. Confirm no diffs in `src/lib/store.ts`, `src/types/index.ts`, or `src/app/api/**`
