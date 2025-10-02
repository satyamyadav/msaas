import { Metadata } from "next";
import { notFound } from "next/navigation";

import { Badge } from "@components/ui/badge";
import { Button } from "@components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@components/ui/card";
import { Input } from "@components/ui/input";
import { Label } from "@components/ui/label";
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
        <Badge>{moduleMeta.displayName}</Badge>
        <h1 className="text-4xl font-bold">Billing control center</h1>
        <p className="max-w-3xl text-balance text-base text-muted-foreground">{moduleMeta.description}</p>
      </header>
      <section className="mx-auto flex max-w-3xl flex-col gap-6">
        <div className="space-y-3 text-left">
          <p className="text-xs font-semibold uppercase tracking-[0.3em] text-muted-foreground">@msaas/billing-stripe</p>
          <h2 className="text-3xl font-bold">Billing &amp; subscriptions</h2>
          <p className="text-base text-muted-foreground">
            Configure your Stripe integration, manage products, and inspect webhook delivery without leaving the starter kit.
          </p>
        </div>
        <Card className="sm:grid sm:grid-cols-2">
          <CardHeader className="space-y-3">
            <CardTitle className="text-xl">Test keys</CardTitle>
            <CardDescription>
              Store environment variables securely and sync them across environments once you connect a live Stripe account.
            </CardDescription>
          </CardHeader>
          <CardContent className="flex flex-col gap-3 sm:border-l sm:border-border">
            <form className="flex flex-col gap-3 text-sm">
              <div className="space-y-2">
                <Label htmlFor="stripe-publishable">Publishable key</Label>
                <Input id="stripe-publishable" placeholder="pk_test_..." />
              </div>
              <div className="space-y-2">
                <Label htmlFor="stripe-secret">Secret key</Label>
                <Input id="stripe-secret" type="password" placeholder="sk_test_..." />
              </div>
              <Button type="submit" className="w-full">
                Save credentials
              </Button>
            </form>
          </CardContent>
        </Card>
        <Card className="border-dashed border-border/60 bg-muted/30">
          <CardHeader>
            <CardTitle className="text-lg">Webhooks</CardTitle>
            <CardDescription>
              The Stripe webhook endpoint is scaffolded under
              <code className="ml-1 rounded bg-muted px-2 py-1 text-xs">/api/stripe/webhook</code>. Use the CLI to eject and
              customize handlers as your business logic grows.
            </CardDescription>
          </CardHeader>
        </Card>
      </section>
    </main>
  );
}
