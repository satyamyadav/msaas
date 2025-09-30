import { getBillingProvider } from "@lib/feature-flags";

export function HeroSection() {
  const billingProvider = getBillingProvider();

  return (
    <section className="mx-auto flex w-full max-w-4xl flex-col items-center gap-6 px-6 pb-12 pt-16 text-center">
      <span className="inline-flex items-center gap-2 rounded-full border border-primary/20 bg-primary/10 px-3 py-1 text-xs font-medium uppercase tracking-[0.3em] text-primary">
        Modular SaaS Starter Kit
      </span>
      <h1 className="text-balance text-4xl font-bold sm:text-5xl">
        Launch faster with an ejectable monolith built on Next.js 14
      </h1>
      <p className="text-balance text-base text-muted-foreground sm:text-lg">
        Ship opinionated defaults—authentication, billing, and workspace management—while keeping every module ejectable.
        Feature flags determine what ships, and Prisma schema merging keeps your database in sync.
      </p>
      <div className="flex flex-wrap items-center justify-center gap-4 text-sm">
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
