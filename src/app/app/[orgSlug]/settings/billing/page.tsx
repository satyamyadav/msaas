import { Button } from "@components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@components/ui/card";

import { computeUsageStats, getPlanLimits } from "@lib/server/links";
import { getBillingOverview } from "@lib/server/billing";
import { getOrganizationBySlugForUser } from "@lib/server/organizations";
import { getCurrentUser } from "@modules/auth/actions";

export default async function BillingSettingsPage({ params }: { params: { orgSlug: string } }) {
  const user = await getCurrentUser();
  if (!user) {
    return null;
  }

  const access = await getOrganizationBySlugForUser(params.orgSlug, user.id);
  if (!access) {
    return null;
  }

  const [billing, usage] = await Promise.all([
    getBillingOverview(access.organization.id),
    computeUsageStats(access.organization.id),
  ]);

  const limits = getPlanLimits(billing.planTier);

  return (
    <div className="grid gap-6 lg:grid-cols-2">
      <Card>
        <CardHeader>
          <CardTitle>Plan overview</CardTitle>
          <CardDescription>Your workspace is on the {billing.planTier} plan.</CardDescription>
        </CardHeader>
        <CardContent className="flex flex-col gap-3 text-sm text-muted-foreground">
          <div>
            <strong className="text-foreground">Links per month:</strong> {limits.linkCreateLimitPerMonth ? `${limits.linkCreateLimitPerMonth}` : "Unlimited"}
          </div>
          <div>
            <strong className="text-foreground">Custom domains:</strong> {limits.customDomainAllowance ?? "Unlimited"}
          </div>
          <div>
            <strong className="text-foreground">Analytics:</strong> {limits.analyticsLevel === "advanced" ? "Advanced" : "Basic"}
          </div>
          <div>
            <strong className="text-foreground">Current usage:</strong> {usage.linkCount} active links, {usage.clickCount} total clicks captured.
          </div>
          <div className="pt-2">
            {billing.subscription ? (
              <div className="space-y-1">
                <p>
                  <strong className="text-foreground">Status:</strong> {billing.subscription.status}
                </p>
                <p className="text-xs">Current period ends {billing.subscription.currentPeriodEnd.toDateString()}.</p>
              </div>
            ) : (
              <p className="text-xs">No subscription on file yet.</p>
            )}
          </div>
          <div className="flex items-center gap-2 pt-2">
            <Button size="sm">Open Stripe portal</Button>
            <Button size="sm" variant="outline">
              Upgrade to Pro
            </Button>
          </div>
        </CardContent>
      </Card>
      <Card>
        <CardHeader>
          <CardTitle>Usage tips</CardTitle>
          <CardDescription>Maximize the value of your plan.</CardDescription>
        </CardHeader>
        <CardContent className="text-sm text-muted-foreground">
          <ul className="list-disc space-y-2 pl-5">
            <li>Set up billing alerts to notify admins when approaching plan limits.</li>
            <li>Configure an annual plan to unlock the 2-month discount.</li>
            <li>Leverage advanced analytics on the Pro plan for geo and referrer breakdowns.</li>
          </ul>
        </CardContent>
      </Card>
    </div>
  );
}
