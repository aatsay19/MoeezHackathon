import { Hammer } from "lucide-react";

/**
 * Placeholder used by routes whose real implementation lands in a later stage
 * (see docs/implementation-plan.md). Remove as each stage delivers its pages.
 */
export function ComingSoon({ stage }: { stage: string }) {
  return (
    <div className="flex flex-col items-center gap-3 rounded-xl border border-dashed bg-muted/30 px-6 py-16 text-center">
      <span className="flex size-10 items-center justify-center rounded-full bg-muted text-muted-foreground">
        <Hammer className="size-5" />
      </span>
      <p className="text-sm font-medium">This page is coming soon</p>
      <p className="max-w-sm text-sm text-muted-foreground">
        It will be built in <span className="font-medium">{stage}</span>. The
        scaffolding, design system, and navigation are in place.
      </p>
    </div>
  );
}
