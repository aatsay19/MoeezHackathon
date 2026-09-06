import type { Metadata } from "next";

import { ComingSoon } from "@/components/coming-soon";
import { PageHeader, PageShell } from "@/components/page-shell";

export const metadata: Metadata = { title: "Reset password" };

export default function ResetPasswordPage() {
  return (
    <PageShell className="max-w-md">
      <PageHeader
        title="Reset your password"
        description="We'll email you a link to set a new password."
      />
      <ComingSoon stage="Stage 2 — Database & Authentication" />
    </PageShell>
  );
}
