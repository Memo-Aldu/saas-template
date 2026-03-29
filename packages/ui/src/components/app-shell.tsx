import * as React from "react";

import { cn } from "../lib/utils";

function AppShell({
  className,
  children,
}: React.ComponentProps<"div">) {
  return (
    <div
      className={cn(
        "min-h-screen bg-[radial-gradient(circle_at_top,rgba(45,212,191,0.12),transparent_22%),linear-gradient(180deg,color-mix(in_oklab,var(--background)_94%,black_6%),var(--background))] text-foreground",
        className,
      )}
    >
      {children}
    </div>
  );
}

function AppShellHeader({
  className,
  children,
}: React.ComponentProps<"header">) {
  return (
    <header
      className={cn(
        "sticky top-0 z-30 border-b border-border/60 bg-background/75 backdrop-blur-xl",
        className,
      )}
    >
      {children}
    </header>
  );
}

function AppShellBody({ className, ...props }: React.ComponentProps<"main">) {
  return (
    <main
      className={cn("mx-auto flex w-full max-w-7xl flex-1 flex-col px-5 py-8 md:px-8", className)}
      {...props}
    />
  );
}

function StatePanel({
  className,
  title,
  description,
  actions,
  children,
}: React.ComponentProps<"section"> & {
  title: React.ReactNode;
  description?: React.ReactNode;
  actions?: React.ReactNode;
}) {
  return (
    <section
      className={cn(
        "rounded-[calc(var(--radius-2xl)+2px)] border border-border/70 bg-card/90 p-6 shadow-[0_24px_80px_-45px_rgba(15,23,42,0.5)]",
        className,
      )}
    >
      <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
        <div className="space-y-1">
          <h2 className="font-heading text-xl font-semibold tracking-tight">{title}</h2>
          {description ? (
            <p className="text-sm leading-6 text-muted-foreground">{description}</p>
          ) : null}
        </div>
        {actions ? <div className="flex items-center gap-2">{actions}</div> : null}
      </div>
      {children ? <div className="mt-5">{children}</div> : null}
    </section>
  );
}

export { AppShell, AppShellBody, AppShellHeader, StatePanel };
