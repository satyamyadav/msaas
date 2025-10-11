import type { Metadata } from "next";
import Link from "next/link";
import { Check } from "lucide-react";

import { Button } from "@components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@components/ui/card";

export const metadata: Metadata = {
  title: "Pricing",
  description: "Simple, usage based pricing that grows with your campaigns.",
};

const plans = [
  {
    name: "Starter",
    price: "$0",
    cadence: "forever",
    description: "Perfect for trying out the platform and personal projects.",
    ctaLabel: "Get started",
    ctaHref: "/sign-in?mode=register",
    highlighted: false,
    features: [
      "1 workspace",
      "Up to 5 teammates",
      "1,000 tracked clicks per month",
      "Community support",
    ],
  },
  {
    name: "Growth",
    price: "$49",
    cadence: "per month",
    description: "Unlock automation, custom domains, and advanced analytics.",
    ctaLabel: "Start free trial",
    ctaHref: "/sign-in?mode=register",
    highlighted: true,
    features: [
      "Unlimited workspaces",
      "Advanced analytics",
      "Rules based link routing",
      "Priority email support",
    ],
  },
  {
    name: "Enterprise",
    price: "Talk to us",
    cadence: "",
    description: "For large teams that need custom contracts, SSO, and SLAs.",
    ctaLabel: "Contact sales",
    ctaHref: "mailto:sales@modularsaas.dev",
    highlighted: false,
    features: [
      "Dedicated success manager",
      "Custom security review",
      "Guaranteed uptime SLAs",
      "Modular onboarding",
    ],
  },
];

export default function PricingPage() {
  return (
    <div className="mx-auto flex w-full max-w-5xl flex-col gap-10 px-6 py-12">
      <header className="mx-auto max-w-2xl text-center space-y-3">
        <h1 className="text-4xl font-semibold">Flexible plans for every stage</h1>
        <p className="text-muted-foreground">
          Start for free, then scale to automation and enterprise controls as your campaigns grow. Upgrade or downgrade anytime.
        </p>
      </header>
      <div className="grid gap-6 md:grid-cols-3">
        {plans.map((plan) => (
          <Card
            key={plan.name}
            className={plan.highlighted ? "border-primary/50 shadow-lg shadow-primary/10" : undefined}
          >
            <CardHeader className="space-y-2">
              <CardTitle className="flex items-baseline justify-between text-2xl font-semibold">
                {plan.name}
                <span className="text-lg font-medium text-muted-foreground">
                  {plan.price} {plan.cadence && <span className="text-sm">{plan.cadence}</span>}
                </span>
              </CardTitle>
              <CardDescription>{plan.description}</CardDescription>
            </CardHeader>
            <CardContent>
              <ul className="space-y-3 text-sm text-muted-foreground">
                {plan.features.map((feature) => (
                  <li key={feature} className="flex items-start gap-2">
                    <Check className="mt-0.5 h-4 w-4 text-primary" />
                    <span>{feature}</span>
                  </li>
                ))}
              </ul>
            </CardContent>
            <CardFooter>
              <Button asChild variant={plan.highlighted ? "default" : "outline"} className="w-full">
                <Link href={plan.ctaHref}>{plan.ctaLabel}</Link>
              </Button>
            </CardFooter>
          </Card>
        ))}
      </div>
      <div className="rounded-lg border border-dashed border-border/60 bg-muted/30 p-6 text-sm text-muted-foreground">
        Need a custom plan or migrate an existing short link catalog? Email <a className="underline" href="mailto:sales@modularsaas.dev">sales@modularsaas.dev</a> and we&apos;ll craft a migration plan in under 48 hours.
      </div>
    </div>
  );
}
