import { CheckCircle2, LockKeyhole, Sparkles, Workflow } from "lucide-react";
import { AuthShellPanel } from "@saas-template/ui";

import { BrandMark } from "@/components/brand-mark";

const highlights = [
  {
    description:
      "Secure Cognito-backed auth flows that stay aligned with AWS best practices.",
    icon: LockKeyhole,
    title: "Secure by default",
  },
  {
    description:
      "Reusable app shell primitives for the main product today and admin experiences later.",
    icon: Workflow,
    title: "Built for expansion",
  },
  {
    description:
      "Modern operator experience with clean feedback, polished states, and fewer dead ends.",
    icon: Sparkles,
    title: "Feels like a product",
  },
];

export function AuthMarketingPanel() {
  return (
    <AuthShellPanel
      eyebrow="SAAS Template"
      title="A scalable SaaS template for building your next product."
      description="From sign-up to password recovery, every flow should feel polished to the candidate and predictable to the team running it."
    >
      <div className="space-y-5">
        <BrandMark />
        <div className="grid gap-3">
          {highlights.map((item) => (
            <div
              key={item.title}
              className="flex gap-4 rounded-xl border border-border/60 bg-background/45 p-4"
            >
              <span className="mt-0.5 rounded-full bg-primary/10 p-2 text-primary">
                <item.icon className="size-4" />
              </span>
              <div>
                <p className="font-medium">{item.title}</p>
                <p className="mt-1 text-sm leading-6 text-muted-foreground">
                  {item.description}
                </p>
              </div>
            </div>
          ))}
        </div>
        <div className="rounded-xl border border-border/60 bg-background/45 p-5">
          <div className="flex items-center gap-2 text-sm font-medium">
            <CheckCircle2 className="size-4 text-primary" />
            Production-ready auth stack
          </div>
          <p className="mt-2 text-sm leading-6 text-muted-foreground">
            Cognito, NextAuth, typed backend contracts, and consistent UI
            building blocks living in one monorepo.
          </p>
        </div>
      </div>
    </AuthShellPanel>
  );
}
