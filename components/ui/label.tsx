import { forwardRef } from "react";
import { cn } from "@/lib/utils";

// jsx-a11y/label-has-associated-control can't see through this primitive
// to verify the htmlFor → input pairing; consumers must always pass htmlFor.
// All sites that use Label in this app do.
export const Label = forwardRef<HTMLLabelElement, React.LabelHTMLAttributes<HTMLLabelElement>>(
  ({ className, ...props }, ref) => (
    // eslint-disable-next-line jsx-a11y/label-has-associated-control
    <label
      ref={ref}
      className={cn(
        "text-sm leading-none font-medium peer-disabled:cursor-not-allowed peer-disabled:opacity-70",
        className,
      )}
      {...props}
    />
  ),
);
Label.displayName = "Label";
