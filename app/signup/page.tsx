import type { Metadata } from "next";

import { ComingSoon } from "@/components/coming-soon";
import { PageHeader, PageShell } from "@/components/page-shell";

export const metadata: Metadata = { title: "Sign up" };

export default function SignupPage() {
  return (
    <PageShell className="max-w-md">
      <PageHeader
        title="Create your account"
        description="Join the network connecting people, organizations, and businesses."
      />
      <ComingSoon stage="Stage 2 — Database & Authentication" />
    </PageShell>
  );
}
