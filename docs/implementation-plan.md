# Ummah Connect — Implementation Plan

Status: Stage 0 complete on approval of this document set.
Process rule (README §16): finish a stage, run type-check + lint + a manual smoke,
summarize, list open issues, **wait for approval** before the next stage. Do not
silently expand scope.

---

## 1. Guiding constraints

- 5 database tables (`database-schema.md`). Do not add tables without updating that
  doc and getting approval.
- One primitive: `opportunities`. No per-type systems.
- AI is Stage 7 and must fail open.
- Every feature must pass the critical product question (`product-requirements.md`
  §7).

## 2. Critical path

```
Stage 1 scaffold ─► Stage 2 DB + auth ─► Stage 3 profiles ─► Stage 4 opportunities ─►
Stage 5 discovery ─► Stage 6 engagement ─► Stage 7 AI ─► Stage 8 polish
```

Stage 4 is the product. Stages 1–3 exist to make Stage 4 possible; Stages 5–6 make it
useful; Stage 7 differentiates; Stage 8 wins rubric points. If time runs short, a
complete Stages 1–6 with strong polish beats a half-done Stage 7.

## 3. Stage-by-stage

Each stage lists: goal, tasks, dependencies, acceptance criteria, deferred items.

---

### STAGE 1 — Project scaffolding  ✅ COMPLETE (2026-09-05)

**Goal:** a running, deployable Next.js app with the design system in place and
Supabase clients wired, no business features.

**Done**
- `create-next-app` → **Next.js 16.3.4**, React 19, App Router, no `src/`, `@/*`
  alias, Turbopack (default). `tsconfig` strict (from the scaffold).
- shadcn/ui via `shadcn@4.21` — `radix-nova` style, Lucide, CSS variables. Added:
  button, card, badge, input, textarea, label, select, sonner, sheet,
  dropdown-menu, avatar, separator, skeleton, tabs, dialog, alert.
- **Tailwind v4** (no `tailwind.config.ts`). Brand palette (emerald primary, warm
  off-white ground) authored in `app/globals.css` `:root` / `.dark`, mapped via
  `@theme inline`. Fonts: Geist via `next/font` bound to `--font-sans` /
  `--font-heading`.
- `lib/supabase/{client,server,admin}.ts` — `admin.ts` starts with
  `import "server-only"` and reads the service-role key itself (no secret
  reference in `lib/env.ts`). `lib/env.ts` for public config + `isSupabaseConfigured`.
- **`proxy.ts`** (Next 16's renamed middleware) refreshes the Supabase session;
  passes through when env is unset. Route gating deferred to Stage 2.
- `.env.example`; `next.config.ts` image `remotePatterns` for Supabase Storage.
- Root layout: `ThemeProvider` (light default) + `SiteHeader` (desktop nav +
  mobile `Sheet`) + `SiteFooter` + `<Toaster />`. `PageShell` / `PageHeader`
  helpers. Real homepage (hero, 2 CTAs, "how it works", browse-by-type).
- `not-found.tsx`, `error.tsx`, `loading.tsx` (skeleton).
- Placeholder ("coming soon") pages for every **static** route in
  `design-system.md` §6.
- `lib/constants.ts`: opportunity type/action map, verification meta, city list,
  skill suggestions, nav.
- Scripts: `dev`, `build`, `start`, `lint`, `typecheck` (`next typegen && tsc`),
  `format` / `format:check` (Prettier). `.prettierrc.json`, `.prettierignore`.

**Acceptance — met**
- `npm run typecheck`, `npm run lint`, `npm run format:check`, `npm run build` all
  clean. Build prerenders 16 routes; Proxy detected.
- `npm run dev`: `/`, `/opportunities`, `/login` → 200; unknown route → 404;
  homepage `<title>` and hero copy render; no server errors/warnings in the log.
- Service-role grep: `SUPABASE_SERVICE_ROLE_KEY` / `createAdminClient` appear only
  in `lib/supabase/admin.ts` (which is `server-only`).

**Deviations from the original plan** (all reflected in `architecture.md` §2 and
`design-system.md` §2.1 / §9):
- Next.js **16** not 15 → `middleware.ts` is now **`proxy.ts`**; `typecheck`
  runs `next typegen` first for the generated `LayoutProps`/`PageProps` types.
- Tailwind **v4** → no `tailwind.config.ts`; tokens live in `globals.css`; values
  in **oklch**.
- shadcn is the newer **`radix-nova`** style; `cn` from the `cn` package;
  `next-themes` added (dependency of the shadcn toaster).
- `--accent` kept **neutral** (shadcn uses it for hover states); brand amber is
  applied ad hoc, not as a token.
- Placeholders cover **static** routes only. Dynamic routes (`[id]`, `[slug]`,
  `[id]/edit`, `[slug]/edit`, `auth/callback`) are created in their feature stages.
- Vercel + Supabase projects not provisioned in this session (no credentials);
  `.env.example` documents what they need. Deploy verification moves to Stage 2.

**Deferred:** all data, all auth flows, all forms.

---

### STAGE 2 — Database & authentication

**Goal:** schema live with RLS, auth flows working, seed data loads.

**Tasks**
- `supabase/migrations/0001_init.sql`: extensions (`pgcrypto`, `pg_trgm`), 5 tables,
  constraints, indexes (`database-schema.md` §4–5).
- `0002_functions.sql`: `app.is_admin`, `app.is_org_manager`, `app.is_org_member`,
  `request_org_verification`, `approve_org_verification`; `set_updated_at`,
  `handle_new_user`, `bump_response_count`, `guard_self_response` triggers.
- `0003_rls.sql`: enable + force RLS; all policies from `database-schema.md` §7.
- `0004_storage.sql`: `avatars`, `logos` buckets + storage policies.
- `supabase gen types typescript` → `lib/types.ts`.
- Auth pages: sign up, log in, log out, password reset request + update;
  `app/auth/callback/route.ts`.
- `proxy.ts` gates authed routes: `/onboarding`, `/opportunities/new`,
  `/organizations/new`, `/opportunities/*/edit`, `/organizations/*/edit`, `/my/*`,
  `/profile`, `/settings`, `/admin/*`.
- Onboarding page + Server Action: complete `profiles`, optionally create an
  organization + `owner` membership.
- `scripts/seed.ts` + `scripts/reset.ts`; `npm run db:seed`, `npm run db:reset`
  (documented in this file §5).
- Dev Supabase project: disable "Confirm email" (or seed with `email_confirm`).

**Dependencies:** Stage 1.

**Acceptance**
- Fresh browser: sign up → forced to onboarding → land on homepage authed.
- Log out / log in / password reset all work end to end.
- `npm run db:reset` produces the seeded community; counts match the seed spec.
- RLS spot checks (SQL, `database-schema.md` §7): anon cannot read drafts; user A
  cannot update user B's profile; user A cannot post "as" an org they don't manage;
  responder cannot read another responder's row.
- `typecheck` / `lint` clean.

**Deferred:** profile editing UI polish, opportunity CRUD, discovery.

---

### STAGE 3 — Profiles

**Goal:** view and edit people, organizations, and businesses; verification request +
admin approval.

**Tasks**
- Person profile view (`/people/[id]`) + edit (`/profile`): name, avatar upload
  (Supabase Storage), location/city, bio, profession, skills, interests. Zod schema
  shared with the Server Action.
- Organization/business view (`/organizations/[slug]`) + create/edit: name, logo,
  description, kind, category, location/city, website. Slug generation.
- "Team" section; add/remove members (manager only) — minimal UI (email lookup →
  `organization_members` insert). If time-boxed, seed memberships and defer the add
  UI.
- `VerifiedBadge` component; "Request verification" button on org edit
  (→ `request_org_verification`).
- `/admin/verification`: list `pending` orgs; approve (→ `approve_org_verification`).
  Server-guarded by `role = 'admin'`.
- People directory (`/people`) and organization directory (`/organizations`) —
  basic list + card, filters wired in Stage 5.
- Empty / loading / error states for every view.

**Dependencies:** Stage 2.

**Acceptance**
- A user edits their profile; changes persist and are visible to others.
- A manager creates an org, requests verification; an admin approves; badge flips to
  Verified.
- A non-manager cannot open the org edit page or call its actions (verified via UI +
  a direct action call).
- Avatar / logo uploads land in the right bucket path and render via `next/image`.
- `typecheck` / `lint` clean.

**Deferred:** search ranking, filters UI, opportunity attribution UI beyond a picker.

---

### STAGE 4 — Opportunities (the core)

**Goal:** full opportunity lifecycle and a real feed.

**Tasks**
- Create form (`/opportunities/new`): title, description, type, "post as" picker
  (self or an org I manage), location/city, optional start/end, optional expiration,
  optional headcount, optional skills, optional contact email. Zod schema.
- Edit (`/opportunities/[id]/edit`) and delete (behind `alert-dialog`).
- Detail page (`/opportunities/[id]`): full content, poster block, type-appropriate
  action button (wired in Stage 6), expiry/status handling.
- Feed (`/opportunities`): card grid, default sort newest open, pagination; freshness
  filter (`status = 'open' AND (expires_at IS NULL OR expires_at > now())`).
- `revalidateTag('opportunities')` from create/edit/delete actions.
- Optional expire cron route + `CRON_SECRET`.
- Card component per `design-system.md` §4.4.
- Homepage wired to show ~6 recent opportunities.

**Dependencies:** Stage 3 (poster identity, org attribution).

**Acceptance**
- A user posts an opportunity as themselves and as an org they manage; both appear
  in the feed immediately.
- Editing/deleting is possible only for the creator / org manager (UI + direct
  action check).
- Draft opportunities are invisible to others.
- Feed renders < 1s warm; empty/loading/error states present.
- `typecheck` / `lint` clean.

**Deferred:** filtering/search UI, recommendations, responses.

---

### STAGE 5 — Discovery

**Goal:** fast, intuitive search and filtering across all four entity types.

**Tasks**
- Opportunity feed filters: type (multi), city (combobox), full-text search
  (`websearch_to_tsquery` on `search_vector`), sort (newest / soonest event).
  Filters reflected in the URL query string (shareable, back-button friendly).
- People directory: name search (trigram), skill filter (`skills && tags`), city.
- Organization directory: name/description search, `kind` filter, verification
  filter, city.
- `/search`: one input → parallel queries → grouped results (Opportunities / People /
  Organizations / Businesses) with "see all" links.
- Debounced input; server-driven results (Server Component + `searchParams`).
- Empty states per surface ("No results for …").

**Dependencies:** Stage 4 (opportunities exist), Stage 3 (people/orgs exist).

**Acceptance**
- Searching a seeded term returns the expected opportunities ranked sensibly.
- Type + city filters combine correctly and survive a page refresh (URL state).
- `/search` shows all four groups for a broad term.
- No full-table scans on the hot paths (indexes from `database-schema.md` §5 in
  place); quick `EXPLAIN` sanity check.
- `typecheck` / `lint` clean.

**Deferred:** AI re-ranking, saved searches, geo radius.

---

### STAGE 6 — Engagement

**Goal:** close the loop — respond to opportunities, and let posters see responders.

**Tasks**
- Response action on the detail page: one Server Action, `action` derived from the
  opportunity `type`, optional message in a small dialog. Enforces: authed, not your
  own post, opportunity open, one response per person (`UNIQUE`).
- `/my/responses`: opportunities I responded to, my action, and the current
  `status`; allow withdraw (delete).
- `/my/opportunities`: posted by me / my orgs; per opportunity, a responses list
  showing each responder's public profile + message + **contact email** (contact
  reveal Server Action, `architecture.md` §7); mark `viewed` / `accepted` /
  `declined`.
- `response_count` surfaced on the poster's own cards.
- Notifications: none (out of scope) — the poster checks "My Opportunities".

**Dependencies:** Stage 4, Stage 3.

**Acceptance**
- Community member responds; poster sees the response with contact details; a
  non-owner cannot see those responses (UI + direct query).
- Duplicate response is prevented with a friendly message.
- Withdraw removes the row and updates `response_count`.
- `typecheck` / `lint` clean.

**Deferred:** messaging, email notifications, response analytics.

---

### STAGE 7 — AI (only once Stages 1–6 are stable)

**Goal:** two AI enhancements that both fail open.

**Tasks**
- **A. Opportunity structuring:** "Draft with AI" on the create form → a textarea →
  `POST /api/ai/structure` → Claude (`claude-haiku-4-5-20251001`, strict JSON
  schema, short timeout) → validated with the create Zod schema → pre-fills the form
  fields, all editable. User must confirm before publish. Per-user rate limit.
  On any failure: toast + the plain form remains.
- **B. Matching:** `lib/match.ts` pure scoring — skills/interests overlap +
  type↔profession affinity map + city match + recency decay → `{ score, reasons[] }`.
  "Recommended" tab on the feed for authed users, each card showing its reason
  chips. Optional Claude re-rank of the top N behind a flag; fallback is the raw
  score. If no profile signal, tab falls back to newest.
- `ANTHROPIC_API_KEY` server-only; feature flags to disable either piece instantly.

**Dependencies:** Stages 3–6 (profile signal, opportunities, create form).

**Acceptance**
- Pasting the README §8 example ("We need 10 volunteers next Saturday…") yields a
  correctly typed, dated draft the user can publish in two edits or fewer.
- Killing `ANTHROPIC_API_KEY` leaves create and feed fully functional; the AI
  entry points disappear or no-op with a toast.
- Match reasons are human-readable and accurate for a seeded user.
- `typecheck` / `lint` clean.

**Deferred:** embeddings, vector search, learning-to-rank, AI messaging.

---

### STAGE 8 — Hackathon polish

**Goal:** maximize the rubric; make the 30-second value prop undeniable.

**Tasks**
- **Technical:** fix bugs; loading skeletons everywhere; error boundaries; re-verify
  every RLS policy with a written checklist; mobile pass on every route; zero
  console errors/warnings; `typecheck` + `lint` clean; Lighthouse pass.
- **UX:** consistent spacing audit; every list has empty + loading + error; helpful
  error copy; accessible forms (labels, focus, `aria`); one clear CTA per screen.
- **Presentation:** finalize seed data into a coherent single-city story; write the
  demo script (README §18) with exact clicks; ensure the homepage communicates the
  problem + solution above the fold; short README with setup + seed instructions;
  optional 60–90s Loom.
- **Data:** `db:reset` produces a demo-ready state every time; a known demo login.
- Optional: one Playwright test that walks the demo flow.

**Dependencies:** Stages 1–7 (7 optional).

**Acceptance**
- A cold judge reaches "I get it" within ~30 seconds on the homepage.
- The full README §18 demo flow runs without a stumble from a fresh `db:reset`.
- No console errors; mobile and desktop both clean; all checks green.

---

## 4. Demo flow → stage coverage (README §18)

| Demo beat | Needs |
|-----------|-------|
| 1–2. Org needs volunteers, posts an opportunity | Stage 4 (create, org attribution), Stage 3 (org profile) |
| 3. Community member discovers it | Stage 4 feed + Stage 5 search/filter |
| 4. Clicks "I'm Interested" | Stage 6 response |
| 5. Organization sees the response | Stage 6 "My Opportunities" + contact reveal |
| 6. Member searches for a service/professional | Stage 5 unified search |
| 7. Platform recommends a relevant opportunity | Stage 7B match score |
| 8. NL request → structured opportunity | Stage 7A structuring |
| 9. Verified organizations/businesses | Stage 3 verification + badge |
| 10. The network connecting people/orgs/businesses/opportunities | homepage + directories, all stages |

Every beat except 7–8 is covered by Stages 1–6, so the demo still lands if Stage 7
slips.

## 5. Seeding & reset (reference)

- `npm run db:seed` — creates auth users (`auth.admin.createUser`, `email_confirm:
  true`), profiles, ~8 organizations (mixed `kind`, some verified, one pending) with
  owners, ~25 opportunities across all types, ~10 responses. Idempotent-ish: it
  first checks for a sentinel and refuses unless `--force`.
- `npm run db:reset` — `truncate` `public.*` cascade, delete seeded auth users by a
  known email domain (e.g. `@demo.ummahconnect.test`), then `db:seed`.
- Seed content lives in `scripts/seed-data.ts` (typed) so it is reviewable and
  realistic. No "Test Org 1".

## 6. Testing & verification per stage

- `npm run typecheck` (`tsc --noEmit`) and `npm run lint` after every stage —
  a stage is not done until both are clean.
- Vitest units where logic is real: Zod schemas, `lib/match.ts`, slug generation,
  date formatting.
- Manual RLS checklist (SQL snippets in `database-schema.md` §7) run at the end of
  Stages 2, 3, 4, 6, and again in Stage 8.
- Manual smoke of the affected routes on desktop + a mobile viewport.

## 7. Risk-driven sequencing notes

- **RLS is built in Stage 2, not retrofitted.** Retrofitting security is the classic
  hackathon failure; see `risks.md` (technical risk T1).
- **Seed data is real from Stage 2** so every later stage is demoed against
  believable content (`risks.md` cold-start risk C1).
- **Stage 7 is fenced.** Do not start it until Stage 6 acceptance passes
  (`risks.md` scope risk S1).
- **Contact reveal** is the riskiest privacy decision — confirm open question #1 in
  `product-requirements.md` before Stage 6.
