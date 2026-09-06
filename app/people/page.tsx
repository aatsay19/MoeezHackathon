import type { Metadata } from "next";

import { ComingSoon } from "@/components/coming-soon";
import { PageHeader, PageShell } from "@/components/page-shell";

export const metadata: Metadata = { title: "People" };

export default function PeoplePage() {
  return (
    <PageShell>
      <PageHeader
        title="People"
        description="Community members offering skills, looking to help, or open to opportunities."
      />
      <ComingSoon stage="Stage 3 — Profiles" />
    </PageShell>
  );
}
