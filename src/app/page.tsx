import Link from "next/link";
import { redirect } from "next/navigation";

import { ContactForm } from "@components/sections/contact-form";
import { Button } from "@components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@components/ui/card";
import { getOrganizationsForUser } from "@lib/server/organizations";
import { getCurrentUser } from "@modules/auth/actions";

const DEMO_SHORT_SLUG = "satyam";
const DEMO_SHORT_PATH = `/r/${DEMO_SHORT_SLUG}`;
const DEMO_SHORT_LINK = DEMO_SHORT_PATH;
const DEMO_DESTINATION = "https://www.linkedin.com/in/satyamyadav3/";

export default async function Home() {
  const sessionUser = await getCurrentUser();

  if (sessionUser) {
    const organizations = await getOrganizationsForUser(sessionUser.id);
    const defaultOrganization = organizations[0]?.organization.slug;
    const destination = defaultOrganization ? `/app/${defaultOrganization}` : "/app";
    redirect(destination);
  }

  return (
    <div className="flex flex-col">
      <section className="mx-auto flex w-full max-w-6xl flex-col items-center gap-6 px-6 pb-20 pt-16 text-center lg:pb-24 lg:pt-28">
        <span className="rounded-full border border-border/60 bg-background px-3 py-1 text-xs font-medium uppercase tracking-wide text-muted-foreground">
          Link platform for modern teams
        </span>
        <h1 className="text-balance text-4xl font-bold tracking-tight sm:text-5xl md:text-6xl">
          Shorten, brand, and track every link you share
        </h1>
        <p className="max-w-3xl text-balance text-lg text-muted-foreground">
          Modular SaaS gives your marketing and product teams a single place to create branded links, monitor
          performance, and collaborate on campaigns without juggling spreadsheets.
        </p>
        <div className="flex flex-col gap-3 sm:flex-row">
          <Button asChild size="lg">
            <Link href="/sign-in?mode=register">Create your free account</Link>
          </Button>
          <Button asChild size="lg" variant="outline">
            <Link href="/pricing">Explore pricing</Link>
          </Button>
        </div>
        <p className="text-sm text-muted-foreground">
          No credit card required · Start shortening links in under 2 minutes
        </p>
      </section>

      <section className="border-y border-border/60 bg-muted/40">
        <div className="mx-auto grid w-full max-w-6xl gap-10 px-6 py-16 lg:grid-cols-[1.1fr_0.9fr] lg:items-center">
          <div className="space-y-4">
            <h2 className="text-3xl font-semibold">Try a live short link</h2>
            <p className="text-muted-foreground">
              See what your audience experiences when they tap on one of your branded links. This demo uses the on
              platform short-link flow and is ready to share immediately.
            </p>
          </div>
          <Card className="overflow-hidden border-primary/20">
            <CardHeader className="space-y-2 bg-primary/5">
              <CardTitle className="text-base text-muted-foreground">Campaign snapshot</CardTitle>
              <CardDescription>Shareable short link featuring Satyam&apos;s public profile.</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4 pt-6">
              <div className="space-y-1">
                <p className="text-xs uppercase tracking-wide text-muted-foreground">Short link</p>
                <p className="rounded-md bg-background px-3 py-2 font-mono text-sm text-primary">
                  {DEMO_SHORT_LINK}
                </p>
              </div>
              <div className="space-y-1">
                <p className="text-xs uppercase tracking-wide text-muted-foreground">Destination</p>
                <p className="rounded-md bg-background px-3 py-2 font-mono text-sm text-muted-foreground">
                  {DEMO_DESTINATION}
                </p>
              </div>
            </CardContent>
            <CardFooter className="bg-primary/5">
              <Button asChild className="w-full">
                <Link href={DEMO_SHORT_PATH} target="_blank" rel="noreferrer">
                  Open the live demo
                </Link>
              </Button>
            </CardFooter>
          </Card>
        </div>
      </section>

      <section className="mx-auto w-full max-w-6xl px-6 py-16">
        <div className="space-y-4 text-center">
          <h2 className="text-3xl font-semibold">How it works</h2>
          <p className="mx-auto max-w-2xl text-muted-foreground">
            Go from lengthy URLs to branded experiences in three simple steps.
          </p>
        </div>
        <div className="mt-10 grid gap-6 lg:grid-cols-3">
          <Card className="border-border/60">
            <CardHeader>
              <span className="text-sm font-semibold text-primary">Step 1</span>
              <CardTitle>Connect your brand</CardTitle>
              <CardDescription>
                Bring your logo, custom domain, and team members. We&apos;ll keep everything in sync.
              </CardDescription>
            </CardHeader>
          </Card>
          <Card className="border-border/60">
            <CardHeader>
              <span className="text-sm font-semibold text-primary">Step 2</span>
              <CardTitle>Launch smarter links</CardTitle>
              <CardDescription>
                Generate short links, set expiration dates, add UTM parameters, and collaborate in shared
                workspaces.
              </CardDescription>
            </CardHeader>
          </Card>
          <Card className="border-border/60">
            <CardHeader>
              <span className="text-sm font-semibold text-primary">Step 3</span>
              <CardTitle>Monitor performance</CardTitle>
              <CardDescription>
                View real-time click analytics, top referrers, and geography insights to optimize every launch.
              </CardDescription>
            </CardHeader>
          </Card>
        </div>
      </section>

      <section className="border-y border-border/60 bg-muted/40">
        <div className="mx-auto w-full max-w-6xl px-6 py-16">
          <div className="space-y-4 text-center">
            <h2 className="text-3xl font-semibold">Simple, transparent pricing</h2>
            <p className="mx-auto max-w-2xl text-muted-foreground">
              Start for free and scale as your campaigns grow. Upgrade only when you&apos;re ready for advanced
              automation and analytics.
            </p>
          </div>
          <div className="mt-10 grid gap-6 lg:grid-cols-2">
            <Card className="border-border/60">
              <CardHeader>
                <CardTitle className="text-2xl font-bold">Free</CardTitle>
                <CardDescription>Everything you need to launch your first branded campaigns.</CardDescription>
              </CardHeader>
              <CardContent className="space-y-3 text-sm text-muted-foreground">
                <p>
                  <span className="text-4xl font-semibold text-foreground">$0</span> / month
                </p>
                <ul className="list-disc space-y-2 pl-5">
                  <li>100 tracked links</li>
                  <li>2 custom domains</li>
                  <li>Real-time click analytics</li>
                  <li>Team collaboration for up to 3 teammates</li>
                </ul>
              </CardContent>
              <CardFooter>
                <Button asChild className="w-full">
                  <Link href="/sign-in?mode=register">Create a free workspace</Link>
                </Button>
              </CardFooter>
            </Card>

            <Card className="border-primary/40 shadow-lg shadow-primary/10">
              <CardHeader>
                <CardTitle className="text-2xl font-bold">Growth</CardTitle>
                <CardDescription>
                  Unlock automation, premium analytics, and priority support for scaling teams.
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-3 text-sm text-muted-foreground">
                <p>
                  <span className="text-4xl font-semibold text-foreground">$99</span> / month
                </p>
                <ul className="list-disc space-y-2 pl-5">
                  <li>Unlimited tracked links</li>
                  <li>Advanced routing &amp; expirations</li>
                  <li>Custom reporting &amp; webhooks</li>
                  <li>Dedicated success manager</li>
                </ul>
              </CardContent>
              <CardFooter>
                <Button asChild className="w-full" variant="secondary">
                  <Link href="/sign-in?mode=register">Talk to sales</Link>
                </Button>
              </CardFooter>
            </Card>
          </div>
        </div>
      </section>

      <section className="mx-auto grid w-full max-w-6xl gap-10 px-6 py-16 lg:grid-cols-[0.9fr_1.1fr] lg:items-center">
        <div className="space-y-4">
          <h2 className="text-3xl font-semibold">Let&apos;s build your next campaign</h2>
          <p className="text-muted-foreground">
            Have a question about integrations, security, or enterprise pricing? Drop us a note and our team will
            respond within one business day.
          </p>
        </div>
        <ContactForm />
      </section>
    </div>
  );
}
