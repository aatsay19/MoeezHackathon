# Ummah Connect — Design System

Status: Stage 0 design. Tokens and components are specified here; implementation lands
in Stage 1.
Last updated: 2026-09-05.

---

## 1. Design intent

The product must read as a **polished, trustworthy, community-oriented professional
platform**. It must not look like a generic CRUD dashboard, an admin panel, a
university project, or a social-media clone (README §10).

Three adjectives to hold every screen against: **trustworthy, calm, welcoming.**

- **Trustworthy** — generous whitespace, restrained color, real content hierarchy,
  visible verification cues, no dark patterns.
- **Calm** — one accent color, few font sizes, subtle shadows, minimal motion.
- **Welcoming** — warm neutral background (not stark white), friendly empty states,
  plain language, inclusive imagery.

Avoid mosque-cliché ornamentation (geometric filigree borders, gold gradients,
crescent-and-star iconography everywhere). A single tasteful geometric motif in the
logo / homepage hero is enough.

## 2. Foundations

### 2.1 Color tokens

Defined as CSS variables in `app/globals.css` and mapped in `tailwind.config.ts`.
Light theme is the primary target; dark theme is a nice-to-have and, if built, must
redefine every token (never leave a color defined only in one theme).

| Token | Light value (HSL) | Role |
|-------|-------------------|------|
| `--background` | `40 30% 98%` | warm off-white page background |
| `--foreground` | `215 25% 15%` | primary text |
| `--card` | `0 0% 100%` | card surface |
| `--card-foreground` | `215 25% 15%` | text on cards |
| `--muted` | `40 12% 94%` | subtle fills, table stripes |
| `--muted-foreground` | `215 12% 42%` | secondary text, metadata |
| `--border` | `215 16% 88%` | hairlines, input borders |
| `--input` | `215 16% 85%` | input border |
| `--ring` | `168 62% 34%` | focus ring (matches primary) |
| `--primary` | `168 62% 30%` | deep emerald/teal — brand, primary buttons, links |
| `--primary-foreground` | `0 0% 100%` | text on primary |
| `--secondary` | `40 14% 92%` | secondary buttons |
| `--secondary-foreground` | `215 25% 20%` | |
| `--accent` | `28 78% 52%` | warm amber — sparing highlights, "new", CTAs on dark hero |
| `--accent-foreground` | `0 0% 100%` | |
| `--destructive` | `0 72% 45%` | delete / error |
| `--destructive-foreground` | `0 0% 100%` | |
| `--success` | `152 55% 36%` | confirmations |
| `--warning` | `36 90% 45%` | pending states |

**Rationale for the emerald/teal primary:** green carries positive, trustworthy,
and culturally resonant associations for a Muslim audience without resorting to
literal religious iconography. Kept deep and desaturated so it reads professional,
not neon.

Radius: `--radius: 0.625rem` (10px). Cards `rounded-xl`, inputs/buttons `rounded-lg`,
badges `rounded-full`.

### 2.2 Typography

One typeface: **Inter** (via `next/font/google`), or the Next default **Geist** if
we want zero config. No secondary display font for the MVP — tighten headings with
`tracking-tight` instead.

| Style | Classes | Use |
|-------|---------|-----|
| Display | `text-4xl md:text-5xl font-semibold tracking-tight` | homepage hero |
| H1 | `text-2xl md:text-3xl font-semibold tracking-tight` | page titles |
| H2 | `text-xl font-semibold` | section headings |
| H3 | `text-base font-semibold` | card titles |
| Body | `text-sm md:text-[15px] leading-relaxed` | default |
| Meta | `text-xs text-muted-foreground` | timestamps, location, counts |
| Label | `text-sm font-medium` | form labels |

Line length capped around 70ch for descriptions (`max-w-prose`).

### 2.3 Spacing & layout

- Tailwind default 4px scale. Prefer `2 / 3 / 4 / 6 / 8 / 12 / 16`.
- Page container: `mx-auto w-full max-w-6xl px-4 md:px-6`.
- Vertical rhythm between page sections: `space-y-8` (mobile) / `space-y-12` (desktop).
- Card padding: `p-4 md:p-5`. Grid gap: `gap-4`.
- Feed grid: `grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4`.

### 2.4 Elevation & borders

- Cards: `border border-border bg-card shadow-sm`. Hover on interactive cards:
  `hover:shadow-md hover:border-border/70 transition-shadow`.
- Never stack more than one shadow level in a view. No colored shadows.

### 2.5 Motion

- Transitions on color/shadow/opacity only, `duration-150` to `duration-200`.
- Dialogs/sheets use the shadcn defaults. No parallax, no scroll-jacking, no
  entrance animations on lists. Respect `prefers-reduced-motion`.

### 2.6 Iconography

Lucide React, `size={16}` inline / `size={20}` standalone, `strokeWidth={1.75}`,
`currentColor`. Icons are always paired with text or an `aria-label`.

## 3. shadcn/ui component inventory

Install only what is used:

`button`, `card`, `badge`, `input`, `textarea`, `label`, `select`, `combobox`
(command + popover), `checkbox`, `dialog`, `alert-dialog`, `dropdown-menu`,
`avatar`, `tabs`, `separator`, `skeleton`, `sonner` (toast), `form`
(react-hook-form wrapper), `sheet` (mobile nav), `tooltip`, `alert`, `pagination`,
`popover`.

Not installed: anything for data tables, charts, carousels, command palettes beyond
the combobox, calendars beyond a basic date input.

### Button usage

| Variant | Use |
|---------|-----|
| `default` (primary) | the single main action on a screen (Post Opportunity, Apply, Save) |
| `secondary` | supporting actions |
| `outline` | tertiary / filter toggles |
| `ghost` | icon buttons, nav, low-emphasis |
| `destructive` | delete, always behind an `alert-dialog` confirm |
| `link` | inline navigation |

One primary button per view. Loading state: disabled + spinner + verb ("Posting…").

## 4. Domain components

### 4.1 Opportunity type — badge, icon, color

A single mapping object in `lib/constants.ts`, used everywhere.

| Type | Label | Lucide icon | Badge classes |
|------|-------|-------------|---------------|
| `job` | Job | `Briefcase` | `bg-blue-50 text-blue-700 border-blue-200` |
| `volunteer` | Volunteer | `HeartHandshake` | `bg-emerald-50 text-emerald-700 border-emerald-200` |
| `service` | Service | `Wrench` | `bg-violet-50 text-violet-700 border-violet-200` |
| `request` | Request for help | `HandHeart` | `bg-amber-50 text-amber-700 border-amber-200` |
| `space` | Space | `Building2` | `bg-cyan-50 text-cyan-700 border-cyan-200` |
| `event` | Event | `CalendarDays` | `bg-rose-50 text-rose-700 border-rose-200` |
| `other` | Other | `Sparkles` | `bg-slate-100 text-slate-700 border-slate-200` |

Badges are `rounded-full border px-2 py-0.5 text-xs font-medium inline-flex items-center gap-1`.
Dark theme gets a parallel muted mapping if dark is built.

### 4.2 Primary action per type

From `lib/constants.ts`, drives the button label and the `action` value written to
`opportunity_responses`.

| Type | Button label | `action` |
|------|--------------|----------|
| `job` | Apply | `apply` |
| `volunteer` | I'm Interested | `interested` |
| `event` | RSVP | `rsvp` |
| `request` | Offer Help | `offer_help` |
| `service` | Contact | `contact` |
| `space` | Contact | `contact` |
| `other` | I'm Interested | `interested` |

### 4.3 Verification badge

`VerifiedBadge({ status })`:

| Status | Render |
|--------|--------|
| `verified` | `BadgeCheck` icon + "Verified", `text-primary`, filled subtle background, tooltip "Identity confirmed by Ummah Connect" |
| `pending` | `Clock` icon + "Verification pending", `text-muted-foreground`, outline |
| `unverified` | nothing rendered (absence is the signal) |

The tooltip copy must state exactly what verified means so the badge does not
over-claim (see `risks.md` — trust risk).

### 4.4 Opportunity card anatomy

```
┌─────────────────────────────────────────────┐
│ [type badge]                    · 2 days ago │
│ Title (H3, 2-line clamp)                     │
│ ─────────────────────────────────────────── │
│ (avatar) Poster name  [VerifiedBadge]       │
│ (MapPin) City · (CalendarDays) Sat 10 AM    │
│                                             │
│ [Primary action ▸]           3 responses    │
└─────────────────────────────────────────────┘
```

- Whole card is a link to the detail page; the primary action is a nested button
  (`stopPropagation`).
- `response_count` shown only to the poster / org managers on their own cards.

### 4.5 Profile & organization headers

- Person: avatar (64–80px), name + profession, city, skill chips (max 6 + "+N"),
  bio below. Actions: Edit (own), (future) message — not built.
- Organization: logo, name + `VerifiedBadge`, `kind`/category, city, website link,
  description, "Team" (member avatars), then its opportunities.

### 4.6 Empty, loading, error states

Every list view ships all three:

- **Empty:** centered icon in a `bg-muted` circle, one-line explanation, one CTA
  (e.g. feed empty → "No opportunities match your filters" + "Clear filters").
- **Loading:** `Skeleton` cards matching the real layout (never a bare spinner for
  page-level loads).
- **Error:** `alert` with a plain-language message and a retry action; never a raw
  error string or stack.

## 5. Navigation

**Top bar (all users):** logo · Opportunities · Organizations · People · [Post
Opportunity] (primary button) · account menu / Log in.

**Account dropdown (authed):** Profile · My Opportunities · My Responses · Settings ·
(Admin → Verification, if `role = 'admin'`) · Log out.

**Mobile:** logo + hamburger → `Sheet` with the same links; "Post Opportunity" stays
visible as a compact primary button in the bar.

No breadcrumbs, no secondary sidebars, no mega-menus. Nav item count is fixed at the
list above (README §11).

## 6. Page inventory

| Route | Purpose | Auth |
|-------|---------|------|
| `/` | Homepage: value prop, 2 CTAs, ~6 live demo opportunities, "how it works" strip | public |
| `/opportunities` | Feed: filters (type, city), search, sort; card grid; pagination | public |
| `/opportunities/[id]` | Detail: full description, poster, action, (poster-only) responses | public read |
| `/opportunities/new` | Create form; Stage 7 adds "Draft with AI" | authed |
| `/opportunities/[id]/edit` | Edit form | creator / org manager |
| `/organizations` | Directory: filter by kind, verification, city; search | public |
| `/organizations/[slug]` | Org profile + its opportunities + team | public |
| `/organizations/new` | Create org/business | authed |
| `/organizations/[slug]/edit` | Edit; "Request verification" button | org manager |
| `/people` | People directory: search, skill filter, city filter | public |
| `/people/[id]` | Person profile | public |
| `/search` | Unified search across all four entity types, grouped | public |
| `/onboarding` | First-run: name, city, optional org creation | authed, once |
| `/profile` | Own profile view/edit shortcut | authed |
| `/settings` | Account: email, password, delete account | authed |
| `/my/opportunities` | Posted by me / my orgs, with response lists | authed |
| `/my/responses` | Opportunities I responded to + status | authed |
| `/admin/verification` | Approve pending org verifications | `role = 'admin'` |
| `/login` `/signup` `/reset` | Auth | public |

## 7. Content & voice

- Plain, warm, direct. "Post an opportunity", not "Create a new opportunity
  listing entity".
- Address the reader as "you". Refer to the community as "your community".
- Buttons are verbs. Errors say what happened and what to do next.
- Dates: relative for recency ("2 days ago"), absolute for future events
  ("Sat, Sep 13 · 10:00 AM").
- Never invent statistics or testimonials in the UI.

## 8. Accessibility checklist (enforced in Stage 8, designed for now)

- All interactive elements reachable and operable by keyboard; visible focus ring
  (`--ring`).
- Form fields have associated `<label>`; errors linked via `aria-describedby`.
- Color is never the only signal (type badges carry an icon + text; verification
  carries an icon + text).
- Contrast ≥ 4.5:1 for body text, ≥ 3:1 for large text and UI borders.
- Dialogs trap focus and restore it on close (shadcn default).
- Images have meaningful `alt`; decorative images `alt=""`.
- `prefers-reduced-motion` disables non-essential transitions.
- Page has one `<h1>`; headings are not skipped for styling.

## 9. Design tokens → Tailwind

`tailwind.config.ts` extends `colors` from the CSS variables
(`primary: 'hsl(var(--primary))'`, etc.), sets `borderRadius` from `--radius`, and
adds the `container` centering. shadcn's `components.json` uses the "new-york" style,
`baseColor: slate`, CSS variables enabled.
