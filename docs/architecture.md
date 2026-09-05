# Ummah Connect — Architecture

Status: Stage 0 design.
Last updated: 2026-09-05.

---

## 1. Shape of the system

```
                 Browser (React, Next.js App Router, RSC + minimal client JS)
                        │
                        │  form posts / RPC
                        ▼
   Next.js on Vercel  ──┼── Server Components (read)            ← Supabase server client (anon key + user cookie, RLS-bound)
                        ├── Server Actions (mutations)          ← Supabase server client (RLS-bound)
                        ├── Route Handlers (auth callback,      ← Supabase server client
                        │     AI structuring, optional cron)
                        └── trusted admin path                  ← Supabase service-role client (RLS bypass, server-only)
                        │
                        ▼
                 Supabase project
                   ├── PostgreSQL (5 tables, RLS forced, helper fns, triggers)
                   ├── Auth (auth.users, email+password, password reset)
                   └── Storage (avatars, logos buckets)
                        │
                        ▼
   Anthropic Claude API  (Stage 7 only — opportunity structuring + optional match classification)
```

No separate backend, no API server, no microservices, no Redis/Kafka, no Docker.
This matches README §4–5 exactly.

## 2. Technology decisions

| Concern | Choice | Notes |
|---------|--------|-------|
| Framework | Next.js (latest stable), App Router | RSC for reads, Server Actions for writes |
| Language | TypeScript, `strict` | shared types generated from the DB (`supabase gen types`) |
| UI | React + Tailwind CSS + shadcn/ui + Lucide icons | see `design-system.md` |
| Data / Auth / Files | Supabase (Postgres, Auth, Storage) | one hosted project per environment |
| Supabase SDK | `@supabase/supabase-js` + `@supabase/ssr` | cookie-based sessions in the App Router |
| Validation | Zod | one schema per form, reused in the Server Action |
| Forms | `react-hook-form` + `@hookform/resolvers/zod` | client-side UX; server re-validates |
| Toasts | `sonner` | success / error feedback |
| Hosting | Vercel | preview deploys per PR |
| Migrations | Supabase CLI, SQL files in `supabase/migrations/` | `supabase db push` |
| AI (Stage 7) | Anthropic Claude API | `claude-haiku-4-5-20251001` for low-latency extraction; `claude-sonnet-5` if quality needs it |
| Tests | Vitest (unit: Zod schemas, match score), `tsc --noEmit`, ESLint | Playwright smoke test of the demo flow is a stretch goal |

Google OAuth: add in Stage 1 only if it is a trivial Supabase config change;
otherwise deferred (README §20).

## 3. Supabase client strategy

Three clients, three trust levels. **The service-role key is never imported into any
file that can reach the browser bundle.**

| Client | Key | Where | RLS | Used for |
|--------|-----|-------|-----|----------|
| Browser client | `NEXT_PUBLIC_SUPABASE_ANON_KEY` | client components | enforced | realtime-free reads that must be client-side (rare), auth widgets |
| Server client | anon key + the user's session cookie | Server Components, Server Actions, Route Handlers | enforced (acts as the user) | almost everything: feed, profiles, create/edit/respond |
| Admin client | `SUPABASE_SERVICE_ROLE_KEY` | server-only module, guarded by an explicit `assertAdmin()` or seed context | bypassed | seeding, `approve_org_verification`, reading a responder's email for the contact reveal |

`lib/supabase/server.ts`, `lib/supabase/client.ts`, `lib/supabase/admin.ts`.
`admin.ts` starts with `import 'server-only'`.

## 4. Request patterns

### 4.1 Reads — Server Components
The feed, a profile page, an org page, "My Opportunities" are async Server
Components that call the **server client**. RLS filters rows to what the viewer may
see. No data-fetching library, no client state for server data.

Freshness: dynamic rendering for authed/personalized pages; the public feed may use
`revalidate` (e.g. 30–60s) or `revalidateTag('opportunities')` fired from the
create/edit Server Actions.

### 4.2 Writes — Server Actions
Every mutation is a Server Action in `app/**/actions.ts` (`'use server'`). Each one:

1. `const supabase = createServerClient()` and `const { data: { user } } = await supabase.auth.getUser()`.
2. If no `user`, return `{ ok: false, error: 'auth' }` (or redirect to login).
3. Parse input with the Zod schema; on failure return `{ ok: false, fieldErrors }`.
4. **Re-check authorization in code** (e.g. "is this user a manager of `organization_id`?") — do not rely on RLS alone for correctness, only for containment.
5. Perform the write via the server client (RLS still applies).
6. `revalidatePath(...)` / `revalidateTag(...)`.
7. Return a typed result: `type ActionResult<T> = { ok: true; data: T } | { ok: false; error: string; fieldErrors?: Record<string,string[]> }`.

Client components call the action, show `sonner` feedback, and never see a service
key or a raw SQL error.

### 4.3 Route Handlers (the few we need)
- `app/auth/callback/route.ts` — Supabase auth code exchange / email confirm / password-reset landing.
- `app/api/ai/structure/route.ts` — Stage 7; takes free text, calls Claude, returns a draft opportunity object. Rate-limited per user (simple in-memory or a `profiles`-keyed timestamp check), times out fast, and returns `{ ok: false }` cleanly so the UI just hides the feature.
- `app/api/cron/expire/route.ts` — optional; Vercel Cron flips expired opportunities.

## 5. Authentication & session

- Email + password via Supabase Auth. Sign up, log in, log out, password reset.
- `@supabase/ssr` stores the session in cookies; `middleware.ts` refreshes it on
  every request and can gate `/app/*` authed routes.
- Onboarding: after first login, if `profiles.onboarded_at IS NULL`, force
  `/onboarding` — collect name, city, (optional) profession/skills, and offer
  "I also want to add my organization or business" → creates an `organizations`
  row + an `owner` membership in one Server Action.
- Demo concession: Supabase "Confirm email" is disabled for the demo project (or
  seeded users are created with `email_confirm: true`) so sign-up is instant on
  stage. Documented; flagged as an open question in `product-requirements.md` §9.

## 6. Authorization model

| Rule | Enforced by |
|------|-------------|
| Identity is `auth.uid()` / server session — never a client-supplied id | Server Actions + RLS |
| You may edit only your own profile | RLS + action check |
| You may edit an org only if you are its `owner`/`admin` | `app.is_org_manager()` in RLS + action check |
| You may post "as" an org only if you manage it | RLS `WITH CHECK` + action check |
| You may edit/delete an opportunity only if you created it or manage its org | RLS + action check |
| A poster / org manager sees responses to their opportunity; a responder sees only their own | RLS on `opportunity_responses` |
| Only `profiles.role = 'admin'` can set `verification_status = 'verified'` | `app.approve_org_verification()` + RLS `WITH CHECK` freezing the column |
| Service-role key never in client code | `import 'server-only'` in `admin.ts`, lint check |

Defense in depth: even a buggy query cannot return rows the viewer shouldn't see,
because RLS is forced on every table.

## 7. Contact reveal (how the response loop closes without messaging)

1. A person clicks the type-appropriate action on an opportunity → Server Action
   inserts an `opportunity_responses` row (`responder_id = auth.uid()`).
2. The poster opens **My Opportunities → this opportunity → Responses**. RLS lets
   them read those response rows.
3. For each responder the poster sees: name, avatar, profession, city, skills, the
   optional message, and a **contact email**. The email is fetched by a Server
   Action that (a) confirms the caller owns / manages the opportunity, then (b) uses
   the **admin client** to read `auth.users.email` for the responder (or the
   responder's chosen `contact_email` if we add one later).
4. The poster emails them directly, outside the platform. No inbox is built.

This is a deliberate privacy trade-off, called out as open question #1 in
`product-requirements.md`.

## 8. Search & discovery

| Target | Mechanism |
|--------|-----------|
| Opportunities | Postgres full-text: `search_vector @@ websearch_to_tsquery('english', :q)`, plus `type` / `city` filters, ordered by `ts_rank` then recency. |
| People | `full_name ILIKE '%q%'` or `pg_trgm` similarity; optional `skills && :tags`. |
| Organizations / businesses | trigram on `name || description`; `kind` / `verification_status` / `city` filters. |
| Unified search page | Runs the three queries in parallel (`Promise.all`) in one Server Component, renders three grouped sections with "see all". |

No Elasticsearch / Algolia / Typesense. Data volume for the MVP is dozens to low
hundreds of rows.

## 9. AI architecture (Stage 7, fail-open)

- **Opportunity structuring:** `POST /api/ai/structure` → Claude with a strict
  system prompt and a JSON schema (type, title, description, `starts_at`,
  `ends_at`, `headcount`, `location`, `skills`). Response is validated with the same
  Zod schema as the manual form and used only to **pre-fill** the create form. The
  user edits and confirms every field before publishing. If the call errors or
  times out (short deadline), the button shows a toast and the plain form remains.
- **Opportunity matching:** a pure, transparent scoring function in
  `lib/match.ts` — `skills`/`interests` overlap + `type`↔`profession` affinity map +
  `city` match + recency decay. Returns a score **and a reason string**. Runs in
  SQL/JS, no API call. An optional Claude pass can re-rank the top N, but the
  fallback (score only) is always shown. If AI is unavailable the "Recommended" tab
  simply uses the score function; if we skip it entirely the feed still works on
  recency.
- **Key handling:** `ANTHROPIC_API_KEY` is server-only. No streaming to the client
  is required for the MVP.

## 10. Folder structure (proposed)

```
app/
  layout.tsx                 root layout, nav, providers (Toaster)
  page.tsx                   homepage
  (marketing)/               public marketing pages if any
  opportunities/
    page.tsx                 feed
    [id]/page.tsx            detail
    new/page.tsx             create form (+ AI pre-fill, Stage 7)
    [id]/edit/page.tsx
    actions.ts               create / update / delete / respond
  organizations/
    page.tsx  [slug]/page.tsx  new/  [slug]/edit/  actions.ts
  people/
    page.tsx  [id]/page.tsx
  search/page.tsx
  onboarding/page.tsx  actions.ts
  (app)/                     authed area
    profile/  settings/  my/opportunities/  my/responses/
  admin/verification/page.tsx  actions.ts
  auth/  login/ signup/ reset/ callback/route.ts
  api/ai/structure/route.ts  api/cron/expire/route.ts
components/
  ui/                        shadcn primitives
  opportunity/ organization/ profile/ common/
lib/
  supabase/{client,server,admin}.ts
  validation/                zod schemas
  match.ts                   scoring function
  constants.ts               opportunity types, skill suggestions, cities
  types.ts                   DB types (generated) + view models
supabase/
  migrations/*.sql
  config.toml
scripts/
  seed.ts  reset.ts
docs/
  product-requirements.md architecture.md database-schema.md
  design-system.md implementation-plan.md risks.md
```

## 11. Environment variables

| Var | Scope | Purpose |
|-----|-------|---------|
| `NEXT_PUBLIC_SUPABASE_URL` | public | Supabase project URL |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | public | RLS-bound client/server access |
| `SUPABASE_SERVICE_ROLE_KEY` | server only | seeding, admin verification, contact reveal |
| `NEXT_PUBLIC_SITE_URL` | public | auth redirect URLs, absolute links |
| `ANTHROPIC_API_KEY` | server only | Stage 7 AI |
| `CRON_SECRET` | server only | protects the optional expire cron route |

`.env.example` is committed; real values are in Vercel + local `.env.local`
(gitignored).

## 12. Non-functional targets (hackathon-realistic)

- **Performance:** feed and detail pages render < 1s on a warm Vercel deploy; images
  via `next/image` with Supabase Storage in `remotePatterns`.
- **Accessibility:** WCAG AA contrast, keyboard-operable dialogs/menus, labelled
  inputs, visible focus, `prefers-reduced-motion` respected.
- **Responsiveness:** designed mobile-first; nav collapses to a sheet; cards stack.
- **Resilience:** every page has an empty state, a loading skeleton, and an error
  boundary. AI failures are invisible to the core flow.
- **Observability:** Vercel logs + Supabase logs. No custom telemetry for the MVP.

## 13. Known architectural risks

See `risks.md` for the full register. Architecture-specific highlights:

1. **RLS recursion** on `organization_members` policies → mitigated with
   `SECURITY DEFINER` helper functions (`app.is_org_manager` etc.).
2. **Service-role key leakage** → `import 'server-only'`, single `admin.ts`, code
   review checklist, no service key in `NEXT_PUBLIC_*`.
3. **Server Actions trusting RLS for correctness** → every action re-checks
   authorization in code; RLS is containment only.
4. **`auth.users` seeding** cannot be done in SQL → seed script uses
   `auth.admin.createUser`; `db:reset` must also delete those users.
5. **Column-conditional authorization** (freezing `verification_status`) is awkward
   in RLS → handled by dedicated `SECURITY DEFINER` transition functions.
6. **Email-confirmation friction** on stage → demo project disables it; must not be
   disabled in a real production project without reconsidering.
7. **Feed cache staleness** after posting → explicit `revalidateTag` in the create
   action.
