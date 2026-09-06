import type { Metadata } from "next";

import { ComingSoon } from "@/components/coming-soon";
import { PageHeader, PageShell } from "@/components/page-shell";

export const metadata: Metadata = { title: "Post an Opportunity" };

export default function NewOpportunityPage() {
  return (
    <PageShell>
      <PageHeader
        title="Post an Opportunity"
        description="Share a job, volunteer need, event, service, space, or request. It takes about a minute."
      />
      <ComingSoon stage="Stage 4 — Opportunities" />
    </PageShell>
  );
}
