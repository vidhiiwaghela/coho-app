# Tech Stack Document (Vibe-Coding Edition — Google Antigravity)
## Society / RWA Management App ("Cookie")

Antigravity is Google's agent-first IDE (VS Code-based, works with Gemini and Claude models, with an integrated agent, terminal, and browser). Vibe coding works best when the stack has **fewer moving parts and less manual glue code** — one language, one deployable unit where possible, and tools that are extremely well-documented (so the agent has strong training signal on them and makes fewer mistakes). This version of the stack is consolidated for that.

**Key change from the earlier doc:** instead of a separate React frontend + Express backend + manually wired auth/storage, this collapses everything into **Next.js + Supabase**, which cuts the number of services you (or the agent) have to configure and connect from ~6 down to 2 core platforms.

---

## 1. Core Stack (the "just tell the agent to build with this" stack)

| Layer | Tool | Why it's good for vibe coding |
|---|---|---|
| **Framework (frontend + backend in one)** | **Next.js (App Router, TypeScript)** | One codebase for UI and API routes — no separate backend repo/server to keep in sync. Extremely well-represented in AI training data, so agents generate fewer errors. |
| **Database + Auth + Storage + Realtime** | **Supabase** | Postgres DB, built-in auth (with roles), file storage, and realtime subscriptions all in one platform with one SDK — replaces separately wiring Postgres + JWT auth + S3 + Socket.IO. Free tier is enough for a project demo. |
| **Styling** | **Tailwind CSS + shadcn/ui** | Agents are very good at generating clean UI with these because the component patterns are common and predictable. |
| **Hosting** | **Vercel** | Native Next.js deploy, connects to GitHub, zero-config. One click from "done coding" to "live demo link." |

This 4-row table is genuinely close to the whole stack — that's the point of consolidating for vibe coding.

---

## 2. Feature → Tool Mapping

| Feature | Tool |
|---|---|
| Flat login/auth (Admin vs Resident roles) | Supabase Auth (email/password), custom `role` column on the `users` table |
| Maintenance bills + payment history | Supabase Postgres table + Next.js API route |
| QR payment | `qrcode` npm package (generates QR pointing to a mock/sandbox pay page) or Razorpay test mode |
| Document vault (per flat) | Supabase Storage, with Row Level Security (RLS) policies scoping access to the owning flat |
| Rules database (searchable, dated) | Supabase Postgres full-text search (`tsvector`) — no separate search engine needed |
| Meeting records + AI summary | Store minutes in Supabase, call **Claude API** or **Gemini API** from a Next.js API route to generate the summary |
| Translation (minutes + notices) | **Google Cloud Translation API** — natural fit since you're already in the Google ecosystem via Antigravity/Gemini |
| Notices/announcements feed | Supabase **Realtime** (built-in — no need to add Socket.IO separately) |
| Festival sponsorship/donations | Same Supabase table + Razorpay/mock payment pattern as maintenance |
| Email reminders (property tax) | Supabase Edge Function + **Resend** (simple free-tier email API) or Nodemailer |

---

## 3. Why this is better specifically for vibe coding (vs. the earlier stack)

- **Fewer services to prompt the agent about.** Express + separate Postgres + separate S3-style storage + separate Socket.IO means four things that can drift out of sync when an AI agent is generating code across sessions. Supabase folds auth, DB, storage, and realtime into one client library (`@supabase/supabase-js`), so the agent writes against one consistent API.
- **One deployable app.** Next.js API routes replace a standalone Express server — you're not juggling two deploy targets (Vercel for frontend + Render/Railway for backend).
- **Row Level Security instead of hand-rolled access control.** Instead of writing/debugging custom middleware to make sure Resident A can't see Resident B's documents, Supabase RLS policies express that directly in the database — fewer places for an agent-generated bug to hide.
- **TypeScript end-to-end** — types shared between frontend and API routes reduce a common class of vibe-coding bug (mismatched request/response shapes).

---

## 4. Working with Antigravity itself

- Antigravity is agent-first — you'll get better results giving it **one feature at a time** ("build the flat-login auth flow with Supabase," then "now build the rules search page") rather than the whole PRD in one prompt.
- It supports both Gemini and Claude models — for anything precise/security-sensitive (like the RLS policies scoping document access per flat), it's worth reviewing the agent's generated code yourself rather than trusting it blindly, since that's exactly the kind of thing that's easy to vibe-code wrong (e.g., accidentally leaving a table publicly readable).
- Keep a running `PRD.md` and this tech stack doc in your project root — Antigravity-style agents perform noticeably better when given a persistent spec file to reference across sessions instead of re-explaining scope each time.

---

## 5. Local Dev Setup Checklist
1. `npx create-next-app@latest` (TypeScript, App Router, Tailwind — all via prompts)
2. Create a free Supabase project → grab the URL + anon key
3. `npm install @supabase/supabase-js`
4. Set up tables: `users`, `flats`, `bills`, `documents`, `rules`, `meetings`, `notices`, `sponsorships`
5. Enable RLS on each table, write policies scoping rows to the logged-in user's flat (or admin role)
6. Add API keys to `.env.local`: Supabase, Claude/Gemini, Google Translate, Razorpay (test), Resend
7. Deploy to Vercel, connect Supabase env vars there too
