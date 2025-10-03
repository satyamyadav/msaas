import { notFound } from "next/navigation";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { prisma } from "@/lib/db";
import { updateOrganizationPlanAction, updateOrganizationStatusAction } from "../actions";
import { OrganizationStatus, PlanTier } from "@prisma/client";

type AdminOrganizationPageProps = {
  params: Promise<{ orgId: string }>;
};

async function resolveParams(params: Promise<{ orgId: string }>) {
  return params;
}

export default async function AdminOrganizationDetailPage(props: AdminOrganizationPageProps) {
  const { orgId } = await resolveParams(props.params);
  const organization = await prisma.organization.findUnique({
    where: { id: orgId },
    include: {
      members: {
        include: { user: true },
        orderBy: { createdAt: "desc" },
        take: 10,
      },
      auditLogs: {
        orderBy: { createdAt: "desc" },
        take: 5,
        include: { actor: true },
      },
      subscriptions: true,
    },
  });

  if (!organization) {
    notFound();
  }

  const isSuspended = organization.status === OrganizationStatus.SUSPENDED;

  return (
    <div className="flex flex-col gap-8">
      <div className="flex flex-col gap-2">
        <h1 className="text-3xl font-semibold tracking-tight">{organization.name}</h1>
        <p className="text-sm text-muted-foreground">Workspace slug: {organization.slug}</p>
        <div className="flex flex-wrap gap-2 text-xs text-muted-foreground">
          <Badge variant="outline">{organization.planTier} plan</Badge>
          <Badge variant={isSuspended ? "destructive" : "secondary"}>{organization.status}</Badge>
        </div>
      </div>
      <section className="grid gap-6 lg:grid-cols-2">
        <Card>
          <CardHeader className="flex flex-col gap-2 lg:flex-row lg:items-center lg:justify-between">
            <div className="space-y-1">
              <CardTitle>Status</CardTitle>
              <CardDescription>Control availability and billing tier.</CardDescription>
            </div>
            <div className="flex flex-wrap gap-2">
              <form action={updateOrganizationStatusAction}>
                <input type="hidden" name="organizationId" value={organization.id} />
                <input
                  type="hidden"
                  name="status"
                  value={isSuspended ? OrganizationStatus.ACTIVE : OrganizationStatus.SUSPENDED}
                />
                <Button type="submit" variant={isSuspended ? "secondary" : "destructive"} size="sm">
                  {isSuspended ? "Activate" : "Suspend"}
                </Button>
              </form>
              <form action={updateOrganizationPlanAction} className="flex items-center gap-2">
                <input type="hidden" name="organizationId" value={organization.id} />
                <select
                  name="planTier"
                  defaultValue={organization.planTier}
                  className="h-9 rounded-md border border-input bg-background px-2 text-xs"
                >
                  {Object.values(PlanTier).map((plan) => (
                    <option key={plan} value={plan}>
                      {plan}
                    </option>
                  ))}
                </select>
                <Button type="submit" size="sm" variant="outline">
                  Update plan
                </Button>
              </form>
            </div>
          </CardHeader>
          <CardContent className="space-y-3 text-sm text-muted-foreground">
            <p>Created {organization.createdAt.toDateString()}</p>
            {organization.suspendedAt ? <p>Suspended {organization.suspendedAt.toDateString()}</p> : null}
            <p>Members: {organization.members.length}</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle>Recent activity</CardTitle>
            <CardDescription>Latest audit events across the workspace.</CardDescription>
          </CardHeader>
          <CardContent>
            <ul className="space-y-3 text-sm">
              {organization.auditLogs.map((log) => (
                <li key={log.id} className="space-y-1">
                  <p className="font-medium text-foreground">{log.action}</p>
                  {log.description ? <p className="text-muted-foreground">{log.description}</p> : null}
                  <p className="text-xs text-muted-foreground">
                    {log.createdAt.toLocaleString()} by {log.actor?.email ?? "System"}
                  </p>
                </li>
              ))}
              {organization.auditLogs.length === 0 ? (
                <li className="text-sm text-muted-foreground">No audit events recorded.</li>
              ) : null}
            </ul>
          </CardContent>
        </Card>
      </section>
      <Card>
        <CardHeader>
          <CardTitle>Key members</CardTitle>
          <CardDescription>Showing the 10 most recent members.</CardDescription>
        </CardHeader>
        <CardContent className="overflow-x-auto">
          <table className="w-full min-w-[520px] text-sm">
            <thead className="text-left text-xs uppercase tracking-wide text-muted-foreground">
              <tr className="border-b">
                <th className="py-2 pr-4 font-medium">User</th>
                <th className="px-4 py-2 font-medium">Role</th>
                <th className="px-4 py-2 font-medium">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y">
              {organization.members.map((member) => (
                <tr key={member.id}>
                  <td className="py-3 pr-4">
                    <div className="flex flex-col">
                      <span className="font-medium">{member.user.displayName ?? member.user.email}</span>
                      <span className="text-xs text-muted-foreground">{member.user.email}</span>
                    </div>
                  </td>
                  <td className="px-4 py-3">
                    <Badge variant="outline">{member.role}</Badge>
                  </td>
                  <td className="px-4 py-3 text-muted-foreground">{member.status}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </CardContent>
      </Card>
    </div>
  );
}
