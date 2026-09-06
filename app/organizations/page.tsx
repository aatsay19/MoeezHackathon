import type { Metadata } from "next";

import { ComingSoon } from "@/components/coming-soon";
import { PageHeader, PageShell } from "@/components/page-shell";

export const metadata: Metadata = { title: "Organizations" };

export default function OrganizationsPage() {
  return (
    <PageShell>
      <PageHeader
        title="Organizations & Businesses"
        description="Masajid, Islamic centers, nonprofits, and Muslim-owned businesses in your community."
      />
      <ComingSoon stage="Stage 3 — Profiles" />
    </PageShell>
  );
}
