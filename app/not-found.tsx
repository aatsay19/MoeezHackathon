import Link from "next/link";

import { Button } from "@/components/ui/button";
import { PageShell } from "@/components/page-shell";

export default function NotFound() {
  return (
    <PageShell className="max-w-md">
      <div className="flex flex-col items-center gap-4 py-16 text-center">
        <p className="font-heading text-5xl font-semibold text-muted-foreground">
          404
        </p>
        <h1 className="text-lg font-semibold">Page not found</h1>
        <p className="text-sm text-muted-foreground">
          The page you&apos;re looking for doesn&apos;t exist or has moved.
        </p>
        <Button asChild>
          <Link href="/">Back to home</Link>
        </Button>
      </div>
    </PageShell>
  );
}
