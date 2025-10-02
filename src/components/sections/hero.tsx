import Link from "next/link";

import { Button } from "@components/ui/button";
import { Badge } from "@components/ui/badge";
import { getBillingProvider } from "@lib/feature-flags";

export function HeroSection() {
  const billingProvider = getBillingProvider();

  return (
    <section className="mx-auto flex w-full max-w-4xl flex-col items-center gap-6 px-6 pb-16 pt-20 text-center">
      <Badge className="tracking-[0.35em]">Modular SaaS Starter Kit</Badge>
      <h1 className="text-balance text-4xl font-bold sm:text-5xl">
        Launch faster with an ejectable monolith built on Next.js 14
      </h1>
      <p className="text-balance text-base text-muted-foreground sm:text-lg">
        Ship opinionated defaults—authentication, billing, and workspace management—while keeping every module ejectable.
        Feature flags determine what ships, and Prisma schema merging keeps your database in sync.
      </p>
      <div className="flex flex-wrap items-center justify-center gap-3">
        <Button asChild>
          <Link href="/sign-in?mode=register">Create workspace</Link>
        </Button>
        <Button asChild variant="outline">
          <Link href="/docs/getting-started">Read the docs</Link>
        </Button>
      </div>
      <div className="flex flex-wrap items-center justify-center gap-3 text-sm">
        <span className="inline-flex items-center gap-2 rounded-full bg-muted px-4 py-2 text-muted-foreground">
          <span className="h-2 w-2 rounded-full bg-emerald-500" /> Feature flags wired up
        </span>
        <span className="inline-flex items-center gap-2 rounded-full bg-muted px-4 py-2 text-muted-foreground">
          Stripe ready billing ({billingProvider})
        </span>
        <span className="inline-flex items-center gap-2 rounded-full bg-muted px-4 py-2 text-muted-foreground">
          Prisma schema merging
        </span>
      </div>
    </section>
  );
}
