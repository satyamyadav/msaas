import Link from "next/link";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { prisma } from "@/lib/db";
import { PlatformRole, UserStatus } from "@prisma/client";
import { updateUserRoleAction, updateUserStatusAction } from "./actions";

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

export default async function AdminUsersPage({
  searchParams,
}: {
  searchParams?: Promise<SearchParams>;
}) {
  const resolvedSearchParams = await resolveSearchParams(searchParams);
  const query = getSearchQuery(resolvedSearchParams);
  const users = await prisma.authUser.findMany({
    where: query
      ? {
          OR: [
            { email: { contains: query, mode: "insensitive" } },
            { displayName: { contains: query, mode: "insensitive" } },
          ],
        }
      : undefined,
    orderBy: { createdAt: "desc" },
  });

  return (
    <div className="flex flex-col gap-8">
      <header className="space-y-2">
        <h1 className="text-3xl font-semibold tracking-tight">Users</h1>
        <p className="text-sm text-muted-foreground">
          View every account, manage permissions, and act on behalf of end users.
        </p>
      </header>
      <Card>
        <CardHeader className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div className="space-y-1">
            <CardTitle>Directory</CardTitle>
            <CardDescription>{users.length} users</CardDescription>
          </div>
          <form className="w-full max-w-sm">
            <Input name="q" defaultValue={query} placeholder="Search by email or name" />
          </form>
        </CardHeader>
        <CardContent className="overflow-x-auto">
          <table className="w-full min-w-[640px] text-sm">
            <thead className="text-left text-xs uppercase tracking-wide text-muted-foreground">
              <tr className="border-b">
                <th className="py-2 pr-4 font-medium">User</th>
                <th className="px-4 py-2 font-medium">Role</th>
                <th className="px-4 py-2 font-medium">Status</th>
                <th className="px-4 py-2 font-medium">Joined</th>
                <th className="px-4 py-2 font-medium">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y">
              {users.map((user) => {
                const isBlocked = user.status === UserStatus.BLOCKED;
                return (
                  <tr key={user.id} className="align-top">
                    <td className="py-3 pr-4">
                      <div className="flex flex-col">
                        <Link href={`/admin/users/${user.id}`} className="font-medium hover:underline">
                          {user.displayName ?? user.email}
                        </Link>
                        <span className="text-xs text-muted-foreground">{user.email}</span>
                      </div>
                    </td>
                    <td className="px-4 py-3">
                      <form action={updateUserRoleAction} className="flex items-center gap-2">
                        <input type="hidden" name="userId" value={user.id} />
                        <select
                          name="platformRole"
                          defaultValue={user.platformRole}
                          className="h-9 rounded-md border border-input bg-background px-2 text-xs"
                        >
                          {Object.values(PlatformRole).map((role) => (
                            <option key={role} value={role}>
                              {role}
                            </option>
                          ))}
                        </select>
                        <Button type="submit" size="sm" variant="outline">
                          Update
                        </Button>
                      </form>
                    </td>
                    <td className="px-4 py-3">
                      <Badge variant={isBlocked ? "destructive" : "secondary"}>{user.status}</Badge>
                    </td>
                    <td className="px-4 py-3 text-muted-foreground">
                      {user.createdAt.toLocaleDateString()}
                    </td>
                    <td className="px-4 py-3">
                      <form action={updateUserStatusAction}>
                        <input type="hidden" name="userId" value={user.id} />
                        <input
                          type="hidden"
                          name="status"
                          value={isBlocked ? UserStatus.ACTIVE : UserStatus.BLOCKED}
                        />
                        <Button type="submit" size="sm" variant={isBlocked ? "secondary" : "destructive"}>
                          {isBlocked ? "Unblock" : "Block"}
                        </Button>
                      </form>
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
