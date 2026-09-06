import type { Metadata } from "next";

import { ComingSoon } from "@/components/coming-soon";
import { PageHeader, PageShell } from "@/components/page-shell";

export const metadata: Metadata = { title: "My Responses" };

export default function MyResponsesPage() {
  return (
    <PageShell>
      <PageHeader
        title="My Responses"
        description="Opportunities you applied to, RSVP'd for, or offered help on — and where each one stands."
      />
      <ComingSoon stage="Stage 6 — Engagement" />
    </PageShell>
  );
}
