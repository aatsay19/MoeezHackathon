import type { Metadata } from "next";

import { ComingSoon } from "@/components/coming-soon";
import { PageHeader, PageShell } from "@/components/page-shell";

export const metadata: Metadata = { title: "Log in" };

export default function LoginPage() {
  return (
    <PageShell className="max-w-md">
      <PageHeader title="Log in" description="Welcome back to Ummah Connect." />
      <ComingSoon stage="Stage 2 — Database & Authentication" />
    </PageShell>
  );
}
