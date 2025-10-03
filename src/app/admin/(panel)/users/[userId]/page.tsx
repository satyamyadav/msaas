import { notFound } from "next/navigation";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { prisma } from "@/lib/db";
import { requireAdminUser } from "@/lib/server/admin-auth";
import { PlatformRole, UserStatus } from "@prisma/client";
import {
  impersonateUserAction,
  resetUserPasswordAction,
  updateUserRoleAction,
  updateUserStatusAction,
} from "../actions";

type AdminUserPageProps = {
  params: Promise<{ userId: string }>;
};

async function resolveParams(params: Promise<{ userId: string }>) {
  return params;
}

export default async function AdminUserDetailPage(props: AdminUserPageProps) {
  const { userId } = await resolveParams(props.params);
  const currentAdmin = await requireAdminUser();
  const user = await prisma.authUser.findUnique({
    where: { id: userId },
    include: {
      memberships: {
        include: {
          organization: true,
        },
        orderBy: { createdAt: "desc" },
      },
    },
  });

  if (!user) {
    notFound();
  }

  const isBlocked = user.status === UserStatus.BLOCKED;
  const canManagePlatformRoles = currentAdmin.platformRole === PlatformRole.SUPER_ADMIN;
  const targetIsSuperAdmin = user.platformRole === PlatformRole.SUPER_ADMIN;
  const canEditSuperAdmin = targetIsSuperAdmin ? canManagePlatformRoles : true;
  const disableRoleForm = !canManagePlatformRoles;

  return (
    <div className="flex flex-col gap-8">
      <header className="space-y-2">
        <h1 className="text-3xl font-semibold tracking-tight">{user.displayName ?? user.email}</h1>
        <p className="text-sm text-muted-foreground">{user.email}</p>
        <div className="flex flex-wrap gap-2 text-xs text-muted-foreground">
          <Badge variant="outline">{user.platformRole}</Badge>
          <Badge variant={isBlocked ? "destructive" : "secondary"}>{user.status}</Badge>
        </div>
      </header>
      <section className="grid gap-6 lg:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>Account controls</CardTitle>
            <CardDescription>Change status or role for this account.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4 text-sm">
            <form action={updateUserStatusAction} className="flex flex-wrap gap-2">
              <input type="hidden" name="userId" value={user.id} />
              <input type="hidden" name="status" value={isBlocked ? UserStatus.ACTIVE : UserStatus.BLOCKED} />
              <Button type="submit" variant={isBlocked ? "secondary" : "destructive"} disabled={!canEditSuperAdmin}>
                {isBlocked ? "Unblock user" : "Block user"}
              </Button>
            </form>
            <form action={updateUserRoleAction} className="flex flex-wrap items-center gap-2">
              <input type="hidden" name="userId" value={user.id} />
              <select
                name="platformRole"
                defaultValue={user.platformRole}
                className="h-9 rounded-md border border-input bg-background px-2 text-xs"
                disabled={disableRoleForm}
              >
                {Object.values(PlatformRole).map((role) => (
                  <option key={role} value={role}>
                    {role}
                  </option>
                ))}
              </select>
              <Button type="submit" variant="outline" disabled={disableRoleForm}>
                Update role
              </Button>
            </form>
            <form action={resetUserPasswordAction} className="flex flex-wrap items-center gap-2">
              <input type="hidden" name="userId" value={user.id} />
              <Input
                name="newPassword"
                type="password"
                minLength={8}
                required
                placeholder="New password"
                className="w-full sm:w-64"
              />
              <Button type="submit" disabled={!canEditSuperAdmin}>
                Reset password
              </Button>
            </form>
            {!canManagePlatformRoles ? (
              <p className="text-xs text-muted-foreground">Only super admins can adjust platform roles or super admin accounts.</p>
            ) : null}
          </CardContent>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle>Impersonation</CardTitle>
            <CardDescription>Start a session as this user to debug their experience.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-3 text-sm">
            <p className="text-muted-foreground">
              A new session will be created for this user and you will be redirected to the workspace experience. Use cautiously
              and remember to sign back in as an admin when finished.
            </p>
            <form action={impersonateUserAction}>
              <input type="hidden" name="userId" value={user.id} />
              <Button type="submit">Impersonate</Button>
            </form>
          </CardContent>
        </Card>
      </section>
      <Card>
        <CardHeader>
          <CardTitle>Organization memberships</CardTitle>
          <CardDescription>Organizations this user currently belongs to.</CardDescription>
        </CardHeader>
        <CardContent>
          {user.memberships.length === 0 ? (
            <p className="text-sm text-muted-foreground">This user is not a member of any organization.</p>
          ) : (
            <ul className="space-y-3 text-sm">
              {user.memberships.map((membership) => (
                <li key={membership.id} className="flex flex-col gap-1">
                  <span className="font-medium text-foreground">{membership.organization.name}</span>
                  <span className="text-xs text-muted-foreground">
                    Role: {membership.role} • Status: {membership.status}
                  </span>
                </li>
              ))}
            </ul>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
