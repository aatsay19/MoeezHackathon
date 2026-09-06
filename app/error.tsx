"use client";

import { useEffect } from "react";

import { Button } from "@/components/ui/button";
import { PageShell } from "@/components/page-shell";

export default function GlobalError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error(error);
  }, [error]);

  return (
    <PageShell className="max-w-md">
      <div className="flex flex-col items-center gap-4 py-16 text-center">
        <h1 className="text-lg font-semibold">Something went wrong</h1>
        <p className="text-sm text-muted-foreground">
          An unexpected error occurred. Please try again.
        </p>
        <Button onClick={reset}>Try again</Button>
      </div>
    </PageShell>
  );
}
