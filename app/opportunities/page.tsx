import type { Metadata } from "next";

import { ComingSoon } from "@/components/coming-soon";
import { PageHeader, PageShell } from "@/components/page-shell";

export const metadata: Metadata = { title: "Opportunities" };

export default function OpportunitiesPage() {
  return (
    <PageShell>
      <PageHeader
        title="Opportunities"
        description="Jobs, volunteering, events, services, spaces, and requests for help from across your community."
      />
      <ComingSoon stage="Stage 4 — Opportunities" />
    </PageShell>
  );
}
