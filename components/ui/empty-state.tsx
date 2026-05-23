import type { ReactNode } from "react";
import { cn } from "@/lib/utils";

/**
 * Generic empty-state for list pages. Pakikisama-friendly copy is the
 * caller's responsibility — pass supportive language like "No branches yet.
 * Add one to get started." not "No data found."
 */
export function EmptyState({
  title,
  description,
  action,
  className,
}: {
  title: string;
  description?: string;
  action?: ReactNode;
  className?: string;
}) {
  return (
    <div
      className={cn(
        "border-border bg-muted/30 flex flex-col items-center justify-center rounded-lg border border-dashed px-6 py-16 text-center",
        className,
      )}
    >
      <p className="text-base font-medium">{title}</p>
      {description ? <p className="text-muted-foreground mt-1 text-sm">{description}</p> : null}
      {action ? <div className="mt-4">{action}</div> : null}
    </div>
  );
}
