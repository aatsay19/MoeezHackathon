# Ummah Connect — Database Schema

Status: Stage 0 design. No migrations written yet.
Database: Supabase-hosted PostgreSQL 15+.
Auth: Supabase Auth owns `auth.users`. Application data lives in `public.*` and is
keyed to `auth.users.id`.

---

## 1. Design principles

1. **One primitive.** Jobs, volunteering, events, requests, spaces, and services are
   all rows in `opportunities`, discriminated by `type`.
2. **One account kind.** Every account is a person (`profiles`, 1:1 with
   `auth.users`). Organizations and businesses are shared entities people belong to.
3. **Fewest tables that work.** 5 core tables (see §"Assumptions challenged" for the 3
   we removed from the spec's suggested 8).
4. **RLS is defense in depth, not the only defense.** Server Actions re-check
   authorization; RLS guarantees nothing leaks even if a query is wrong.
5. **Never trust a client-provided user id.** Every policy and every server action
   derives identity from `auth.uid()` / the server session.
6. **Additive migrations.** Each change is a new timestamped file in
   `supabase/migrations/`.

## 2. Entity overview

```
auth.users (managed by Supabase Auth)
    │ 1:1
    ▼
profiles ──────────< organization_members >────────── organizations
   │                                                        │
   │ created_by                              created_by / organization_id
   ▼                                                        ▼
opportunities  ◄──────────── organization_id (nullable, "acting as") ───────
   │
   │ 1:N
   ▼
opportunity_responses >────── responder_id ──────► profiles
```

- A **person** may manage zero or more **organizations** (`organization_members`,
  role `owner` / `admin` / `member`).
- An **opportunity** is always created by a person (`created_by`) and may be
  attributed to one organization (`organization_id`, nullable).
- An **opportunity_response** links one person to one opportunity, once.

## 3. Enumerated values

Implemented as `text` columns with `CHECK` constraints (simpler to evolve in a
hackathon than native `enum` types; no `ALTER TYPE` migrations).

| Domain | Column | Allowed values |
|--------|--------|----------------|
| Org kind | `organizations.kind` | `organization`, `business` |
| Verification | `organizations.verification_status` | `unverified`, `pending`, `verified` |
| Member role | `organization_members.role` | `owner`, `admin`, `member` |
| Platform role | `profiles.role` | `user`, `admin` |
| Opportunity type | `opportunities.type` | `job`, `volunteer`, `service`, `request`, `space`, `event`, `other` |
| Opportunity status | `opportunities.status` | `draft`, `open`, `closed`, `expired` |
| Response action | `opportunity_responses.action` | `apply`, `interested`, `rsvp`, `offer_help`, `contact` |
| Response status | `opportunity_responses.status` | `new`, `viewed`, `accepted`, `declined` |

## 4. Tables

### 4.1 `profiles`

One row per authenticated person. Created automatically by a trigger on
`auth.users` insert; completed during onboarding.

| Column | Type | Null | Default | Notes |
|--------|------|------|---------|-------|
| `id` | `uuid` | no | — | **PK**, **FK → `auth.users(id)` ON DELETE CASCADE** |
| `full_name` | `text` | no | `'New member'` | trimmed, 1–120 chars (enforced in Zod + `CHECK length`) |
| `avatar_url` | `text` | yes | — | points at `avatars` storage bucket |
| `location` | `text` | yes | — | free text, for display ("Rogers Park, Chicago") |
| `city` | `text` | yes | — | normalized filter key ("Chicago"); chosen from combobox |
| `bio` | `text` | yes | — | ≤ 600 chars |
| `profession` | `text` | yes | — | ≤ 120 chars |
| `skills` | `text[]` | no | `'{}'` | lowercased tags; GIN indexed |
| `interests` | `text[]` | no | `'{}'` | lowercased tags; GIN indexed |
| `role` | `text` | no | `'user'` | `CHECK (role IN ('user','admin'))` |
| `onboarded_at` | `timestamptz` | yes | — | null until onboarding completes |
| `created_at` | `timestamptz` | no | `now()` | |
| `updated_at` | `timestamptz` | no | `now()` | maintained by `set_updated_at` trigger |

No email column — email lives in `auth.users` and is surfaced only through a
server action to authorized callers (see `architecture.md` §"Contact reveal").

### 4.2 `organizations`

Organizations **and** businesses.

| Column | Type | Null | Default | Notes |
|--------|------|------|---------|-------|
| `id` | `uuid` | no | `gen_random_uuid()` | **PK** |
| `name` | `text` | no | — | 2–160 chars |
| `slug` | `text` | no | — | **UNIQUE**; url-safe; generated from name + short id |
| `kind` | `text` | no | — | `CHECK (kind IN ('organization','business'))` |
| `category` | `text` | yes | — | free text ("Masjid", "Nonprofit", "Restaurant", "Consulting") |
| `description` | `text` | yes | — | ≤ 1500 chars |
| `logo_url` | `text` | yes | — | `logos` storage bucket |
| `location` | `text` | yes | — | free text, display |
| `city` | `text` | yes | — | normalized filter key |
| `website` | `text` | yes | — | `CHECK` starts with `http://` or `https://` |
| `verification_status` | `text` | no | `'unverified'` | `CHECK (... IN ('unverified','pending','verified'))` |
| `verification_requested_at` | `timestamptz` | yes | — | set when status → `pending` |
| `verified_at` | `timestamptz` | yes | — | set by admin when status → `verified` |
| `created_by` | `uuid` | no | — | **FK → `profiles(id)` ON DELETE RESTRICT** |
| `created_at` | `timestamptz` | no | `now()` | |
| `updated_at` | `timestamptz` | no | `now()` | trigger-maintained |

### 4.3 `organization_members`

Which people manage / belong to which organizations.

| Column | Type | Null | Default | Notes |
|--------|------|------|---------|-------|
| `id` | `uuid` | no | `gen_random_uuid()` | **PK** |
| `organization_id` | `uuid` | no | — | **FK → `organizations(id)` ON DELETE CASCADE** |
| `profile_id` | `uuid` | no | — | **FK → `profiles(id)` ON DELETE CASCADE** |
| `role` | `text` | no | `'member'` | `CHECK (role IN ('owner','admin','member'))` |
| `created_at` | `timestamptz` | no | `now()` | |

Constraints: `UNIQUE (organization_id, profile_id)`. At least one `owner` per org is
an application-level invariant (the creator is inserted as `owner` in the same
server action that creates the org).

### 4.4 `opportunities`

The core object.

| Column | Type | Null | Default | Notes |
|--------|------|------|---------|-------|
| `id` | `uuid` | no | `gen_random_uuid()` | **PK** |
| `title` | `text` | no | — | 4–140 chars |
| `description` | `text` | no | — | 10–4000 chars |
| `type` | `text` | no | — | `CHECK (type IN ('job','volunteer','service','request','space','event','other'))` |
| `created_by` | `uuid` | no | — | **FK → `profiles(id)` ON DELETE CASCADE** |
| `organization_id` | `uuid` | yes | — | **FK → `organizations(id)` ON DELETE SET NULL**; "posted as" |
| `location` | `text` | yes | — | free text, display |
| `city` | `text` | yes | — | normalized filter key |
| `starts_at` | `timestamptz` | yes | — | for `event` / timed `volunteer` |
| `ends_at` | `timestamptz` | yes | — | `CHECK (ends_at IS NULL OR starts_at IS NULL OR ends_at >= starts_at)` |
| `expires_at` | `timestamptz` | yes | — | after this, treated as expired |
| `status` | `text` | no | `'open'` | `CHECK (status IN ('draft','open','closed','expired'))` |
| `headcount` | `integer` | yes | — | e.g. "10 volunteers"; `CHECK (headcount IS NULL OR headcount > 0)` |
| `skills` | `text[]` | no | `'{}'` | GIN indexed; used by the match score |
| `contact_email` | `text` | yes | — | optional override; else fall back to org / creator email |
| `response_count` | `integer` | no | `0` | denormalized; maintained by trigger on `opportunity_responses` |
| `search_vector` | `tsvector` | no | generated | `GENERATED ALWAYS AS (to_tsvector('english', coalesce(title,'') || ' ' || coalesce(description,''))) STORED` |
| `created_at` | `timestamptz` | no | `now()` | |
| `updated_at` | `timestamptz` | no | `now()` | trigger-maintained |

Expiry: a lightweight approach for the hackathon — a partial index on
`expires_at` plus a filter `status = 'open' AND (expires_at IS NULL OR expires_at > now())`
in feed queries. Optionally a `pg_cron` job (or a Vercel cron route) flips
`status` to `expired`. Not required for the demo.

### 4.5 `opportunity_responses`

One person expressing interest in one opportunity, once.

| Column | Type | Null | Default | Notes |
|--------|------|------|---------|-------|
| `id` | `uuid` | no | `gen_random_uuid()` | **PK** |
| `opportunity_id` | `uuid` | no | — | **FK → `opportunities(id)` ON DELETE CASCADE** |
| `responder_id` | `uuid` | no | — | **FK → `profiles(id)` ON DELETE CASCADE** |
| `action` | `text` | no | — | `CHECK (action IN ('apply','interested','rsvp','offer_help','contact'))` |
| `message` | `text` | yes | — | ≤ 800 chars |
| `status` | `text` | no | `'new'` | `CHECK (status IN ('new','viewed','accepted','declined'))` |
| `created_at` | `timestamptz` | no | `now()` | |

Constraints:
- `UNIQUE (opportunity_id, responder_id)` — no duplicate responses.
- Application + trigger guard: `responder_id <> opportunities.created_by` (cannot
  respond to your own post).

## 5. Indexes

| Table | Index | Purpose |
|-------|-------|---------|
| `profiles` | `gin (skills)`, `gin (interests)` | match score, "people with skill X" |
| `profiles` | `btree (city)` | people filter |
| `profiles` | `btree (lower(full_name)) text_pattern_ops` or `gin (full_name gin_trgm_ops)` | people search |
| `organizations` | `unique (slug)` | route lookups |
| `organizations` | `btree (kind)`, `btree (verification_status)`, `btree (city)` | directory filters |
| `organizations` | `gin ((name || ' ' || coalesce(description,'')) gin_trgm_ops)` | org/business search |
| `organization_members` | `unique (organization_id, profile_id)` | integrity |
| `organization_members` | `btree (profile_id)` | "orgs I manage" |
| `opportunities` | `btree (status, created_at desc)` | default feed |
| `opportunities` | `btree (type)`, `btree (city)` | feed filters |
| `opportunities` | `btree (expires_at) where status = 'open'` | expiry sweep / feed freshness |
| `opportunities` | `gin (search_vector)` | feed full-text search |
| `opportunities` | `gin (skills)` | match score |
| `opportunities` | `btree (organization_id)`, `btree (created_by)` | org page, "my opportunities" |
| `opportunity_responses` | `unique (opportunity_id, responder_id)` | one response per person |
| `opportunity_responses` | `btree (responder_id, created_at desc)` | "my responses" |
| `opportunity_responses` | `btree (opportunity_id)` | poster's response list |

`pg_trgm` extension is enabled for fuzzy name search.

## 6. Helper functions (SECURITY DEFINER)

Placed in a private schema and `SET search_path = ''` to avoid RLS recursion (a
policy on `organization_members` cannot itself `SELECT organization_members`).

```sql
-- current user is a platform admin
create function app.is_admin() returns boolean
  language sql stable security definer set search_path = '' as $$
  select exists (
    select 1 from public.profiles p
    where p.id = (select auth.uid()) and p.role = 'admin'
  );
$$;

-- current user is owner/admin of the given organization
create function app.is_org_manager(org uuid) returns boolean
  language sql stable security definer set search_path = '' as $$
  select exists (
    select 1 from public.organization_members m
    where m.organization_id = org
      and m.profile_id = (select auth.uid())
      and m.role in ('owner','admin')
  );
$$;

-- current user belongs to the given organization (any role)
create function app.is_org_member(org uuid) returns boolean
  language sql stable security definer set search_path = '' as $$
  select exists (
    select 1 from public.organization_members m
    where m.organization_id = org and m.profile_id = (select auth.uid())
  );
$$;
```

Verification transitions are done through dedicated functions so RLS does not have to
express column-conditional logic:

```sql
-- org manager: unverified -> pending
create function app.request_org_verification(org uuid) returns void ...
  -- asserts app.is_org_manager(org); sets status='pending', verification_requested_at=now()

-- admin only: pending -> verified
create function app.approve_org_verification(org uuid) returns void ...
  -- asserts app.is_admin(); sets status='verified', verified_at=now()
```

## 7. Row Level Security

RLS is **enabled and forced** on all five tables. `anon` and `authenticated` get only
what the policies below grant. The `service_role` key bypasses RLS and is used only in
trusted server code (seeding, admin operations, contact reveal).

### 7.1 `profiles`

| Action | Policy |
|--------|--------|
| `select` | `true` — the people directory is public. (No email column, so nothing sensitive leaks.) |
| `insert` | `auth.uid() = id` — you may only create your own row. (Normally done by the `auth.users` trigger.) |
| `update` | `auth.uid() = id`. A separate `WITH CHECK` forbids a non-admin changing `role`: `role = 'user' OR app.is_admin()`. |
| `delete` | `auth.uid() = id` (account deletion) — or disabled entirely for the MVP. |

### 7.2 `organizations`

| Action | Policy |
|--------|--------|
| `select` | `true` — public directory. |
| `insert` | `auth.uid() = created_by`. |
| `update` | `app.is_org_manager(id) OR app.is_admin()`. `WITH CHECK` freezes `verification_status` and `verified_at` unless `app.is_admin()` — normal updates must leave those columns unchanged; use the helper functions. |
| `delete` | `app.is_org_manager(id) OR app.is_admin()` (manager path restricted to `owner` in the server action). |

### 7.3 `organization_members`

| Action | Policy |
|--------|--------|
| `select` | `true` — org "Team" section is public. (Can tighten to `app.is_org_member(organization_id)` if we decide teams are private.) |
| `insert` | `app.is_org_manager(organization_id)` **OR** bootstrap: `auth.uid() = profile_id AND role = 'owner' AND NOT EXISTS (select 1 from organization_members m where m.organization_id = organization_id)` — lets the creator become the first owner, then only managers add others. |
| `update` | `app.is_org_manager(organization_id)`; `WITH CHECK` prevents demoting/removing the last `owner` (also enforced in the server action). |
| `delete` | `app.is_org_manager(organization_id) OR auth.uid() = profile_id` (leave an org). Last-owner guard applies. |

### 7.4 `opportunities`

| Action | Policy |
|--------|--------|
| `select` | `status <> 'draft' OR auth.uid() = created_by OR app.is_org_manager(organization_id)` — drafts are private to the author / org managers. |
| `insert` | `auth.uid() = created_by AND (organization_id IS NULL OR app.is_org_manager(organization_id))` — you can only post "as" an org you manage. |
| `update` | `auth.uid() = created_by OR app.is_org_manager(organization_id) OR app.is_admin()`. |
| `delete` | same as `update`. |

### 7.5 `opportunity_responses`

| Action | Policy |
|--------|--------|
| `select` | `auth.uid() = responder_id` **OR** `auth.uid() = (select created_by from opportunities o where o.id = opportunity_id)` **OR** `app.is_org_manager((select organization_id from opportunities o where o.id = opportunity_id))` **OR** `app.is_admin()`. |
| `insert` | `auth.uid() = responder_id` **AND** the opportunity is visible and `status = 'open'` **AND** `auth.uid() <> (select created_by from opportunities o where o.id = opportunity_id)`. |
| `update` | Poster / org manager may change `status` (`new`→`viewed`/`accepted`/`declined`); responder may not edit after submit. Expressed as: `USING` = poster-or-manager-or-admin, `WITH CHECK` limits columns to `status`. |
| `delete` | `auth.uid() = responder_id` — withdraw your response. |

### 7.6 Storage buckets

| Bucket | Read | Write |
|--------|------|-------|
| `avatars` | public | `auth.uid()::text = (storage.foldername(name))[1]` — user writes only to their own folder |
| `logos` | public | path is `{organization_id}/...`; policy checks `app.is_org_manager(((storage.foldername(name))[1])::uuid)` |

## 8. Triggers

| Trigger | Table | Effect |
|---------|-------|--------|
| `handle_new_user` | `auth.users` (after insert) | insert a stub `profiles` row (`id`, `full_name` from metadata or default). |
| `set_updated_at` | `profiles`, `organizations`, `opportunities` (before update) | `new.updated_at = now()`. |
| `bump_response_count` | `opportunity_responses` (after insert/delete) | keep `opportunities.response_count` accurate. |
| `guard_self_response` | `opportunity_responses` (before insert) | raise if `responder_id = opportunities.created_by`. |
| `sync_expired_status` (optional) | scheduled | set `status = 'expired'` where `expires_at <= now()` and `status = 'open'`. |

## 9. Seed data

`auth.users` cannot be populated with plain SQL. The seed script
(`scripts/seed.ts`, run with the service-role key) will:

1. Create ~12–15 auth users via `supabase.auth.admin.createUser({ email, password, email_confirm: true })`.
2. Upsert their `profiles` (names, cities, bios, professions, skills, interests).
3. Insert ~8 `organizations` (mix of `organization` and `business`, 2–3 already
   `verified`, 1 `pending`), each with an `owner` in `organization_members`.
4. Insert ~25 `opportunities` across all seven types, some org-attributed, some
   personal, varied cities (mostly one metro), some with `starts_at` / `expires_at`.
5. Insert ~10 `opportunity_responses` so "My Opportunities" and "My Responses" are
   not empty on stage.

`npm run db:reset` truncates `public.*` (cascade) and deletes the seeded auth users,
then re-runs the seed. Documented in `implementation-plan.md` Stage 2.

All names fictional but realistic (e.g. "Masjid Al-Rahma", "Crescent Books &
Cafe", "Amina Yusuf"). No "Test Org 1".

## 10. Assumptions challenged (schema-level)

| Spec suggested | Kept? | Rationale |
|----------------|-------|-----------|
| `profiles` | ✅ | 1:1 with `auth.users`; app data separated from auth as required. |
| `organizations` | ✅ | Now also holds businesses via `kind`. |
| `organization_members` | ✅ | Required for "organizations are first-class users" and for posting "as" an org, and for org-side visibility of responses. |
| `opportunities` | ✅ | The core object. |
| `opportunity_responses` | ✅ | The unified response record. |
| `skills` | ❌ removed | Replaced by `text[]` + GIN. Canonical taxonomy is a clean post-MVP migration (`skills` + `*_skills` join tables) if autocomplete/dedupe becomes valuable. |
| `profile_skills` | ❌ removed | as above. |
| `opportunity_skills` | ❌ removed | as above. |
| (separate `businesses` table implied by 3 profile types) | ❌ never created | identical shape to `organizations`; `kind` discriminator instead. |

Result: **5 tables** instead of 8. Every removed table has a documented, additive
migration path, so this is reversible.

## 11. Post-MVP schema roadmap (not now)

- Normalized `skills` + `profile_skills` + `opportunity_skills` with a canonical tag
  list and autocomplete.
- `notifications` table (in-app), once there is a reason to notify.
- `saved_opportunities` (bookmarks).
- `organization_verification_documents` + an audit trail.
- PostGIS / geocoded coordinates for true radius search (currently `city` match).
- `messages` — only if the roadmap ever green-lights real messaging.
