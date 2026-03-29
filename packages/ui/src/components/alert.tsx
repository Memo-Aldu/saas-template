import * as React from "react";
import { cva, type VariantProps } from "class-variance-authority";

import { cn } from "../lib/utils";

const alertVariants = cva(
  "relative grid gap-1 overflow-hidden rounded-lg border px-4 py-3 text-sm",
  {
    variants: {
      variant: {
        default: "border-border/70 bg-muted/40 text-foreground",
        destructive:
          "border-destructive/30 bg-destructive/10 text-destructive dark:border-destructive/20 dark:bg-destructive/15",
      },
    },
    defaultVariants: {
      variant: "default",
    },
  },
);

function Alert({
  className,
  variant,
  ...props
}: React.ComponentProps<"div"> & VariantProps<typeof alertVariants>) {
  return (
    <div
      role="alert"
      data-slot="alert"
      className={cn(alertVariants({ variant }), className)}
      {...props}
    />
  );
}

function AlertTitle({ className, ...props }: React.ComponentProps<"h5">) {
  return (
    <h5
      data-slot="alert-title"
      className={cn("font-medium leading-none tracking-tight", className)}
      {...props}
    />
  );
}

function AlertDescription({
  className,
  ...props
}: React.ComponentProps<"div">) {
  return (
    <div
      data-slot="alert-description"
      className={cn("text-sm leading-6 [&_p]:leading-6", className)}
      {...props}
    />
  );
}

export { Alert, AlertDescription, AlertTitle };
