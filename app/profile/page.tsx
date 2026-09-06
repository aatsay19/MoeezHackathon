import type { Metadata } from "next";

import { ComingSoon } from "@/components/coming-soon";
import { PageHeader, PageShell } from "@/components/page-shell";

export const metadata: Metadata = { title: "Profile" };

export default function ProfilePage() {
  return (
    <PageShell>
      <PageHeader
        title="Your Profile"
        description="How the community sees you: your skills, profession, interests, and location."
      />
      <ComingSoon stage="Stage 3 — Profiles" />
    </PageShell>
  );
}
