import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { getPlatformMetrics } from "@/lib/server/admin-dashboard";

function formatCurrency(value: number) {
  return new Intl.NumberFormat("en-US", { style: "currency", currency: "USD" }).format(value);
}

function formatPercent(value: number) {
  return new Intl.NumberFormat("en-US", { style: "percent", minimumFractionDigits: 1, maximumFractionDigits: 1 }).format(value);
}

export default async function AdminDashboardPage() {
  const metrics = await getPlatformMetrics();

  return (
    <div className="flex flex-col gap-10">
      <header className="space-y-2">
        <h1 className="text-4xl font-bold tracking-tight">Platform overview</h1>
        <p className="text-base text-muted-foreground">
          Monitor revenue, customer health, and administrative activity across your entire SaaS footprint.
        </p>
      </header>
      <section className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
        <Card>
          <CardHeader>
            <CardDescription>Monthly recurring revenue</CardDescription>
            <CardTitle className="text-3xl">{formatCurrency(metrics.mrr)}</CardTitle>
          </CardHeader>
        </Card>
        <Card>
          <CardHeader>
            <CardDescription>Active organizations</CardDescription>
            <CardTitle className="text-3xl">{metrics.activeOrganizations}</CardTitle>
          </CardHeader>
        </Card>
        <Card>
          <CardHeader>
            <CardDescription>Suspended organizations</CardDescription>
            <CardTitle className="text-3xl">{metrics.suspendedOrganizations}</CardTitle>
          </CardHeader>
        </Card>
        <Card>
          <CardHeader>
            <CardDescription>Active users</CardDescription>
            <CardTitle className="text-3xl">{metrics.activeUsers}</CardTitle>
          </CardHeader>
        </Card>
        <Card>
          <CardHeader>
            <CardDescription>Platform admins</CardDescription>
            <CardTitle className="text-3xl">{metrics.admins}</CardTitle>
          </CardHeader>
        </Card>
        <Card>
          <CardHeader>
            <CardDescription>Churn rate</CardDescription>
            <CardTitle className="text-3xl">{formatPercent(metrics.churnRate)}</CardTitle>
          </CardHeader>
          <CardContent className="text-sm text-muted-foreground">
            Calculated as suspended organizations over total organizations this month.
          </CardContent>
        </Card>
      </section>
    </div>
  );
}
