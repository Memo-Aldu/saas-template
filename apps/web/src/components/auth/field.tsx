import * as React from "react";

import { Label } from "@saas-template/ui";

import { cn } from "@/lib/utils";

export function Field({
  children,
  className,
  description,
  error,
  htmlFor,
  label,
}: {
  children: React.ReactNode;
  className?: string;
  description?: string;
  error?: string;
  htmlFor: string;
  label: string;
}) {
  return (
    <div className={cn("space-y-2", className)}>
      <Label htmlFor={htmlFor}>{label}</Label>
      {children}
      {description ? (
        <p className="text-xs leading-5 text-muted-foreground">{description}</p>
      ) : null}
      {error ? (
        <p className="text-xs leading-5 text-destructive">{error}</p>
      ) : null}
    </div>
  );
}
