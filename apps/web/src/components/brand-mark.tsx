import Link from "next/link";

import { cn } from "@/lib/utils";

export function BrandMark({
  className,
  href = "/",
}: {
  className?: string;
  href?: string;
}) {
  return (
    <Link
      href={href}
      className={cn("inline-flex items-center gap-3", className)}
    >
      <span className="flex size-10 items-center justify-center rounded-2xl bg-primary text-sm font-semibold text-primary-foreground shadow-lg shadow-primary/25">
        PT
      </span>
      <span>
        <span className="block font-heading text-base font-semibold tracking-tight">
          Product template
        </span>
        <span className="block text-xs text-muted-foreground">
          Scalable Starter App
        </span>
      </span>
    </Link>
  );
}
