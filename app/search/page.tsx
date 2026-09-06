import type { Metadata } from "next";

import { ComingSoon } from "@/components/coming-soon";
import { PageHeader, PageShell } from "@/components/page-shell";

export const metadata: Metadata = { title: "Search" };

export default function SearchPage() {
  return (
    <PageShell>
      <PageHeader
        title="Search"
        description="Search across opportunities, people, organizations, and businesses."
      />
      <ComingSoon stage="Stage 5 — Discovery" />
    </PageShell>
  );
}
