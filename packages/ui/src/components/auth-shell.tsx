import * as React from "react";

import { cn } from "../lib/utils";

function AuthShell({
  children,
  className,
  panel,
}: React.ComponentProps<"div"> & {
  panel?: React.ReactNode;
}) {
  return (
    <div
      className={cn(
        "relative min-h-screen overflow-hidden bg-[radial-gradient(circle_at_top_left,rgba(30,174,196,0.16),transparent_30%),radial-gradient(circle_at_bottom_right,rgba(14,165,233,0.14),transparent_28%),linear-gradient(180deg,var(--background),color-mix(in_oklab,var(--background)_86%,black_14%))]",
        className,
      )}
    >
      <div className="absolute inset-0 bg-[linear-gradient(rgba(255,255,255,0.03)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,0.03)_1px,transparent_1px)] bg-size-[48px_48px] opacity-40" />
      <div className="relative mx-auto flex min-h-screen w-full max-w-7xl items-center px-5 py-10 md:px-8">
        {panel ? (
          <div className="grid w-full gap-8 lg:grid-cols-[1.05fr_0.95fr] lg:items-center">
            <div className="hidden lg:block">{panel}</div>
            <div className="mx-auto w-full max-w-lg">{children}</div>
          </div>
        ) : (
          <div className="mx-auto flex w-full justify-center">
            <div className="w-full max-w-lg">{children}</div>
          </div>
        )}
      </div>
    </div>
  );
}

function AuthShellPanel({
  className,
  eyebrow,
  title,
  description,
  children,
}: React.ComponentProps<"div"> & {
  eyebrow?: React.ReactNode;
  title: React.ReactNode;
  description: React.ReactNode;
}) {
  return (
    <section
      className={cn(
        "rounded-[calc(var(--radius-3xl)+4px)] border border-border/60 bg-card/70 p-8 shadow-[0_40px_120px_-55px_rgba(8,15,28,0.8)] backdrop-blur",
        className,
      )}
    >
      {eyebrow ? (
        <div className="mb-6 inline-flex rounded-full border border-primary/20 bg-primary/10 px-3 py-1 text-xs font-medium text-primary">
          {eyebrow}
        </div>
      ) : null}
      <h1 className="max-w-xl font-heading text-4xl font-semibold tracking-tight text-balance">
        {title}
      </h1>
      <p className="mt-4 max-w-2xl text-base leading-7 text-muted-foreground">
        {description}
      </p>
      {children ? <div className="mt-8">{children}</div> : null}
    </section>
  );
}

export { AuthShell, AuthShellPanel };
