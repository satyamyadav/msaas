import * as React from "react";
import { cva, type VariantProps } from "class-variance-authority";

import { cn } from "@lib/utils";

const badgeVariants = cva(
  "inline-flex items-center rounded-full border px-2.5 py-0.5 text-xs font-semibold uppercase tracking-[0.25em]",
  {
    variants: {
      variant: {
        default:
          "border-primary/20 bg-primary/10 text-[0.6rem] text-primary",
        secondary:
          "border-muted bg-muted text-[0.6rem] text-muted-foreground",
        outline: "border-border text-[0.6rem] text-muted-foreground",
      },
    },
    defaultVariants: {
      variant: "default",
    },
  },
);

export interface BadgeProps
  extends React.HTMLAttributes<HTMLDivElement>,
    VariantProps<typeof badgeVariants> {}

export function Badge({ className, variant, ...props }: BadgeProps) {
  return (
    <div className={cn(badgeVariants({ variant }), className)} {...props} />
  );
}
