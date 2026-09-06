# Ummah Connect — Product Requirements (MVP)

Status: Stage 0 (planning). No application code yet.
Owner: hackathon team.
Last updated: 2026-09-05.

---

## 1. Problem statement

Muslim community resources — jobs, volunteers, services, spaces, events, requests for
help — are **not scarce, they are scattered**. They live in WhatsApp groups, Facebook
groups, Instagram, email threads, individual websites, flyers, and word of mouth. There
is no shared, searchable place where a community member or an organization can post a
need and have the right people find it.

**Ummah Connect is a searchable network that connects people, organizations,
businesses, and opportunities.** It is infrastructure that sits on top of existing
community networks, not a replacement social network.

## 2. Definition of success

A judge understands this within ~30 seconds of the demo:

> "Muslim community resources are fragmented across many disconnected channels. This
> platform creates a searchable network connecting people, organizations, businesses,
> and opportunities."

The product then proves that claim with a polished, working end-to-end flow.

We optimize for: clear problem, clear solution, strong UX, functional technology,
community impact, memorable demo. **Not** for feature count.

## 3. The core primitive: Opportunity

Everything the platform does revolves around one object, the **Opportunity**, with a
`type` field instead of separate systems:

| Type | Meaning | Primary action |
|------|---------|----------------|
| `job` | Paid role | Apply |
| `volunteer` | Unpaid help needed | I'm Interested |
| `service` | Something offered (professional service, trade) | Contact |
| `request` | A community member asks for help | Offer Help |
| `space` | A room / venue / rental available | Contact |
| `event` | A gathering | RSVP |
| `other` | Anything else | I'm Interested |

Every response, regardless of action label, creates one `opportunity_responses` row.
There is no separate "applications" table, "RSVPs" table, etc.

## 4. Users

There is exactly one kind of account: **a person** (`profiles`, 1:1 with Supabase
`auth.users`).

Organizations and businesses are **entities that people belong to**
(`organization_members`). A single `organizations` table holds both, distinguished by
`kind` (`organization` | `business`). See `database-schema.md` §"Assumptions
challenged" for why this replaces the spec's three-way account type.

- **Individual** — a person acting as themselves (engineer, student, accountant,
  volunteer, community member).
- **Organization** — masjid, Islamic center, nonprofit, community org, religious
  institution. `kind = 'organization'`.
- **Business** — Muslim-owned business, professional service provider, restaurant,
  retail, consulting. `kind = 'business'`.

A person can post an opportunity as themselves, or "as" an organization they manage.

## 5. In scope for the MVP

### Feature 1 — Authentication
Sign up, log in, log out, reset password (Supabase Auth, email + password).
Onboarding captures the person's name and asks whether they also want to create an
organization/business profile.

### Feature 2 — Profiles
- **Person profile:** name, avatar, location, bio, profession, skills, interests.
- **Organization / business profile:** name, logo, description, `kind`, category,
  location, website, verification status. Managed by its members.
- View any profile (public directory). Edit only your own / orgs you manage.

### Feature 3 — Opportunity creation
Any authenticated person can create an opportunity, optionally attributed to an
organization they manage. Fields: title, description, type, creator (implicit),
optional organization, location, optional start/end datetime, optional expiration,
status, optional skills tags, optional contact email override. Fast form; AI
pre-fill is a Stage 7 enhancement, never a requirement.

### Feature 4 — Opportunity feed
Browse opportunities as cards. Filter by type, by location (city), free-text search
across title + description. Default sort: newest open first. "Recommended" sort is a
Stage 7 add-on. Card shows: type badge + icon, title, poster (person or org),
location, date, and the type-appropriate action button.

### Feature 5 — Opportunity response
The action button creates an `opportunity_responses` row with the responder's
profile, the action, and an optional short message. **The poster then sees the
responder's public profile and contact details** on "My Opportunities". That is how
the loop closes. No inbox, no threads, no chat.

### Feature 6 — Search & discovery
One search surface across opportunities, people, organizations, and businesses.
Postgres full-text search for opportunities; `ilike` / trigram for people and orgs.
No external search service.

### Feature 7 — Verification
Organizations and businesses have `verification_status`:
`unverified` → `pending` → `verified`. A manager can request verification (sets
`pending`). A platform **admin** (a `profiles.role = 'admin'` flag) approves it
(sets `verified`). No automated verification, no document upload.

### Feature 8 — Demo data
A documented, repeatable seed script that creates a believable single-city Muslim
community: several organizations, several businesses, ~10–15 people, ~20–30
opportunities across all types, and a few responses. Realistic fictional names, never
"Test Org 1". `npm run seed` / `npm run db:reset`.

### Feature 9 (Stage 7, optional) — AI
- **A. Opportunity structuring:** paste natural language → Claude extracts type,
  title, dates, counts, description, location → user reviews and edits every field
  before publishing.
- **B. Opportunity matching:** transparent score = skill/interest overlap +
  type/profession affinity + location match + recency. Explainable ("matched on:
  volunteering, Chicago"). LLM classification optional. If the AI API is down,
  matching falls back to recency and structuring is simply hidden — the app stays
  fully usable.

## 6. Explicitly OUT of scope

Messaging / chat / inbox, social feed, likes, comments, followers, groups, payments,
marketplace checkout, mobile app, video, voice, push notifications, complex
notifications, LinkedIn / Facebook / WhatsApp integration, Google OAuth (Stage 1 may
add it only if trivial), recommendation ML infrastructure, a complex admin dashboard,
Redis, Kafka, microservices, a separate API server.

These are roadmap, not MVP. See README §19–20.

## 7. The critical product question

For every feature, ask:

> "Does this make it easier for a Muslim community member or organization to
> **discover, share, or act on** a community opportunity?"

If no, it does not belong in the MVP.

## 8. Assumptions challenged

| # | Spec assumption | Challenge | Decision |
|---|-----------------|-----------|----------|
| 1 | Three profile types: Individual, Organization, Business | Org and Business have identical fields; a real user is a *person* who may *represent* an org. A hard 3-way enum breaks Person↔Org. | One `profiles` row per person. One `organizations` table for org **and** business (`kind`). People join via `organization_members`. |
| 2 | Entities: `skills`, `profile_skills`, `opportunity_skills` | Canonical skill taxonomy = 3 tables + joins + seed for a 3-day build. AI matching only needs overlap. | `skills text[]` on `profiles` and `opportunities`, GIN-indexed. Normalized taxonomy is a documented post-MVP migration. |
| 3 | Opportunity has a "Creator" | Ambiguous: the person who clicked, or the org shown on the card? | `created_by` (always a person) **and** nullable `organization_id` (acting-as). Edit rights = creator OR a manager of the attributed org. |
| 4 | "Opportunity Response record" but "no messaging" | A response with no follow-up channel is a dead end; judges will ask "then what?" | Response reveals the responder's public profile + contact email to the poster. One-directional, no threads. Documented as a deliberate privacy choice. |
| 5 | Feed supports "sorting/relevance" | True relevance needs engagement signals we won't have. | Default sort = newest open. "Recommended" (transparent score) is Stage 7 and clearly labelled. |
| 6 | Location filtering | Free-text location can't be filtered reliably ("NYC" vs "New York"). | Store `location` (free text, for display) **and** `city` (chosen from a small combobox of seeded values, used for filtering). Demo data mostly shares one city. |
| 7 | Verification states include `pending` | Implies a request flow. | Manager clicks "Request verification" (→ `pending`); admin approves (→ `verified`). `profiles.role = 'admin'` gates approval. |
| 8 | "Administrator can manually mark verified" | No admin concept elsewhere in the spec. | Minimal: a boolean-ish `role` column on `profiles`; a single server-guarded `/admin/verification` page. Not a dashboard. |

## 9. Open questions — resolved by the product owner (2026-09-05)

1. **Email visibility.** ✅ Confirmed. After a person responds, the poster may see
   that responder's email (read from `auth.users` via an authorised server action).
   The response UI must state this plainly before the user submits.
2. **Onboarding.** ✅ Keep it minimal. "Create an org during onboarding" is enough
   for the MVP; there is **no** "join an existing org" request flow. Additional
   `organization_members` are added by seed data or directly by a manager.
3. **Auth email confirmation.** ✅ Disabled for now. The demo Supabase project turns
   off "Confirm email"; seeded users are created pre-confirmed.
4. **Google OAuth.** ✅ Deferred. It is a small Supabase config change and can be
   switched on in Stage 2 if time allows; not a blocker and not in the critical
   path. (Stage 1 scaffold does not wire it.)

## 10. Traceability to the judging rubric

| Rubric criterion | Weight | How this PRD serves it |
|------------------|--------|------------------------|
| Technical Implementation | 25% | RLS on every table, server-side authorization, typed end-to-end, Postgres FTS, graceful AI degradation (`architecture.md`, `database-schema.md`). |
| User Experience & Design | 20% | One primitive, low-friction posting, 1–2 click responses, polished design system, empty/loading states (`design-system.md`). |
| Problem Solving | 20% | The fragmentation problem is stated, measured against the 30-second test, and every feature is filtered by the critical product question. |
| Innovation & Creativity | 15% | The unified Opportunity primitive; AI structuring that keeps the human in control; a transparent, explainable match score. |
| Presentation & Communication | 10% | Seeded single-city community makes the network visible; scripted demo flow (README §18) mapped to stages in `implementation-plan.md`. |
| Community Focus | 10% | Organizations are first-class; verification builds trust; the product connects rather than extracts. |
