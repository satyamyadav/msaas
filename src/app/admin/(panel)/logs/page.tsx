import Link from "next/link";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { prisma } from "@/lib/db";

const PAGE_SIZE = 20;

type SearchParams = Record<string, string | string[] | undefined>;

async function resolveSearchParams(searchParams?: Promise<SearchParams>) {
  if (!searchParams) {
    return undefined;
  }

  return await searchParams;
}

function getPage(searchParams?: SearchParams) {
  const value = searchParams?.page;
  const raw = Array.isArray(value) ? value[0] : value;
  const parsed = raw ? Number.parseInt(raw, 10) : 1;
  return Number.isFinite(parsed) && parsed > 0 ? parsed : 1;
}

export default async function AdminLogsPage({
  searchParams,
}: {
  searchParams?: Promise<SearchParams>;
}) {
  const resolvedSearchParams = await resolveSearchParams(searchParams);
  const page = getPage(resolvedSearchParams);
  const skip = (page - 1) * PAGE_SIZE;

  const [logs, total] = await Promise.all([
    prisma.auditLog.findMany({
      include: { actor: true, organization: true },
      orderBy: { createdAt: "desc" },
      skip,
      take: PAGE_SIZE,
    }),
    prisma.auditLog.count(),
  ]);

  const totalPages = Math.max(1, Math.ceil(total / PAGE_SIZE));

  return (
    <div className="flex flex-col gap-8">
      <header className="space-y-2">
        <h1 className="text-3xl font-semibold tracking-tight">System logs</h1>
        <p className="text-sm text-muted-foreground">
          Review recent audit events across all organizations. Logs are paginated for faster navigation.
        </p>
      </header>
      <Card>
        <CardHeader className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
          <div className="space-y-1">
            <CardTitle>Audit trail</CardTitle>
            <CardDescription>
              Showing page {page} of {totalPages}.
            </CardDescription>
          </div>
          <div className="flex items-center gap-2">
            <Button asChild variant="outline" size="sm" disabled={page <= 1}>
              <Link href={`/admin/logs?page=${page - 1}`}>Previous</Link>
            </Button>
            <Button asChild variant="outline" size="sm" disabled={page >= totalPages}>
              <Link href={`/admin/logs?page=${page + 1}`}>Next</Link>
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          <ul className="space-y-4">
            {logs.map((log) => (
              <li key={log.id} className="rounded-lg border p-4 text-sm">
                <div className="flex flex-col gap-1">
                  <div className="flex flex-wrap items-center gap-2">
                    <span className="font-medium text-foreground">{log.action}</span>
                    <span className="text-xs text-muted-foreground">{log.organization.name}</span>
                  </div>
                  {log.description ? <p className="text-muted-foreground">{log.description}</p> : null}
                  <p className="text-xs text-muted-foreground">
                    {log.createdAt.toLocaleString()} • {log.actor?.email ?? "System"}
                  </p>
                </div>
              </li>
            ))}
            {logs.length === 0 ? (
              <li className="text-sm text-muted-foreground">No log entries found.</li>
            ) : null}
          </ul>
        </CardContent>
      </Card>
    </div>
  );
}
