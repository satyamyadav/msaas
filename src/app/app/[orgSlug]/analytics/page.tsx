import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@components/ui/card";
import { Badge } from "@components/ui/badge";

import { getOrganizationAnalyticsSnapshot } from "@lib/server/analytics";
import { markChecklistStep, getOrganizationBySlugForUser } from "@lib/server/organizations";
import { getCurrentUser } from "@modules/auth/actions";

export default async function AnalyticsPage({ params }: { params: { orgSlug: string } }) {
  const user = await getCurrentUser();
  if (!user) {
    return null;
  }

  const access = await getOrganizationBySlugForUser(params.orgSlug, user.id);
  if (!access) {
    return null;
  }

  await markChecklistStep(access.organization.id, "viewedAnalytics");

  const rangeEnd = new Date();
  const rangeStart = new Date(rangeEnd.getTime() - 1000 * 60 * 60 * 24 * 14);
  const snapshot = await getOrganizationAnalyticsSnapshot({
    organizationId: access.organization.id,
    from: rangeStart,
    to: rangeEnd,
  });

  return (
    <div className="grid gap-6 lg:grid-cols-3">
      <Card className="lg:col-span-3">
        <CardHeader>
          <CardTitle>Traffic timeline</CardTitle>
          <CardDescription>Clicks and unique visitors over the past two weeks.</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid gap-3 md:grid-cols-2 lg:grid-cols-4">
            {snapshot.timeline.map((point) => (
              <div key={point.date} className="rounded border border-border/60 bg-background p-3">
                <p className="text-xs text-muted-foreground">{point.date}</p>
                <p className="text-lg font-semibold">{point.clicks} clicks</p>
                <p className="text-xs text-muted-foreground">{point.uniqueVisitors} unique visitors</p>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      <Card className="lg:col-span-2">
        <CardHeader>
          <CardTitle>Top referrers</CardTitle>
          <CardDescription>Identify the channels driving the most traffic.</CardDescription>
        </CardHeader>
        <CardContent>
          <ul className="space-y-2 text-sm">
            {snapshot.topReferrers.length ? (
              snapshot.topReferrers.map((item) => (
                <li key={item.label} className="flex items-center justify-between rounded border border-border/60 px-3 py-2">
                  <span>{item.label}</span>
                  <Badge variant="outline">{item.value} clicks</Badge>
                </li>
              ))
            ) : (
              <li className="text-muted-foreground">No referral data yet.</li>
            )}
          </ul>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Top countries</CardTitle>
          <CardDescription>Geographic distribution of link clicks.</CardDescription>
        </CardHeader>
        <CardContent>
          <ul className="space-y-2 text-sm">
            {snapshot.topCountries.length ? (
              snapshot.topCountries.map((item) => (
                <li key={item.label} className="flex items-center justify-between rounded border border-border/60 px-3 py-2">
                  <span>{item.label}</span>
                  <Badge variant="outline">{item.value}</Badge>
                </li>
              ))
            ) : (
              <li className="text-muted-foreground">No geo data yet.</li>
            )}
          </ul>
        </CardContent>
      </Card>
    </div>
  );
}
