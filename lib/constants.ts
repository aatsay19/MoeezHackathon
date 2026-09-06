/**
 * Shared domain constants. Single source of truth for opportunity types, the
 * per-type response action, navigation, and the small curated lists used by
 * comboboxes. Keep UI in sync by importing from here rather than re-declaring.
 */

import type { LucideIcon } from "lucide-react";
import {
  Briefcase,
  Building2,
  CalendarDays,
  HandHeart,
  HeartHandshake,
  Sparkles,
  Wrench,
} from "lucide-react";

export const APP_NAME = "Ummah Connect";
export const APP_TAGLINE = "Connect with your community.";
export const APP_DESCRIPTION =
  "Find opportunities, share your skills, and support Muslim organizations and businesses — all in one searchable network.";

// ---------------------------------------------------------------------------
// Opportunity types
// ---------------------------------------------------------------------------

export const OPPORTUNITY_TYPES = [
  "job",
  "volunteer",
  "service",
  "request",
  "space",
  "event",
  "other",
] as const;

export type OpportunityType = (typeof OPPORTUNITY_TYPES)[number];

export type ResponseAction =
  "apply" | "interested" | "rsvp" | "offer_help" | "contact";

interface OpportunityTypeMeta {
  label: string;
  /** Short helper shown on the create form. */
  hint: string;
  icon: LucideIcon;
  /** Tailwind classes for the type badge (light theme). */
  badgeClass: string;
  action: ResponseAction;
  actionLabel: string;
}

export const OPPORTUNITY_TYPE_META: Record<
  OpportunityType,
  OpportunityTypeMeta
> = {
  job: {
    label: "Job",
    hint: "A paid role at an organization or business.",
    icon: Briefcase,
    badgeClass: "bg-blue-50 text-blue-700 border-blue-200",
    action: "apply",
    actionLabel: "Apply",
  },
  volunteer: {
    label: "Volunteer",
    hint: "Unpaid help your community needs.",
    icon: HeartHandshake,
    badgeClass: "bg-emerald-50 text-emerald-700 border-emerald-200",
    action: "interested",
    actionLabel: "I'm Interested",
  },
  service: {
    label: "Service",
    hint: "A professional service or trade you offer.",
    icon: Wrench,
    badgeClass: "bg-violet-50 text-violet-700 border-violet-200",
    action: "contact",
    actionLabel: "Contact",
  },
  request: {
    label: "Request for help",
    hint: "Ask the community for support.",
    icon: HandHeart,
    badgeClass: "bg-amber-50 text-amber-700 border-amber-200",
    action: "offer_help",
    actionLabel: "Offer Help",
  },
  space: {
    label: "Space",
    hint: "A room, venue, or rental that's available.",
    icon: Building2,
    badgeClass: "bg-cyan-50 text-cyan-700 border-cyan-200",
    action: "contact",
    actionLabel: "Contact",
  },
  event: {
    label: "Event",
    hint: "A gathering people can attend.",
    icon: CalendarDays,
    badgeClass: "bg-rose-50 text-rose-700 border-rose-200",
    action: "rsvp",
    actionLabel: "RSVP",
  },
  other: {
    label: "Other",
    hint: "Any other community need.",
    icon: Sparkles,
    badgeClass: "bg-slate-100 text-slate-700 border-slate-200",
    action: "interested",
    actionLabel: "I'm Interested",
  },
};

// ---------------------------------------------------------------------------
// Organizations
// ---------------------------------------------------------------------------

export const ORGANIZATION_KINDS = ["organization", "business"] as const;
export type OrganizationKind = (typeof ORGANIZATION_KINDS)[number];

export const VERIFICATION_STATUSES = [
  "unverified",
  "pending",
  "verified",
] as const;
export type VerificationStatus = (typeof VERIFICATION_STATUSES)[number];

/** What the "Verified" badge actually attests to. Shown in its tooltip. */
export const VERIFIED_BADGE_MEANING =
  "Identity confirmed by Ummah Connect: we checked this organization's website and a matching email address.";

// ---------------------------------------------------------------------------
// Location — a small curated list keeps filtering reliable for the MVP.
// Swap for the real target metro before seeding demo data.
// ---------------------------------------------------------------------------

export const CITY_OPTIONS = [
  "Chicago, IL",
  "Rogers Park, Chicago",
  "Devon Avenue, Chicago",
  "Bridgeview, IL",
  "Villa Park, IL",
  "Skokie, IL",
  "Naperville, IL",
  "Evanston, IL",
] as const;

// ---------------------------------------------------------------------------
// Skills / interests suggestions (free tags; this list only powers autocomplete)
// ---------------------------------------------------------------------------

export const SKILL_SUGGESTIONS = [
  "Software engineering",
  "Web development",
  "Graphic design",
  "Accounting",
  "Bookkeeping",
  "Legal advice",
  "Immigration law",
  "Teaching",
  "Quran instruction",
  "Arabic",
  "Tutoring",
  "Event planning",
  "Fundraising",
  "Grant writing",
  "Social media",
  "Marketing",
  "Photography",
  "Videography",
  "Carpentry",
  "Plumbing",
  "Electrical",
  "Catering",
  "Halal food service",
  "Translation",
  "Counseling",
  "Healthcare",
  "Nursing",
  "Childcare",
  "Youth mentorship",
  "Project management",
  "Data analysis",
  "IT support",
] as const;

// ---------------------------------------------------------------------------
// Navigation
// ---------------------------------------------------------------------------

export const PRIMARY_NAV = [
  { label: "Opportunities", href: "/opportunities" },
  { label: "Organizations", href: "/organizations" },
  { label: "People", href: "/people" },
] as const;

export const ACCOUNT_NAV = [
  { label: "Profile", href: "/profile" },
  { label: "My Opportunities", href: "/my/opportunities" },
  { label: "My Responses", href: "/my/responses" },
  { label: "Settings", href: "/settings" },
] as const;
