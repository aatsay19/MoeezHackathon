import type { Metadata } from "next";

import { ComingSoon } from "@/components/coming-soon";
import { PageHeader, PageShell } from "@/components/page-shell";

export const metadata: Metadata = { title: "Welcome" };

export default function OnboardingPage() {
  return (
    <PageShell>
      <PageHeader
        title="Welcome to Ummah Connect"
        description="Tell us a little about yourself, and optionally add an organization or business you represent."
      />
      <ComingSoon stage="Stage 2 — Database & Authentication" />
    </PageShell>
  );
}
