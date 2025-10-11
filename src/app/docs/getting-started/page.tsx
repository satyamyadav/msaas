import type { Metadata } from "next";
import Link from "next/link";

import { Button } from "@components/ui/button";

export const metadata: Metadata = {
  title: "Getting started",
  description: "Walk through the essentials to launch a workspace and invite your team.",
};

const steps = [
  {
    title: "Create your account",
    description:
      "Start by creating a free account with email magic links. You'll automatically spin up your first workspace.",
  },
  {
    title: "Invite teammates",
    description:
      "Head to Settings → Members to add collaborators. Role-based access control keeps billing and admin tasks safe.",
  },
  {
    title: "Connect billing",
    description:
      "When you're ready to upgrade, connect Stripe billing from the workspace dashboard in just a few clicks.",
  },
];

export default function GettingStartedPage() {
  return (
    <div className="space-y-10">
      <div className="space-y-3">
        <p className="text-sm font-medium uppercase tracking-wide text-primary">Documentation</p>
        <h1 className="text-3xl font-semibold">Getting started</h1>
        <p className="text-muted-foreground">
          Follow these quick steps to stand up your first workspace with sensible defaults. Everything can be customized later.
        </p>
      </div>
      <ol className="space-y-8">
        {steps.map((step, index) => (
          <li key={step.title} className="space-y-2">
            <div className="flex items-baseline gap-3">
              <span className="text-sm font-semibold text-muted-foreground">{index + 1}.</span>
              <h2 className="text-2xl font-semibold">{step.title}</h2>
            </div>
            <p className="text-muted-foreground">{step.description}</p>
          </li>
        ))}
      </ol>
      <div className="flex flex-wrap items-center gap-4 rounded-lg border border-border/80 bg-muted/40 p-6">
        <div className="space-y-1">
          <h2 className="text-xl font-semibold">Ready to explore the dashboard?</h2>
          <p className="text-sm text-muted-foreground">
            Spin up a workspace with sample data to learn how navigation, billing, and modules plug together.
          </p>
        </div>
        <Button asChild>
          <Link href="/sign-in?mode=register">Create your free account</Link>
        </Button>
      </div>
    </div>
  );
}
