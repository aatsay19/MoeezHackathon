import type { Metadata } from "next";

import { ComingSoon } from "@/components/coming-soon";
import { PageHeader, PageShell } from "@/components/page-shell";

export const metadata: Metadata = { title: "Verification queue" };

export default function AdminVerificationPage() {
  return (
    <PageShell>
      <PageHeader
        title="Verification queue"
        description="Review organizations and businesses that have requested verification."
      />
      <ComingSoon stage="Stage 3 — Profiles" />
    </PageShell>
  );
}
