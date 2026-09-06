import type { Metadata } from "next";

import { ComingSoon } from "@/components/coming-soon";
import { PageHeader, PageShell } from "@/components/page-shell";

export const metadata: Metadata = { title: "Settings" };

export default function SettingsPage() {
  return (
    <PageShell>
      <PageHeader
        title="Settings"
        description="Manage your account email, password, and profile visibility."
      />
      <ComingSoon stage="Stage 2 — Database & Authentication" />
    </PageShell>
  );
}
