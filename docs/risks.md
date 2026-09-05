# Ummah Connect — Risk Register

Status: Stage 0 deliverable (README §17 requires explicit identification of scope,
technical, UX, cold-start/network-effect, and trust/verification risks).
Last updated: 2026-09-05.

Severity = impact on a successful hackathon demo × likelihood.
Each risk has an owner-facing mitigation that is already reflected in the other docs.

---

## 1. Scope risks

### S1 — AI eats the core (High)
The spec explicitly warns against this. AI (Stage 7) is the most tempting thing to
build and the least essential for the 30-second value prop.
**Mitigation:** Stage 7 is fenced behind Stage 6 acceptance
(`implementation-plan.md` §3, §7). The demo flow (README §18) is covered end to end
by Stages 1–6; AI beats 7–8 are additive. If time is tight, polish Stages 1–6.

### S2 — Rebuilding messaging by accident (High)
"Opportunity response" plus "the org sees the response" naturally pulls toward an
inbox, threads, read receipts, notifications.
**Mitigation:** the loop closes with a one-directional **contact reveal**
(`architecture.md` §7). No `messages` table, no notification system. "My
Opportunities" is the org's inbox surrogate.

### S3 — Three-way account type spawns duplicate systems (Medium)
A hard Individual/Organization/Business enum on the account leads to parallel
profile pages, parallel forms, parallel RLS, and no clean Person↔Org link.
**Mitigation:** one `profiles` per person; one `organizations` table
(`kind` discriminator); membership via `organization_members`
(`database-schema.md` §10). Removes an entire duplicated surface.

### S4 — Normalized skills taxonomy (Medium)
Three tables (`skills`, `profile_skills`, `opportunity_skills`) plus joins,
autocomplete, and a seed taxonomy is multi-day work for marginal MVP value.
**Mitigation:** `text[]` + GIN now; documented additive migration later
(`database-schema.md` §10–11).

### S5 — Feed "relevance/sorting" over-engineering (Medium)
True relevance needs engagement signals that a fresh platform does not have.
**Mitigation:** default sort = newest open. "Recommended" is a transparent,
explainable score in Stage 7, clearly labelled, with a recency fallback.

### S6 — Location as free geocoding (Low/Medium)
Radius search, maps, and geocoding are a rabbit hole.
**Mitigation:** `location` free text for display + `city` from a small combobox for
filtering. Demo data mostly shares one metro, so exact-match city filtering is
sufficient.

### S7 — Admin surface creep (Low)
"Administrator can verify" can balloon into a dashboard (README §19 forbids a
complex admin dashboard).
**Mitigation:** a single `role` column and one server-guarded
`/admin/verification` list with an Approve button.

---

## 2. Technical risks

### T1 — Security retrofitted instead of designed in (High)
RLS, server-side authz, and "never trust client user ids" are easy to defer and
painful to add late.
**Mitigation:** RLS is Stage 2, not Stage 8. Every Server Action re-checks authz in
code (`architecture.md` §4.2, §6). Stage 8 re-verifies with a written checklist.

### T2 — RLS infinite recursion on `organization_members` (Medium/High)
A policy on `organization_members` that itself selects `organization_members`
recurses.
**Mitigation:** `SECURITY DEFINER` helper functions (`app.is_org_manager`,
`app.is_org_member`, `app.is_admin`) with `SET search_path = ''`
(`database-schema.md` §6).

### T3 — Service-role key leaking into the client bundle (High impact, low likelihood)
One bad import exposes full DB access.
**Mitigation:** single `lib/supabase/admin.ts` starting with `import 'server-only'`;
never referenced from a client component; grep check in Stage 1 and Stage 8; key
lives only in server env, never `NEXT_PUBLIC_*`.

### T4 — Column-conditional authorization for verification (Medium)
RLS cannot cleanly express "a manager may update every column except
`verification_status`".
**Mitigation:** normal updates run under a policy whose `WITH CHECK` requires
`verification_status`/`verified_at` to be unchanged; transitions go through
`request_org_verification` / `approve_org_verification` SECURITY DEFINER functions
(`database-schema.md` §6–7).

### T5 — Seeding `auth.users` (Medium)
`auth.users` is Supabase-managed; plain SQL seed cannot create login-able users, and
`db:reset` can orphan them.
**Mitigation:** `scripts/seed.ts` uses `supabase.auth.admin.createUser({
email_confirm: true })`; `db:reset` deletes seeded users by a known email domain
before re-seeding (`implementation-plan.md` §5).

### T6 — Feed cache staleness after posting (Low/Medium)
A cached feed hides a just-posted opportunity — bad in a live demo.
**Mitigation:** `revalidateTag('opportunities')` in create/edit/delete actions;
personalized pages render dynamically (`architecture.md` §4.1).

### T7 — AI call blocks or breaks the create flow (Medium)
A slow or failing Claude call could stall posting.
**Mitigation:** AI only **pre-fills** a form that works without it; short timeout;
`{ ok: false }` path shows a toast and leaves the manual form; feature flag to
disable (`architecture.md` §9).

### T8 — AI returns malformed / hallucinated fields (Medium)
Extracted JSON may not match the schema or may invent a location.
**Mitigation:** the AI response is parsed with the **same Zod schema** as the manual
form; the user reviews and confirms every field before publish (README §8 mandate).

### T9 — `expires_at` never actually expires things (Low)
Without a sweep, expired opportunities linger.
**Mitigation:** feed queries filter on `expires_at > now()`; an optional Vercel Cron
route flips `status` to `expired`. Demo does not depend on the cron.

### T10 — Supabase free-tier limits / project pause (Low)
Free projects pause after inactivity; storage and row limits exist.
**Mitigation:** keep the project warm during the event; data volume is tiny; have
the seed script ready to rebuild state fast.

### T11 — Type drift between DB and app (Low)
Hand-written types diverge from the schema.
**Mitigation:** `supabase gen types typescript` into `lib/types.ts`, regenerated
after every migration.

---

## 3. UX risks

### U1 — "LinkedIn for Muslims" perception (High)
The spec explicitly does not want this. A profile-centric, connection-centric UI
would read that way.
**Mitigation:** the homepage and primary nav lead with **Opportunities**, not
people. The hero copy is "Connect with your community. Find opportunities, share
your skills, support Muslim organizations and businesses." Profiles exist to support
opportunities, not the reverse (`design-system.md` §1, §5).

### U2 — Looks like a CRUD dashboard / university project (High)
Default shadcn + no design decisions reads generic.
**Mitigation:** committed design system — warm off-white ground, single deep
emerald accent, restrained type scale, real card anatomy, consistent empty/loading
states, tasteful single geometric motif (`design-system.md`).

### U3 — Dead-end after responding (Medium/High)
User clicks "I'm Interested" and nothing visible happens → feels broken.
**Mitigation:** immediate confirmation toast + the response appears in "My
Responses" with a status; the poster side clearly shows new responses with contact
details. The one-directional model is explained in microcopy.

### U4 — Empty feed / empty directories on stage (High)
An empty network is unconvincing.
**Mitigation:** rich, realistic seed data from Stage 2; homepage always shows ~6
live opportunities; every list has a designed empty state as a fallback only.

### U5 — Posting friction (Medium)
A long form kills "minimize friction" (Principle 4).
**Mitigation:** only genuinely necessary fields are required (title, description,
type); everything else optional; "post as" defaults to self; Stage 7 AI pre-fill
further reduces effort.

### U6 — Filter/search returns confusing results (Medium)
Free-text location or fuzzy search giving odd matches erodes trust.
**Mitigation:** city filter is an exact-match combobox of known values; opportunity
search uses ranked Postgres FTS; every filtered view has a clear "N results" count
and a "clear filters" affordance.

### U7 — Mobile experience an afterthought (Medium)
Judges may view on a phone; README requires mobile responsive.
**Mitigation:** mobile-first layout, `Sheet` nav, stacking card grid; a mobile pass
is explicit in Stage 8 acceptance.

### U8 — Accessibility gaps (Medium)
Color-only signals, unlabelled inputs, focus traps.
**Mitigation:** accessibility checklist in `design-system.md` §8, enforced in Stage
8; type and verification badges always carry icon + text.

---

## 4. Cold-start / network-effect risks

### C1 — The product's value is the network; a demo has no network (High)
A two-sided marketplace with no users demonstrates nothing on its own.
**Mitigation for the hackathon:** the **seed data is the product demo** — a
believable single-city community (orgs, businesses, people, opportunities,
responses) so the network is visible from the first screen. The demo script walks a
real path through that network (README §18).
**Mitigation for a real launch (documented, not built):** launch one city at a
time; pre-load a hand-curated directory of local masajid, nonprofits, and
Muslim-owned businesses; partner with 2–3 anchor organizations to post real
opportunities before opening to individuals.

### C2 — Supply/demand imbalance (Medium)
Many seekers, few opportunities (or vice versa) makes the feed feel dead.
**Mitigation:** seed a balanced mix — ~25 opportunities across all seven types,
~12–15 people with varied skills, ~8 organizations. Homepage highlights fresh
supply.

### C3 — No reason to return (Medium)
Without notifications or messaging, engagement is one-shot.
**Mitigation (MVP scope):** "My Opportunities" / "My Responses" give a reason to
check back; the recommended feed (Stage 7) surfaces new matches. Email
notifications are explicitly roadmap, not MVP — noted so the judges understand it is
a deliberate cut, not an oversight.

### C4 — Geographic sparsity (Low for demo, High for real)
Spreading thin across many cities means every city looks empty.
**Mitigation:** demo is single-metro by construction; real rollout is city-by-city
(C1).

### C5 — Content moderation / spam at scale (Low for demo)
An open "post an opportunity" invites spam and inappropriate posts once real.
**Mitigation (MVP):** auth required to post; admin can delete any opportunity
(`is_admin` in RLS). Full moderation tooling is roadmap.

---

## 5. Trust / verification risks

### V1 — The Verified badge over-claims (High)
A green "Verified" check implies more diligence than a one-person manual review
provides, and users may extend misplaced trust (e.g. donate, share personal info).
**Mitigation:** define verification narrowly and state it in the badge tooltip —
"Identity confirmed by Ummah Connect" meaning the team checked the organization's
website and a matching email domain. Nothing more is implied. Unverified orgs are
still fully usable; absence of a badge is neutral, not a warning
(`design-system.md` §4.3).

### V2 — Impersonation of a real institution (High)
Someone creates "Masjid Al-Noor" they do not represent and posts on its behalf.
**Mitigation (MVP):** verification is the guard — only verified orgs get the trust
signal; verification requires proof of association (domain-matched email). Reporting
+ takedown is admin-manual for now (`is_admin` delete). Documented as needing a
proper claim/dispute flow post-MVP.

### V3 — Manual verification does not scale and is inconsistent (Medium)
One distracted admin approving a queue leads to errors.
**Mitigation (MVP):** acceptable at demo scale; `/admin/verification` shows the
request timestamp and the org's website/email so the check is quick and uniform.
Post-MVP: domain-verification automation, multiple reviewers, an audit trail
(`database-schema.md` §11).

### V4 — Contact reveal exposes a responder's email (Medium)
When a person responds, the poster learns their email — a privacy trade-off that
must be intentional and disclosed.
**Mitigation:** the response UI states plainly that responding shares the user's
name and contact details with the poster. Confirm as open question #1
(`product-requirements.md` §9) before Stage 6. Alternative (weaker demo): reveal
only name + profession and rely on the user reaching out.

### V5 — Public people directory leaks more than users expect (Medium)
Bios, professions, skills, and city are world-readable by design (needed for "find
people").
**Mitigation:** no email or precise address in `profiles`; onboarding explains the
profile is public; a future setting could make a profile unlisted (roadmap). Keep
required fields minimal.

### V6 — Admin role assignment (Low)
How does someone become `role = 'admin'`? A self-serve path would be a hole.
**Mitigation:** admin is set manually in the database / via the seed script only.
No UI grants it. The `profiles` update policy's `WITH CHECK` forbids a non-admin
changing their own `role`.

---

## 6. Top risks to watch during the build

| Rank | Risk | Why it matters most |
|------|------|---------------------|
| 1 | S1 — AI eats the core | Directly threatens a working demo; easy to slip into |
| 2 | T1 / T2 — security retrofitted, RLS recursion | Hard to fix late; a visible auth bug in the demo is fatal to the Technical score |
| 3 | C1 — no network to show | The entire value prop is the network; weak seed data = weak demo |
| 4 | U1 / U2 — reads as "LinkedIn for Muslims" / generic CRUD | Directly hits UX/Design and Innovation scores |
| 5 | V1 — Verified badge over-claims | Community-Focus and trust; also a real-world harm if shipped |
