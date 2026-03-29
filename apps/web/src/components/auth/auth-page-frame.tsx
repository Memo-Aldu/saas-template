import { BrandMark } from "@/components/brand-mark";

export function AuthPageFrame({
  children,
  description = "A clean auth flow for product templates, starter apps, and dashboards.",
  title = "Welcome back",
}: {
  children: React.ReactNode;
  description?: string;
  title?: string;
}) {
  return (
    <div className="mx-auto flex w-full max-w-xl flex-col items-center">
      <BrandMark className="justify-center" />
      <div className="mt-8 mb-8 text-center">
        <h1 className="font-heading text-4xl font-semibold tracking-tight">
          {title}
        </h1>
        <p className="mt-3 text-sm leading-6 text-muted-foreground">
          {description}
        </p>
      </div>
      <div className="w-full">{children}</div>
    </div>
  );
}
