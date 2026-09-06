import type { Metadata } from "next";

import { ComingSoon } from "@/components/coming-soon";
import { PageHeader, PageShell } from "@/components/page-shell";

export const metadata: Metadata = { title: "My Opportunities" };

export default function MyOpportunitiesPage() {
  return (
    <PageShell>
      <PageHeader
        title="My Opportunities"
        description="Opportunities you posted, or posted on behalf of an organization you manage, and the people who responded."
      />
      <ComingSoon stage="Stage 6 — Engagement" />
    </PageShell>
  );
}
