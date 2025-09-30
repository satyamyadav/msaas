import { Metadata } from "next";
import { notFound } from "next/navigation";

import { getBillingProvider, getModuleCopy, isFeatureEnabled } from "@lib/feature-flags";

export const metadata: Metadata = {
  title: "Billing",
};

export default function BillingPage() {
  const billingProvider = getBillingProvider();

  if (!isFeatureEnabled("billing-stripe") || billingProvider !== "stripe") {
    notFound();
  }

  const moduleMeta = getModuleCopy("billing-stripe");

  return (
    <main className="mx-auto flex min-h-[calc(100vh-6rem)] w-full max-w-6xl flex-col gap-12 p-6">
      <header className="space-y-3">
        <p className="text-sm font-semibold uppercase tracking-[0.3em] text-muted-foreground">
          {moduleMeta.displayName}
        </p>
        <h1 className="text-4xl font-bold">Billing control center</h1>
        <p className="max-w-3xl text-balance text-base text-muted-foreground">{moduleMeta.description}</p>
      </header>
      <section className="mx-auto flex max-w-3xl flex-col gap-6">
        <header className="space-y-2">
          <p className="text-sm font-semibold uppercase tracking-[0.2em] text-muted-foreground">@msaas/billing-stripe</p>
          <h2 className="text-3xl font-bold">Billing &amp; subscriptions</h2>
          <p className="text-base text-muted-foreground">
            Configure your Stripe integration, manage products, and inspect webhook delivery without leaving the starter kit.
          </p>
        </header>
        <section className="grid gap-4 rounded-2xl border border-border bg-card p-6 text-card-foreground shadow-sm sm:grid-cols-2">
          <div>
            <h3 className="text-lg font-semibold">Test keys</h3>
            <p className="text-sm text-muted-foreground">
              Store environment variables securely and sync them across environments once you connect a live Stripe account.
            </p>
          </div>
          <form className="grid gap-3 text-sm">
            <label className="flex flex-col gap-1">
              <span className="font-medium">Publishable key</span>
              <input
                type="text"
                className="rounded-lg border border-border bg-background px-3 py-2 focus:outline-none focus:ring-2 focus:ring-primary"
                placeholder="pk_test_..."
              />
            </label>
            <label className="flex flex-col gap-1">
              <span className="font-medium">Secret key</span>
              <input
                type="password"
                className="rounded-lg border border-border bg-background px-3 py-2 focus:outline-none focus:ring-2 focus:ring-primary"
                placeholder="sk_test_..."
              />
            </label>
            <button
              type="submit"
              className="inline-flex h-10 items-center justify-center rounded-lg bg-primary px-3 font-semibold text-primary-foreground transition hover:bg-primary/90"
            >
              Save credentials
            </button>
          </form>
        </section>
        <section className="grid gap-4 rounded-2xl border border-dashed border-border/60 bg-muted/30 p-6 text-muted-foreground">
          <h3 className="text-lg font-semibold text-foreground">Webhooks</h3>
          <p className="text-sm">
            The Stripe webhook endpoint is scaffolded under
            <code className="ml-1 rounded bg-muted px-2 py-1 text-xs">/api/stripe/webhook</code>. Use the CLI to eject and
            customize handlers as your business logic grows.
          </p>
        </section>
      </section>
    </main>
  );
}
