import Link from "next/link";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { prisma } from "@/lib/db";
import { updateOrganizationPlanAction, updateOrganizationStatusAction } from "./actions";
import { OrganizationStatus, PlanTier } from "@prisma/client";

type SearchParams = Record<string, string | string[] | undefined>;

async function resolveSearchParams(searchParams?: Promise<SearchParams>) {
  if (!searchParams) {
    return undefined;
  }

  return await searchParams;
}

function getSearchQuery(searchParams?: SearchParams) {
  const value = searchParams?.q;
  if (Array.isArray(value)) {
    return value[0] ?? "";
  }
  return value ?? "";
}

export default async function AdminOrganizationsPage({
  searchParams,
}: {
  searchParams?: Promise<SearchParams>;
}) {
  const resolvedSearchParams = await resolveSearchParams(searchParams);
  const query = getSearchQuery(resolvedSearchParams);
  const organizations = await prisma.organization.findMany({
    where: query
      ? {
          OR: [
            { name: { contains: query, mode: "insensitive" } },
            { slug: { contains: query, mode: "insensitive" } },
          ],
        }
      : undefined,
    include: {
      _count: { select: { members: true } },
    },
    orderBy: { createdAt: "desc" },
  });

  return (
    <div className="flex flex-col gap-8">
      <header className="space-y-2">
        <h1 className="text-3xl font-semibold tracking-tight">Organizations</h1>
        <p className="text-sm text-muted-foreground">
          Search, inspect, and administrate any workspace in the platform.
        </p>
      </header>
      <Card>
        <CardHeader className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div className="space-y-1">
            <CardTitle>Directory</CardTitle>
            <CardDescription>{organizations.length} organizations</CardDescription>
          </div>
          <form className="w-full max-w-sm">
            <Input name="q" defaultValue={query} placeholder="Search by name or slug" />
          </form>
        </CardHeader>
        <CardContent className="overflow-x-auto">
          <table className="w-full min-w-[640px] text-sm">
            <thead className="text-left text-xs uppercase tracking-wide text-muted-foreground">
              <tr className="border-b">
                <th className="py-2 pr-4 font-medium">Name</th>
                <th className="px-4 py-2 font-medium">Members</th>
                <th className="px-4 py-2 font-medium">Plan</th>
                <th className="px-4 py-2 font-medium">Status</th>
                <th className="px-4 py-2 font-medium">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y">
              {organizations.map((organization) => {
                const isSuspended = organization.status === OrganizationStatus.SUSPENDED;
                return (
                  <tr key={organization.id} className="align-top">
                    <td className="py-3 pr-4">
                      <div className="flex flex-col">
                        <Link href={`/admin/orgs/${organization.id}`} className="font-medium hover:underline">
                          {organization.name}
                        </Link>
                        <span className="text-xs text-muted-foreground">{organization.slug}</span>
                      </div>
                    </td>
                    <td className="px-4 py-3">{organization._count.members}</td>
                    <td className="px-4 py-3">
                      <Badge variant="outline">{organization.planTier}</Badge>
                    </td>
                    <td className="px-4 py-3">
                      <Badge variant={isSuspended ? "destructive" : "secondary"}>{organization.status}</Badge>
                    </td>
                    <td className="px-4 py-3">
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
                            Update
                          </Button>
                        </form>
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </CardContent>
      </Card>
    </div>
  );
}
