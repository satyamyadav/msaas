import Link from "next/link";

import { startOfMonth } from "date-fns";

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@components/ui/card";
import { Button } from "@components/ui/button";
import { Badge } from "@components/ui/badge";

import { prisma } from "@lib/db";
import { getLinkAnalyticsSummary, computeUsageStats, getPlanLimits } from "@lib/server/links";
import { getOrganizationBySlugForUser } from "@lib/server/organizations";
import { getCurrentUser } from "@modules/auth/actions";

type Params = Promise<{ orgSlug: string }>;

export default async function OrganizationOverview({ params }: { params: Params }) {
  const { orgSlug } = await params;
  const user = await getCurrentUser();
  if (!user) {
    return null;
  }

  const access = await getOrganizationBySlugForUser(orgSlug, user.id);
  if (!access) {
    return null;
  }

  const { organization } = access;
  const usage = await computeUsageStats(organization.id);
  const planLimits = getPlanLimits(organization.planTier);
  const analytics = await getLinkAnalyticsSummary({
    organizationId: organization.id,
    from: new Date(Date.now() - 1000 * 60 * 60 * 24 * 7),
    to: new Date(),
  });
  const monthStart = startOfMonth(new Date());
  const linksCreatedThisMonth = await prisma.link.count({
    where: {
      organizationId: organization.id,
      createdAt: {
        gte: monthStart,
      },
    },
  });

  const checklist = organization.quickstart;

  const checklistItems = [
    {
      id: "created-first-link",
      label: "Create your first short link",
      completed: Boolean(checklist?.createdFirstLinkAt),
      href: `/app/${organization.slug}`,
    },
    {
      id: "invited-team",
      label: "Invite a teammate",
      completed: Boolean(checklist?.invitedTeamAt),
      href: `/app/${organization.slug}/settings/members`,
    },
    {
      id: "configure-domain",
      label: "Configure a custom domain",
      completed: Boolean(checklist?.configuredDomainAt),
      href: `/app/${organization.slug}/settings/domains`,
    },
    {
      id: "view-analytics",
      label: "Review analytics",
      completed: Boolean(checklist?.viewedAnalyticsAt),
      href: `/app/${organization.slug}/analytics`,
    },
  ];

  return (
    <div className="flex flex-col gap-6">
      <section className="grid gap-4 md:grid-cols-3">
        <Card>
          <CardHeader className="space-y-1">
            <CardTitle>Total links</CardTitle>
            <CardDescription>Active links in this workspace</CardDescription>
          </CardHeader>
          <CardContent>
            <p className="text-3xl font-bold">{usage.linkCount}</p>
            {planLimits.linkCreateLimitPerMonth ? (
              <p className="text-sm text-muted-foreground">
                {Math.max(planLimits.linkCreateLimitPerMonth - linksCreatedThisMonth, 0)} links remaining this month
              </p>
            ) : (
              <p className="text-sm text-muted-foreground">Unlimited on the Pro plan</p>
            )}
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="space-y-1">
            <CardTitle>Clicks this week</CardTitle>
            <CardDescription>Aggregated across all links</CardDescription>
          </CardHeader>
          <CardContent>
            <p className="text-3xl font-bold">{analytics.totalClicks}</p>
            <p className="text-sm text-muted-foreground">Across {analytics.topLinks.length} high performing links</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="space-y-1">
            <CardTitle>Unique visitors</CardTitle>
            <CardDescription>Approximate unique visitors across your links</CardDescription>
          </CardHeader>
          <CardContent>
            <p className="text-3xl font-bold">{analytics.uniqueVisitors}</p>
            <p className="text-sm text-muted-foreground">Based on hashed visitor identifiers</p>
          </CardContent>
        </Card>
      </section>

      <section className="grid gap-4 lg:grid-cols-3">
        <Card className="lg:col-span-2">
          <CardHeader className="flex flex-row items-center justify-between">
            <div>
              <CardTitle>Top links</CardTitle>
              <CardDescription>Your highest performing short links.</CardDescription>
            </div>
            <Button asChild variant="outline" size="sm">
              <Link href={`/app/${organization.slug}`}>Manage links</Link>
            </Button>
          </CardHeader>
          <CardContent>
            {analytics.topLinks.length ? (
              <ul className="space-y-3">
                {analytics.topLinks.map((item) => (
                  <li key={item.id} className="flex items-center justify-between gap-4 rounded border border-border/60 p-3">
                    <div className="flex flex-col">
                      <span className="text-sm font-medium">{item.slug}</span>
                      <span className="truncate text-xs text-muted-foreground">{item.destinationUrl}</span>
                    </div>
                    <div className="flex items-center gap-3 text-sm text-muted-foreground">
                      <span>
                        <strong className="text-foreground">{item.clickCount}</strong> clicks
                      </span>
                    </div>
                  </li>
                ))}
              </ul>
            ) : (
              <div className="flex h-32 items-center justify-center text-sm text-muted-foreground">
                No traffic yet—share your links to start collecting analytics.
              </div>
            )}
          </CardContent>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle>Launch checklist</CardTitle>
            <CardDescription>Complete the guided steps to unlock the full workspace experience.</CardDescription>
          </CardHeader>
          <CardContent>
            <ul className="space-y-3 text-sm">
              {checklistItems.map((item) => (
                <li key={item.id} className="flex items-start justify-between gap-3">
                  <div className="flex flex-col">
                    <span className="font-medium">{item.label}</span>
                    <Link href={item.href} className="text-xs text-primary underline">
                      {item.completed ? "View" : "Start"}
                    </Link>
                  </div>
                  {item.completed ? <Badge variant="secondary">Done</Badge> : <Badge>Pending</Badge>}
                </li>
              ))}
            </ul>
          </CardContent>
        </Card>
      </section>
    </div>
  );
}
