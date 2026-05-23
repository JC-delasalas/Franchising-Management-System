import { cva, type VariantProps } from "class-variance-authority";
import { cn } from "@/lib/utils";

/**
 * Status badges. Per Franchise.md voice rule: neutral language only.
 * Use Badge variant="warning" for "needs review", "outline" for inactive,
 * never red+"violator"-style. Build per-status semantic mappers (e.g.
 * branchStatusToBadge()) when wiring real status data.
 */
const badgeVariants = cva(
  "focus:ring-ring inline-flex items-center rounded-full border px-2.5 py-0.5 text-xs font-semibold transition-colors focus:ring-2 focus:ring-offset-2 focus:outline-none",
  {
    variants: {
      variant: {
        default: "bg-primary text-primary-foreground border-transparent",
        secondary: "bg-secondary text-secondary-foreground border-transparent",
        outline: "text-foreground",
        success:
          "border-transparent bg-emerald-100 text-emerald-900 dark:bg-emerald-950 dark:text-emerald-100",
        warning:
          "border-transparent bg-amber-100 text-amber-900 dark:bg-amber-950 dark:text-amber-100",
        destructive: "bg-destructive text-destructive-foreground border-transparent",
      },
    },
    defaultVariants: { variant: "default" },
  },
);

export interface BadgeProps
  extends React.HTMLAttributes<HTMLSpanElement>, VariantProps<typeof badgeVariants> {}

export function Badge({ className, variant, ...props }: BadgeProps) {
  return <span className={cn(badgeVariants({ variant }), className)} {...props} />;
}

export { badgeVariants };
