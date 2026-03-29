import * as React from "react";

import { cn } from "../lib/utils";

function Separator({
  className,
  orientation = "horizontal",
  decorative = true,
  ...props
}: React.ComponentProps<"div"> & {
  decorative?: boolean;
  orientation?: "horizontal" | "vertical";
}) {
  return (
    <div
      role={decorative ? "presentation" : "separator"}
      aria-orientation={orientation}
      data-orientation={orientation}
      data-slot="separator"
      className={cn(
        "shrink-0 bg-border/70",
        orientation === "horizontal" ? "h-px w-full" : "h-full w-px",
        className,
      )}
      {...props}
    />
  );
}

export { Separator };
